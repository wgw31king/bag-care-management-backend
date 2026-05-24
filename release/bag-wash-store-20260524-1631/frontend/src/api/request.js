import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('bagwash_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body?.code !== 0) {
      ElMessage.error(body?.message || '请求失败')
      return Promise.reject(body)
    }
    return body
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || '网络异常'
    if (status === 401) {
      import('../stores/auth').then(({ useAuthStore }) => {
        useAuthStore().clearSession()
      })
      router.push('/login')
      ElMessage.error(message || '登录已过期，请重新登录')
    } else {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

export default request
