/* Contest store */
import _ from 'lodash'
import axios from 'axios'
import { defineStore } from 'pinia'
import { useNotifyStore } from './notify'

// No need for reactive
let firstBlood = []
let rawStatus = {}
let rawRank = {}

export const useContestStore = defineStore('contest', {
  state: ()=>({
    info: null,
    rank: [],
    lastFocus: 0,
    focusUserId: null,
    focusPatch: null,
    fullPatch: null
  }),
  getters: {
    getName() {
      return this.info === null ? 'Aqua Rank' : this.info.name
    },
    getSpan() {
      return this.info === null ? '' : `${new Date(this.info.timestamp).toLocaleString()} ~ ${new Date(this.info.timestamp + this.info.span).toLocaleString()}`
    }
  },
  actions: {
    // Fetch contest info
    async fetchInfo(force) {
      // Check force & exists
      if (!force && this.info !== null) {
        return
      }
      if (force) {
        useNotifyStore().push('warn', 'Force refetch contest info')
      }

      // Fetch from remote
      try {
        this.info = (await axios.get('/contest.json')).data
      }
      catch (err) {
        throw err
      }

      // Change title
      document.title = `${this.info.name} | Aqua Rank`
    },

    // Fetch raw data
    // TODO: Need API binding
    async fetchSubmissions(timestamp) {
      let data = []
      if (timestamp === undefined) {  // Fetch all
        let tmp = null
        do {
          tmp = await axios({
            method: 'get',
            baseURL: null,
            url: '/api/status_ajax',
            headers: {
              'X-Requested-With': 'XMLHttpRequest'
            },
            params: {
              cid: 1038,
              sort: 'solution_id_show',
              order: 'desc',
              offset: data.length,
              limit: 20,
              problem_id: '',
              user_id: '',
              solution_id: '',
              language: -1,
              result: -1
            }
          })
          data = data.concat(tmp.data.rows)
        } while (data.length < tmp.data.total)
      } else {  // Fetch after timestamp
        if (timestamp > 519) {
          return []
        }

        data = (await axios({
          method: 'get',
          baseURL: null,
          url: '/api/status_ajax',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          params: {
            cid: 1038,
            sort: 'solution_id_show',
            order: 'desc',
            offset: 500 - timestamp,
            limit: 20,
            problem_id: '',
            user_id: '',
            solution_id: '',
            language: -1,
            result: -1
          }
        })).data.rows
      }

      // Preprocess
      data = data.sort((a, b)=>a.solution_id - b.solution_id)

      return data
    },

    // Generate new raw status
    // TODO: Need API binding
    genRawStatusPatch(submissions) {
      const ret = {}
      const problems = this.info.problems

      // Patch raw status
      submissions.forEach((v)=>{
        // Get user id
        const userId = v.user_id

        // User not exists
        if (ret[userId] === undefined) {
          ret[userId] = []
          for (let i = 0; i < problems; ++i) {
            ret[userId].push({
              problemId: i,
              result: 'none',
              tries: 0,
              penalty: 0,
              frozenTries: 0
            })
          }
        }

        // Get problem id
        const id = /<[^>]*>([^<]*?)<[^>]*>/.exec(v.problem_id)[1].charCodeAt(0) - 65

        // Process result
        const isAccepted = ()=>{
          return ['first_blood', 'accepted'].includes(ret[userId][id].result)
        }
        switch (v.result) {
          case 4: { // Accepted
            if (isAccepted()) {
              break
            }

            // Check first blood
            if (firstBlood.includes(id)) {
              ret[userId][id].result = 'accepted'
            } else {
              ret[userId][id].result = 'first_blood'
              firstBlood.push(id)
            }

            ret[userId][id].tries++
            ret[userId][id].penalty += Math.trunc(((new Date(v.in_date).getTime()) - this.info.timestamp) / 1000 / 60)
            break
          }
          case '-': { // Frozen
            if (isAccepted()) {
              break
            }

            ret[userId][id].result = 'frozen'
            ret[userId][id].frozenTries++
            break
          }
          default: { // Other as WA
            if (isAccepted()) {
              break
            }

            ret[userId][id].result = 'wrong_answer'
            ret[userId][id].tries++
            ret[userId][id].penalty += 20
            break
          }
        }
      })

      return ret
    },

    // Patch raw status
    patchRawStatus(patch) {
      // Enumerate patch
      _.forOwn(patch, (patchStatus, userId)=>{
        // User exists
        if (rawStatus.hasOwnProperty(userId)) {
          // Enumerate problems
          rawStatus[userId].forEach((oldStatus, index, refStatus)=>{
            // Skip accepted result
            if (['first_blood', 'accepted'].includes(oldStatus.result)) {
              return
            }

            // Patch
            refStatus[index].result = patchStatus[index].result
            refStatus[index].tries += patchStatus[index].tries
            refStatus[index].penalty += patchStatus[index].penalty
            refStatus[index].frozenTries += patchStatus[index].frozenTries
          })
        // User not exists
        } else {
          rawStatus[userId] = patchStatus
        }
      })
    },

    // Generate rank
    genNewRank() {
      // Generate competitor info list
      let ret = []
      _.forOwn(rawStatus, (status, userId)=>{
        let solved = 0
        let penalty = 0

        status.filter((problem)=>{
          return ['first_blood', 'accepted'].includes(problem.result) 
        }).forEach((problem)=>{
          solved++
          penalty += problem.penalty
        })

        ret.push({
          userId,
          solved,
          penalty,
          status
        })
      })

      // Sort
      ret = ret.sort((a, b)=>{
        // Solve more > Penalty less > Name lexicographical order less
        if (a.solved === b.solved) {
          if (a.penalty === b.penalty) {
            return a.userId < b.userId ? -1 : 1
          } else {
            return a.penalty - b.penalty
          }
        } else {
          return b.solved - a.solved
        }
      })

      // Assign rank
      const newRawRank = {}
      ret.forEach((value, index, refRet)=>{
        refRet[index].rank = index + 1
        newRawRank[value.userId] = index + 1
      })

      // Assign rank change
      ret.forEach((value, index, refRet)=>{
        // If user already exists in rank
        if (rawRank.hasOwnProperty(value.userId)) {
          if (value.rank < rawRank[value.userId]) {
            refRet[index].change = 'up'
          } else if (value.rank > rawRank[value.userId]) {
            refRet[index].chage = 'down'
          }
        // User new to rank
        } else {
          refRet[index].change = 'up'
        }
      })

      rawRank = newRawRank
      this.rank = ret
    },

    // Auto focus user with patch
    autoFocus(patch) {
        this.patchRawStatus(patch)
        this.genNewRank()
        return

      // Check timestamp & focus status
      if (new Date().getTime() - this.lastFocus < 10000 || this.focusUserId !== null) {
        this.patchRawStatus(patch)
        this.genNewRank()
        return
      }

      // Find difference
      let tUserId = null
      let tStatus = null
      for (const userId in patch) {
        if (patch.hasOwnProperty(userId) && this.rank.find((v)=>v.userId === userId) !== undefined) {
          const p = patch[userId]
          for (let i = 0; i < this.info.problems; ++i) {
            if (['first_blood', 'accepted'].includes(p[i].result)) {
              tUserId = userId
              tStatus = p
              break
            }
          }
        }
        if (tUserId !== null) {
          break
        }
      }
      if (tUserId === null) {
        this.patchRawStatus(patch)
        this.genNewRank()
        return
      }

      // Set focus
      this.$patch({
        lastFocus: new Date().getTime(),
        focusUserId: tUserId,
        focusPatch: tStatus,
        fullPatch: patch
      })
    }
  }
})
