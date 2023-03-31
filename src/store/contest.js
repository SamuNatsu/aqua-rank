/* Contest store */
import { defineStore } from 'pinia'
import _ from 'lodash'
import { useApiStore } from './api'

// Non reactive variables
let problemNum = 0
let problemIdList = []
let firstBloodList = []
let teamInfoMap = {}          // <team_id>_<contest_id> => team_info
let teamStatusMap = {}

// Functions
const getSqlTime = (date)=>{
  let Y = date.getFullYear()
  let M = date.getMonth() + 1
  let D = date.getDate()
  let h = date.getHours()
  let m = date.getMinutes()
  let s = date.getSeconds()

  if (M < 10)
    M = '0' + M
  if (D < 10)
    D = '0' + D
  if (h < 10)
    h = '0' + h
  if (m < 10)
    m = '0' + m
  if (s < 10)
    s = '0' + s

  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

// Export
export const useContestStore = defineStore('contest', {
  state: ()=>({
    title: "",
    startTime: "2022-12-07 18:00:00",
    endTime: "",
    contestList: "",
    mergeList: [],
    lastUpdateTime: null,
    rank: []
  }),
  actions: {
    async init() {
      const api = useApiStore()

      // Get problem list
      let res = await api.fetchProblemList(this.mergeList)
      if (res.code !== 0)
        return res

      // Group problems by contest ID
      const ctt = {}  // contest_id => [problem]
      res.data.forEach((problem)=>{
        if (!_.has(ctt, problem.contest_id))
          ctt[problem.contest_id] = []

        ctt[problem.contest_id].push(problem)
      })

      // Check if all required contests are available
      const kctt = _.keys(ctt)  // [contest_id]
      const xctt = _.xor(this.mergeList, kctt)
      if (xctt.length !== 0)
        return { code: 1, msg: 'Contest ' + xctt.join(', ') + ' not found' }

      // Check if all contests' problems are the same
      for (let i = 1; i < kctt.length; ++i) {
        if (ctt[kctt[i]].length !== ctt[kctt[0]].length)
          return { code: 1, msg: 'Merge failed, difference found' }

        for (let j = 0; j < ctt[kctt[0]].length; ++j)
          if (ctt[kctt[i]][j].problem_id !== ctt[kctt[0]][j].problem_id)
            return { code: 1, msg: 'Merge failed, difference found' }
      }

      // Save problem information
      problemNum = ctt[kctt[0]].length
      ctt[kctt[0]].forEach((problem)=>{
        problemIdList.push(problem.problem_id)
      })

      // Get team list
      res = await api.fetchTeamList(this.mergeList)
      if (res.code !== 0)
        return res

      // Save team information
      res.data.forEach((team)=>{
        teamInfoMap[team.team_id + '_' + team.contest_id] = team
      })

      // Get history solutions
      res = await api.fetchSolutionList(this.mergeList, getSqlTime(new Date(0)))
      if (res.code !== 0)
        return res
      
      // Generate current rank
      const patch = this.genPatch(res.data)
      console.log(patch)
    },
    genPatch(solutions) {
      const ret = {}
      const template = new Array(problemNum).fill(null)
      template.forEach((__, index, ref)=>{
        ref[index] = _.cloneDeep({
          result: 'none',
          tries: 0,
          penalty: 0,
          frozenTries: 0
        })
      })

      solutions.forEach((solution)=>{
        const teamKey = solution.team_id + '_' + solution.contest_id

        // Check team not presented in patch
        if (!_.has(ret, teamKey))
          ret[teamKey] = _.cloneDeep(template)

        const problemIdx = problemIdList.indexOf(solution.problem_id)
        const isSkip = ()=>{
          return ['first_blood', 'accepted'].includes(ret[teamKey][problemIdx].result)
        }

        // Update patch
        switch (solution.result) {
          case 4:   // AC
            if (isSkip())
              break

            if (firstBloodList.includes(problemIdx))
              ret[teamKey][problemIdx].result = 'accepted'
            else {
              firstBloodList.push(problemIdx)
              ret[teamKey][problemIdx].result = 'first_blood'
            }

            ret[teamKey][problemIdx].tries++
            ret[teamKey][problemIdx].penalty += Math.trunc((new Date(solution.in_date).getTime() - new Date(this.startTime).getTime()) / 1000 / 60)
            break
          case 127: // Frozen
            if (isSkip())
              break

            ret[teamKey][problemIdx].result = 'frozen'
            ret[teamKey][problemIdx].frozenTries++
            break
          case 1:   // Pending Rejudging
          case 3:   // Running Rejudging
            ret[teamKey][problemIdx].result = 'rejudge'
            ret[teamKey][problemIdx]
            break
          case 5:   // PE
          case 6:   // WA
          case 7:   // TLE
          case 8:   // MLE
          case 9:   // OLE
          case 10:  // RE
          case 11:  // CE
            if (isSkip())
              break

            ret[teamKey][problemIdx].result = 'wrong_answer'
            ret[teamKey][problemIdx].tries++
            ret[teamKey][problemIdx].penalty += 20
            break
          case 13:  // Tested
          case 100: // Unknown
          case 0:   // Pending
          case 2:   // Compiling
            break
        }
      })

      this.lastUpdateTime = new Date().toUTCString()
      return ret
    }
  },
  persist: true
})
