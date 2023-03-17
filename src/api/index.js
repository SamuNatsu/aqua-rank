/* Api interfaces */
import axios from 'axios'

// Get contest info
const getContestInfo = ()=>{
  return {
    name: 'Test Contest',
    timestamp: 1672894800000,
    totalProblem: 12
  }
}

// Fetch rank
const fetchRank = async ()=>{
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

  data = data.sort((a, b)=>a.solution_id - b.solution_id)
  console.log(data)

  let contest = getContestInfo()
  let first = []
  let ret = {}

  data.forEach((v)=>{
    if (ret[v.user_id] === undefined) {
      ret[v.user_id] = []
      for (let i = 0; i < contest.totalProblem; ++i) {
        ret[v.user_id].push({
          id: i,
          result: 0,
          tried: 0,
          penalty: 0,
          beforeTried: 0,
          afterTried: 0
        })
      }
    }

    let id = /<[^>]*>([^<]*?)<[^>]*>/.exec(v.problem_id)[1].charCodeAt(0) - 65

    switch (v.result) {
      case 4: { // Accepted
        if (ret[v.user_id][id].result === 1 || ret[v.user_id][id].result === 4) {
          break
        }

        if (first.indexOf(id) === -1) {
          ret[v.user_id][id].result = 4
          first.push(id)
        } else {
          ret[v.user_id][id].result = 1
        }

        ret[v.user_id][id].tried++
        ret[v.user_id][id].penalty += Math.trunc(((new Date(v.in_date).getTime()) - contest.timestamp) / 1000 / 60)
        break
      }
      case '-': { // Frozen
        if (ret[v.user_id][id].result === 1 || ret[v.user_id][id].result === 4) {
          break
        }

        ret[v.user_id][id].result = 3
        ret[v.user_id][id].beforeTried += ret[v.user_id][id].tried
        ret[v.user_id][id].tried = 0
        ret[v.user_id][id].afterTried++
        break;
      }
      default: { // Other as WA
        if (ret[v.user_id][id].result === 1 || ret[v.user_id][id].result === 4) {
          break
        }

        ret[v.user_id][id].result = 2
        ret[v.user_id][id].tried++
        ret[v.user_id][id].penalty += 20
        break
      }
    }
  })

  let order = []
  Object.getOwnPropertyNames(ret).forEach((key)=>{
    let totalPenalty = 0
    let totalSolved = 0
    ret[key].forEach((v)=>{
      totalPenalty += (v.result === 1 || v.result === 4 ? v.penalty : 0)
      totalSolved += (v.result === 1 || v.result === 4 ? 1 : 0)
    })
    order.push({
      userId: key,
      totalPenalty,
      totalSolved,
      status: ret[key]
    })
  })
  order = order.sort((a, b)=>{
    if (a.totalSolved === b.totalSolved)
      return a.totalPenalty - b.totalPenalty
    else 
      return b.totalSolved - a.totalSolved
  })
  order.forEach((v, idx, arr)=>{
    arr[idx].rank = idx + 1
  })

  return order
}

// Export
export { fetchRank }
