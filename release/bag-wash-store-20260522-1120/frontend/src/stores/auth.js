import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../api/request'

function loadPermissions() {
  try {
    const raw = localStorage.getItem('bagwash_permissions')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('bagwash_token') || '')
  const displayName = ref(localStorage.getItem('bagwash_user') || '')
  const username = ref(localStorage.getItem('bagwash_username') || '')
  const permissions = ref(loadPermissions())
  const isManager = ref(localStorage.getItem('bagwash_is_manager') === '1')

  const isLoggedIn = computed(() => Boolean(token.value))

  function hasPermission(key) {
    return permissions.value.includes(key)
  }

  function setSession(accessToken, name, perms = [], loginUsername = '', manager = false) {
    token.value = accessToken
    displayName.value = name || '门店管理员'
    username.value = loginUsername
    permissions.value = Array.isArray(perms) ? perms : []
    isManager.value = Boolean(manager)
    localStorage.setItem('bagwash_token', token.value)
    localStorage.setItem('bagwash_user', displayName.value)
    localStorage.setItem('bagwash_username', username.value)
    localStorage.setItem('bagwash_permissions', JSON.stringify(permissions.value))
    localStorage.setItem('bagwash_is_manager', isManager.value ? '1' : '0')
  }

  function clearSession() {
    token.value = ''
    displayName.value = ''
    username.value = ''
    permissions.value = []
    isManager.value = false
    localStorage.removeItem('bagwash_token')
    localStorage.removeItem('bagwash_user')
    localStorage.removeItem('bagwash_username')
    localStorage.removeItem('bagwash_permissions')
    localStorage.removeItem('bagwash_is_manager')
  }

  function applyLoginData(data, loginUsername) {
    setSession(
      data.token,
      data.displayName || loginUsername,
      data.permissions || [],
      data.username || loginUsername,
      data.isManager,
    )
  }

  async function login(loginUsername, password) {
    const res = await request.post('/auth/login', {
      username: loginUsername,
      password,
    })
    const data = res.data || {}
    applyLoginData(data, loginUsername)
    return data
  }

  async function logout() {
    try {
      await request.post('/auth/logout')
    } catch {
      // 网络失败时仍清除本地会话
    }
    clearSession()
  }

  async function fetchMe() {
    const res = await request.get('/auth/me')
    const data = res.data || {}
    if (data.token) {
      applyLoginData(data, data.username || username.value)
    } else if (token.value) {
      permissions.value = data.permissions || []
      isManager.value = Boolean(data.isManager)
      if (data.displayName || data.username) {
        displayName.value = data.displayName || data.username
        username.value = data.username || username.value
      }
      localStorage.setItem('bagwash_user', displayName.value)
      localStorage.setItem('bagwash_username', username.value)
      localStorage.setItem('bagwash_permissions', JSON.stringify(permissions.value))
      localStorage.setItem('bagwash_is_manager', isManager.value ? '1' : '0')
    }
    return data
  }

  async function fetchSwitchableUsers() {
    const res = await request.get('/auth/switchable-users')
    return res.data?.list ?? res.data ?? []
  }

  async function switchToUser(targetUsername, password) {
    return login(targetUsername, password)
  }

  return {
    token,
    displayName,
    username,
    permissions,
    isManager,
    isLoggedIn,
    hasPermission,
    setSession,
    clearSession,
    login,
    logout,
    fetchMe,
    fetchSwitchableUsers,
    switchToUser,
  }
})
