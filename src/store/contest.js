/* Contest store */
import axios from 'axios'
import { defineStore } from 'pinia'
import { useNotifyStore } from './notify'

export const useContestStore = defineStore('contest', {
  state: ()=>({
    info: null,
    rawStatus: null,
    firstBlood: [],
    rank: null,
    lastFocus: null,
    focusUserId: null,
    focusUpdate: null
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
    genNewRawStatus(newSubmission) {
      const ret = this.rawStatus === null ? {} : JSON.parse(JSON.stringify(this.rawStatus))

      newSubmission.forEach((v)=>{
        // Get user id
        let userId = v.user_id

        // User not exists
        if (ret[userId] === undefined) {
          ret[userId] = []
          for (let i = 0; i < this.info.problems; ++i) {
            ret[userId].push({
              id: i,
              result: 0,
              tried: 0,
              penalty: 0,
              beforeTried: 0,
              afterTried: 0
            })
          }
        }

        // Get problem id
        let id = /<[^>]*>([^<]*?)<[^>]*>/.exec(v.problem_id)[1].charCodeAt(0) - 65

        // Process result
        switch (v.result) {
          case 4: { // Accepted
            if (ret[userId][id].result === 1 || ret[userId][id].result === 4) {
              break
            }

            // Check first blood
            if (this.firstBlood.indexOf(id) === -1) {
              ret[userId][id].result = 4
              this.firstBlood.push(id)
            } else {
              ret[userId][id].result = 1
            }

            ret[userId][id].tried++
            ret[userId][id].penalty += Math.trunc(((new Date(v.in_date).getTime()) - this.info.timestamp) / 1000 / 60)
            break
          }
          case '-': { // Frozen
            if (ret[userId][id].result === 1 || ret[userId][id].result === 4) {
              break
            }

            ret[userId][id].result = 3
            ret[userId][id].beforeTried += ret[userId][id].tried
            ret[userId][id].tried = 0
            ret[userId][id].afterTried++
            break
          }
          default: { // Other as WA
            if (ret[userId][id].result === 1 || ret[userId][id].result === 4) {
              break
            }

            ret[userId][id].result = 2
            ret[userId][id].tried++
            ret[userId][id].penalty += 20
            break
          }
        }
      })

      return ret
    },

    // Generate rank
    genNewRank(newRawStatus) {
      // Update raw status
      this.rawStatus = newRawStatus

      // Generate competitor info list
      let ret = []
      Object.getOwnPropertyNames(newRawStatus).forEach((key)=>{
        let totalPenalty = 0
        let totalSolved = 0
        newRawStatus[key].forEach((v)=>{
          totalPenalty += (v.result === 1 || v.result === 4 ? v.penalty : 0)
          totalSolved += (v.result === 1 || v.result === 4 ? 1 : 0)
        })
        ret.push({
          userId: key,
          totalPenalty,
          totalSolved,
          status: newRawStatus[key]
        })
      })

      // Sort & assign rank
      ret = ret.sort((a, b)=>{
        if (a.totalSolved === b.totalSolved)
          return a.totalPenalty - b.totalPenalty
        else 
          return b.totalSolved - a.totalSolved
      })
      ret.forEach((_, idx, arr)=>{
        arr[idx].rank = idx + 1
      })

      // Assign rank diff
      if (this.rank !== null) {
        this.rank.forEach((v0)=>{
          ret.forEach((v1, idx, arr)=>{
            if (v0.userId === v1.userId) {
              if (v0.rank < v1.rank) {
                arr[idx].diff = 'desc'
              } else if (v0.rank > v1.rank) {
                arr[idx].diff = 'asc'
              }
            }
          })
        })
      }

      this.rank = ret
    },

    // Auto focus user
    autoFocus() {
      this.genNewRank()
      return
      // Check timestamp
      if (this.lastFocus && this.focusUserId === null && new Date().getTime() - this.lastFocus < 10000) {
        this.genNewRank()
        return
      }

      // Find difference
      if (this.rawStatus === null) {
        this.genNewRank()
        return
      }
      let userId = null
      let updatedStatus = null
      Object.keys(this.newRawStatus).forEach((v)=>{
        if (userId === null && this.rawStatus[v] !== undefined) {
          for (let i = 0; i < this.info.problems; ++i) {
            if ((this.newRawStatus[v][i].result === 1 || this.newRawStatus[v][i].result === 4) && 
              this.rawStatus[v][i].result !== this.newRawStatus[v][i].result) 
            {
              userId = v
              updatedStatus = this.newRawStatus[v]
              break
            }
          }
        }
      })
      if (userId === null) {
        this.genNewRank()
        return
      }

      // Set focus
      this.$patch({
        lastFocus: new Date().getTime(),
        focusUserId: userId,
        focusUpdate: updatedStatus
      })
    }
  }
})
