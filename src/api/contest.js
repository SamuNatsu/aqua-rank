/* Contest */
import _ from 'lodash'
import { useRemoteStore } from '../store/remote'

class Contest {
  // Singleton
  static #__instance__ = null
  static getInstance() {
    if (Contest.#__instance__ === null)
      Contest.#__instance__ = new Contest()

    return Contest.#__instance__
  }

  title = null
  startTime = null
  endTime = null
  contestMap = null
  problemList = null
  teamMap = null
  lastUpdate = 0
  teamStatusMap = new Map()
  firstBloodList = new Set()
  rank = []
  lastRank = new Map()

  async init(contestIdList) {
    const remote = useRemoteStore()

    let res = await remote.fetchContestList(contestIdList)
    if (res.code < 0)
      return res
    res = res.data

    let tmp = _.xor([...res.keys()], contestIdList)
    if (tmp.length !== 0)
      return { code: -1, msg: 'Contest not available: ' + tmp.join(', ') }

    try {
      const base = res.get(contestIdList[0])
      res.forEach((v, k)=>{
        if (v.start_time !== base.start_time || v.end_time !== base.end_time)
          throw 'Contest start/end time different: ' + k
      })
    } catch (msg) {
      return { code: -1, msg }
    }

    this.title = res.get(contestIdList[0]).title
    this.startTime = res.get(contestIdList[0]).start_time
    this.endTime = res.get(contestIdList[0]).end_time
    this.contestMap = res

    res = await remote.fetchProblemList(contestIdList)
    if (res.code < 0)
      return res
    res = res.data

    try {
      const base = res.get(contestIdList[0])
      res.forEach((v, k)=>{
        if (_.xor(base, v).length !== 0)
          throw 'Contest problem different: ' + k
      })
    } catch (msg) {
      return { code: -1, msg }
    }

    this.problemList = res.get(contestIdList[0])

    res = await remote.fetchTeamList(contestIdList)
    if (res.code < 0)
      return res
    this.teamMap = res.data

    return { code: 0 }
  }

  async update(all) {
    const remote = useRemoteStore()
    
    if (all === true) {
      this.lastUpdate = 0
      this.teamStatusMap.clear()
    }

    const newUpdateTime = new Date().getTime()
    let res = await remote.fetchSolutionListByContests([...this.contestMap.keys()], new Date(this.lastUpdate))
    if (res.code < 0)
      return res
    res = res.data

    res.forEach((v)=>{
      const teamKey = v.team_id + '@' + v.contest_id
      if (!this.teamStatusMap.has(teamKey)) {
        const tmp = []
        for (let i = 0; i < this.problemList.length; ++i)
          tmp.push({
            id: i,
            result: 'none',
            tries: 0,
            penalty: 0,
            frozenTries: 0
          })
        this.teamStatusMap.set(teamKey, tmp)
      }

      const problemIdx = this.problemList.findIndex((p)=>p.problem_id === v.problem_id)
      const current = this.teamStatusMap.get(teamKey)[problemIdx]
      switch (v.result) {
        case 4:   // AC
          if (['first_blood', 'accepted'].includes(current.result))
            break

          if (current.result !== 'pending')
            current.tries++

          current.penalty += Math.trunc((v.in_date - new Date(this.startTime).getTime() / 1000) / 60) 
 
          if (this.firstBloodList.has(v.problem_id)) {
            current.result = 'first_blood'
            this.firstBloodList.add(v.problem_id)
          } else {
            current.result = 'accepted'
          }

          break
        case -1: // Frozen
          if (['first_blood', 'accepted'].includes(current.result))
            break

          current.result = 'frozen'
          current.frozenTries++
          break
        case 5:   // PE
        case 6:   // WA
        case 7:   // TLE
        case 8:   // MLE
        case 9:   // OLE
        case 10:  // RE
        case 11:  // CE
          if (['first_blood', 'accepted'].includes(current.result))
            break

          current.result = 'wrong_answer'
          current.tries++
          current.penalty += 20
          break
        case 13:  // Tested
        case 100: // Unknown
          break
        case 0:   // Pending
        case 1:   // Pending Rejudging
        case 2:   // Compiling
        case 3:   // Running Rejudging
          if (['first_blood', 'accepted', 'pending'].includes(current.result))
            break

          current.result = 'pending'
          current.tries++
          break
      }
    })

    const ret = []
    this.teamStatusMap.forEach((v, k)=>{
      let solved = 0, penalty = 0
      v.filter((t)=>['first_blood', 'accepted'].includes(t.result)).forEach((t)=>{
        solved++
        penalty += t.penalty
      })
      ret.push({
        id: k,
        team_id: this.teamMap.get(k).team_id,
        school: this.teamMap.get(k).school,
        name: this.teamMap.get(k).name,
        solved,
        penalty,
        status: v
      })
    })
    ret.sort((a, b)=>{
      if (a.solved === b.solved) {
        if (a.penalty === b.penalty) {
          return a.name < b.name ? -1 : 1
        } else {
          return a.penalty - b.penalty
        }
      } else {
        return b.solved - a.solved
      }
    })
    const newRank = new Map()
    ret.forEach((value, index, self)=>{
      if (index === 0) {
        self[index].rank = 1
        newRank.set(value.id, 1)
        return
      }

      if (value.solved === self[index - 1].solved && value.penalty === self[index - 1].penalty) {
        self[index].rank = self[index - 1].rank
        newRank.set(value.id, self[index - 1].rank)
      } else {
        self[index].rank = index + 1
        newRank.set(value.id, index + 1)
      }
    })
    ret.forEach((v, i, self)=>{
      if (!this.lastRank.has(v.id))
        self[i].change = 'up'
      else if (v.rank < this.lastRank.get(v.id))
        self[i].change = 'up'
      else if (v.rank > this.lastRank.get(v.id))
        self[i].change = 'down'
    })

    this.rank = ret
    this.lastRank = newRank
    this.lastUpdate = newUpdateTime
    return { code: 0 }
  }
}

export { Contest }
