/* Contest store */
import axios from 'axios'
import cruise from '../api/cruise'
import { defineStore } from 'pinia'
import { useNotifyStore } from './notify'

export const useContestStore = defineStore('contest', {
  state: ()=>({
    info: null,
    rawStatus: null,
    rank: null,
    lastFocus: null,
    focusUserId: null,
    focusUpdate: null
  }),
  getters: {
    getName() {
      return this.info === null ? 'Aqua Rank' : this.info.name
    },
    getProblems() {
      return this.info === null ? null : this.info.problems
    },
    getSpan() {
      return this.info === null ? '' : `${new Date(this.info.timestamp).toLocaleString()} ~ ${new Date(this.info.timestamp + this.info.span).toLocaleString()}`
    }
  },
  actions: {
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

    // TODO
    async fetchRank() {
      // Check contest info
      if (this.info === null) {
        throw { message: 'Contest info unavailable' }
      }

      // Fetch raw data
      // Todo: Link to api
      let data = []
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

      // Preprocess raw data
      data = data.sort((a, b)=>a.solution_id - b.solution_id)

      // Generate rank
      let firstBlood = []

      tmp = {}
      data.forEach((v)=>{
        // Get user id
        let userId = v.user_id

        // User not exists
        if (tmp[userId] === undefined) {
          tmp[userId] = []
          for (let i = 0; i < this.info.problems; ++i) {
            tmp[userId].push({
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
            if (tmp[userId][id].result === 1 || tmp[userId][id].result === 4) {
              break
            }

            // Check first blood
            if (firstBlood.indexOf(id) === -1) {
              tmp[userId][id].result = 4
              firstBlood.push(id)
            } else {
              tmp[userId][id].result = 1
            }

            tmp[userId][id].tried++
            tmp[userId][id].penalty += Math.trunc(((new Date(v.in_date).getTime()) - this.info.timestamp) / 1000 / 60)
            break
          }
          case '-': { // Frozen
            if (tmp[userId][id].result === 1 || tmp[userId][id].result === 4) {
              break
            }

            tmp[userId][id].result = 3
            tmp[userId][id].beforeTried += tmp[userId][id].tried
            tmp[userId][id].tried = 0
            tmp[userId][id].afterTried++
            break
          }
          default: { // Other as WA
            if (tmp[userId][id].result === 1 || tmp[userId][id].result === 4) {
              break
            }

            tmp[userId][id].result = 2
            tmp[userId][id].tried++
            tmp[userId][id].penalty += 20
            break
          }
        }
      })
      this.rawStatus = tmp

      // Build rank
      let ret = []
      Object.getOwnPropertyNames(tmp).forEach((key)=>{
        let totalPenalty = 0
        let totalSolved = 0
        tmp[key].forEach((v)=>{
          totalPenalty += (v.result === 1 || v.result === 4 ? v.penalty : 0)
          totalSolved += (v.result === 1 || v.result === 4 ? 1 : 0)
        })
        ret.push({
          userId: key,
          totalPenalty,
          totalSolved,
          status: tmp[key]
        })
      })
      ret = ret.sort((a, b)=>{
        if (a.totalSolved === b.totalSolved)
          return a.totalPenalty - b.totalPenalty
        else 
          return b.totalSolved - a.totalSolved
      })
      ret.forEach((_, idx, arr)=>{
        arr[idx].rank = idx + 1
      })
      this.rank = ret
    },
    focusAndRefresh(userId, updatedStatus) {
      // Get element
      const el = document.querySelector(`[data-user-id="${userId}"]`)
      if (el === null) {
        return
      }

      // Check timestamp
      if (this.lastFocus && new Date().getTime() - this.lastFocus < 10000) {
        return
      }
      this.lastFocus = new Date().getTime()

      // Set focus
      this.focusUserId = userId
      this.focusUpdate = updatedStatus

      // Scroll to element
      const rect = el.getBoundingClientRect()
      const status = cruise.getStatus()
      cruise.stop()
      scrollTo(0, scrollY + rect.top + (rect.height - innerHeight) / 2)

      // Restore cruise status
      setTimeout(()=>{
        if (status && status === cruise.getStatus()) {
          cruise.start()
        }
      }, 3000)
    }
  }
})
