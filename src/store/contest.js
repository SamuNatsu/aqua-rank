/* Contest store */
import { defineStore } from 'pinia'
import _ from 'lodash'
import { Contest } from '../api/contest'

const contest = Contest.getInstance()

// Export
export const useContestStore = defineStore('contest', {
  state: ()=>({
    // Internal
    title: '',
    startTime: '',
    endTime: '',
    contestList: '',
    schoolList: null,
    schoolFilter: null,
    unofficialFilter: false,
    rank: null,
    loop: null
  }),
  getters: {
    filteredRank() {
      if (this.rank === null)
        return null
      let ret = this.rank
      if (this.unofficialFilter)
        ret = ret.filter((v)=>!v.name.startsWith('*'))
      const f = this.getFilter()
      return ret.filter((v)=>!f.includes(v.school))
    }
  },
  actions: {
    async init() {
      const list = this.contestList.split(',').map((v)=>parseInt(v))
      const res = await contest.init(list)
      if (res.code !== 0)
        return res

      this.title = contest.title
      this.startTime = new Date(contest.startTime).toLocaleString()
      this.endTime = new Date(contest.endTime).toLocaleString()

      const tmp = []
      contest.teamMap.forEach((v)=>{
        if (v.school && !tmp.includes(v.school))
          tmp.push(v.school)
      })
      tmp.sort()
      this.schoolList = tmp
      this.schoolFilter = new Array(tmp.length).fill(null)

      document.title = this.title + ' | Aqua Rank'

      return { code: 0, data: contest }
    },
    getFilter() {
      return this.schoolFilter.filter((v)=>v !== null)
    },
    async update(all, time) {
      const res = (await contest.update(all, time))
      if (res.code !== 0)
        return res

      this.rank = contest.rank
      return { code: 0 }
    },
    async startLoop(force) {
      if (this.loop !== null && force !== true)
        return { code: 0 }

      if (force === true)
        clearInterval(this.loop)

      let res = await this.init()
      if (res.code !== 0)
        return res

      await this.update(true)

      this.loop = setInterval(async ()=>{
        await this.update()
      }, 10000)

      return { code: 0 }
    },
    async testLoop(time) {
      if (this.loop !== null)
        return { code: 0 }

      let res = await this.init()
      if (res.code !== 0)
        return res

      await this.update(true, time)

      this.loop = setInterval(async ()=>{
        time = new Date(time.getTime() + 10000)
        await this.update(false, time)
      }, 10000)

      return { code: 0 }
    }
  },
  persist: {
    paths: ['title', 'startTime', 'endTime', 'contestList', 'schoolList', 'schoolFilter', 'unofficialFilter']
  }
})
