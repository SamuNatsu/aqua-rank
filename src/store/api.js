/* API store */
import { defineStore } from 'pinia'
import _ from 'lodash'
import axios from 'axios'
import { Base64 } from 'js-base64'

// Functions
const encode = (obj)=>{
  return encodeURI(Base64.encode(JSON.stringify(obj)))
}

// Export
export const useApiStore = defineStore('api', {
  state: ()=>({
    baseUrl: "",
    accessToken: "",
    refreshToken: "",
    lastRefreshTime: "",
    userId: null,
    admin: false
  }),
  actions: {
    async login(userId, passwd) {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      try {
        const res = (await axios({
          url: '/api/token',
          method: 'post',
          baseURL: this.baseUrl,
          data: {
            user_id: userId,
            password: passwd
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

        this.$patch({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          lastRefreshTime: new Date().toUTCString(),
          userId,
          admin: _.get(res, 'privilege.admin', false)
        })
        
        return { code: 0, data: res.user }
      } catch (err) {
        return { code: 1, msg: err.message }
      }
    },
    logout() {
      this.$patch({
        accessToken: "",
        refreshToken: "",
        lastRefreshTime: "",
        userId: null,
        admin: false
      })
    },
    async refresh() {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      if (this.userId === null)
        return { code: 1, msg: 'Please login first' }

      if (new Date().getTime() - new Date(this.lastRefreshTime).getTime() < 86400000)
        return { code: 0 }

      try {
        const res = (await axios({
          url: '/api/token',
          method: 'put',
          baseURL: this.baseUrl,
          headers: {
            'Authorization': 'Bearer ' + this.refreshToken
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

        this.$patch({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          lastRefreshTime: new Date().toUTCString(),
          admin: _.get(res, 'privilege.admin', false)
        })
      } catch (err) {
        return { code: 1, msg: err.message }
      }

      return { code: 0 }
    },
    async fetchUserInfo() {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      if (this.userId === null)
        return { code: 1, msg: 'Please login first' }

      this.refresh()

      try {
        const res = (await axios({
          url: '/api/token',
          method: 'get',
          baseURL: this.baseUrl,
          headers: {
            'Authorization': 'Bearer ' + this.accessToken
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

        return { code: 0, data: res.user }
      } catch (err) {
        return { code: 1, msg: err.message }
      }
    },
    async fetchContestInfo(id) {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      if (this.userId === null)
        return { code: 1, msg: 'Please login first' }

      this.refresh()

      try {
        const res = (await axios({
          url: '/api/contest',
          method: 'get',
          baseURL: this.baseUrl,
          headers: {
            'Authorization': 'Bearer ' + this.accessToken
          },
          params: {
            json: encode({ contest_id: id })
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

       return { code: 0, data: res.data }
      } catch (err) {
        return { code: 1, msg: err.message }
      }
    },
    async fetchContestList(idList) {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      if (this.userId === null)
        return { code: 1, msg: 'Please login first' }

      this.refresh()

      try {
        const res = (await axios({
          url: '/api/contest_list',
          method: 'get',
          baseURL: this.baseUrl,
          headers: {
            'Authorization': 'Bearer ' + this.accessToken
          },
          params: {
            json: encode({ filter: { contest_id: ['in', idList] } })
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

        return { code: 0, data: res.data }
      } catch (err) {
        return { code: 1, msg: err.message }
      }
    },
    async fetchProblemList(idList) {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      if (this.userId === null)
        return { code: 1, msg: 'Please login first' }

      this.refresh()

      try {
        const res = (await axios({
          url: '/api/contest_problem_list',
          method: 'get',
          baseURL: this.baseUrl,
          headers: {
            'Authorization': 'Bearer ' + this.accessToken
          },
          params: {
            json: encode({
              filter: {
                contest_id: ['in', idList] 
              },
              order: {
                contest_id: 'asc',
                num: 'asc'
              }
            })
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

       return { code: 0, data: res.data }
      } catch (err) {
        return { code: 1, msg: err.message }
      }
    },
    async fetchTeamList(idList) {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      if (this.userId === null)
        return { code: 1, msg: 'Please login first' }

      this.refresh()

      try {
        const res = (await axios({
          url: '/api/cpc_team_list',
          method: 'get',
          baseURL: this.baseUrl,
          headers: {
            'Authorization': 'Bearer ' + this.accessToken
          },
          params: {
            json: encode({ filter: { contest_id: ['in', idList] } })
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

        return { code: 0, data: res.data }
      } catch (err) {
        return { code: 1, msg: err.message }
      }
    },
    async fetchSolutionList(idList, time) {
      if (this.baseUrl.length === 0)
        return { code: 1, msg: 'Base URL cannot be empty' }

      if (this.userId === null)
        return { code: 1, msg: 'Please login first' }

      this.refresh()

      try {
        const res = (await axios({
          url: '/api/solution_list',
          method: 'get',
          baseURL: this.baseUrl,
          headers: {
            'Authorization': 'Bearer ' + this.accessToken
          },
          params: {
            json: encode({
              filter: {
                contest_id: ['in', idList],
                in_date: ['>', time] 
              },
              order: {
                in_date: 'asc'
              }
            })
          }
        })).data

        if (res.code !== 200)
          return { code: 1, msg: data.msg }

        return { code: 0, data: res.data }
      } catch (err) {
        return { code: 1, msg: err.message }
      }
    }
  },
  persist: true
})
