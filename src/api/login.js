import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/leo/login',
    method: 'post',
    data: {
      name:username,
      pwd:password
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/leo/logout',
    method: 'post'
  })
}
