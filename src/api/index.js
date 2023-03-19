/* Api interfaces */
import axios from 'axios'

// Fetch contest info
const fetchContestInfo = async (force)=>{
  // Check session storage
  if (!force && sessionStorage.getItem('contest_info') !== null) {
    return JSON.parse(sessionStorage.getItem('contest_info'))
  }

  // Fetch from remote
  let data = null
  try {
    data = (await axios.get('/contest.json')).data
  }
  catch (err) {
    return null
  }

  // Update session storage
  sessionStorage.setItem('contest_info', JSON.stringify(data))

  // Return 
  return data
}

// Fetch rank
const fetchRank = async ()=>{
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
        tmp[userId][id].penalty += Math.trunc(((new Date(v.in_date).getTime()) - contest.timestamp) / 1000 / 60)
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
  ret.forEach((v, idx, arr)=>{
    arr[idx].rank = idx + 1
  })

  return ret
}

// Export
export { fetchContestInfo, fetchRank }
