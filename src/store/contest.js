/* Contest store */
import axios from 'axios'
import { defineStore } from 'pinia'
import { useNotifyStore } from './notify'

export const useContestStore = defineStore('contest', {
  state: ()=>({
    info: null,
    rawStatus: {},
    firstBlood: [],
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
            if (this.firstBlood.includes(id)) {
              ret[userId][id].result = 'accepted'
            } else {
              ret[userId][id].result = 'first_blood'
              this.firstBlood.push(id)
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
      const isAccepted = (uid, pid)=>{
        return ['first_blood', 'accepted'].includes(this.rawStatus[uid][pid].result)
      }

      // Enumerate patch userId
      for (const userId in patch) {
        if (patch.hasOwnProperty(userId)) {
          // If userId exists in raw status
          if (this.rawStatus.hasOwnProperty(userId)) {
            for (let i = 0; i < this.info.problems; ++i) {
              if (isAccepted(userId, i)) {
                continue
              }

              const s = this.rawStatus[userId][i]
              const p = patch[userId][i]

              s.result = p.result
              s.tries += p.tries
              s.penalty += p.penalty
              s.frozenTries += p.frozenTries
            }
          } else {
            this.rawStatus[userId] = patch[userId]
          }
        }
      }
    },

    // Generate rank
    genNewRank() {
      let ret = []

      // Generate competitor info list
      for (const userId in this.rawStatus) {
        if (this.rawStatus.hasOwnProperty(userId)) {
          const s = this.rawStatus[userId]
          let solved = 0
          let penalty = 0

          s.forEach((v)=>{
            penalty += (v.result === 'first_blood' || v.result === 'accepted' ? v.penalty : 0)
            solved += (v.result === 'first_blood' || v.result === 'accepted' ? 1 : 0)
          })

          ret.push({
            userId,
            solved,
            penalty,
            status: s
          })
        }
      }

      // Sort & assign rank
      ret = ret.sort((a, b)=>{
        return a.solved === b.solved ?
          (a.penalty === b.penalty ? (a.userId < b.userId ? -1 : 1) : a.penalty - b.penalty) :
          b.solved - a.solved
      })
      ret.forEach((_, idx, arr)=>{
        arr[idx].rank = idx + 1
      })

      // Assign rank change
      ret.forEach((v0, idx, arr)=>{
        let flag = true
        this.rank.forEach((v1)=>{
          if (v0.userId === v1.userId) {
            flag = false
            if (v0.rank < v1.rank) {
              arr[idx].change = 'up'
            } else if (v0.rank > v1.rank) {
              arr[idx].change = 'down'
            }
          }
        })
        if (flag) {
          arr[idx].change = 'up'
        }
      })

      this.rank = ret
    },

    // Auto focus user with patch
    autoFocus(patch) {
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
