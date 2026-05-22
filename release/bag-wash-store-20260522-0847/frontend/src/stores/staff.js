import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../api/request'

function pickList(data) {
  if (Array.isArray(data)) return data
  return data?.list ?? data?.items ?? data?.records ?? []
}

/** 可分配给普通员工的模块（员工管理仅门店管理员，无「财务查看」） */
export const PERMISSION_OPTIONS = [
  { value: 'dashboard', label: '仪表盘' },
  { value: 'order', label: '订单管理' },
  { value: 'customer', label: '客户管理' },
  { value: 'service', label: '服务配置' },
]

export const useStaffStore = defineStore('staff', () => {
  const staffList = ref([])
  const total = ref(0)

  async function fetchList(params = {}) {
    const res = await request.get('/staff', { params })
    const data = res.data || {}
    staffList.value = pickList(data)
    total.value = data.total ?? staffList.value.length
    return { list: staffList.value, total: total.value }
  }

  async function add(row) {
    const res = await request.post('/staff', row)
    const created = res.data
    if (created) staffList.value.unshift(created)
    return created
  }

  async function update(id, payload) {
    const res = await request.put(`/staff/${id}`, payload)
    const updated = res.data
    const idx = staffList.value.findIndex((s) => s.id === id)
    if (idx >= 0 && updated) staffList.value[idx] = updated
    else if (idx >= 0) staffList.value[idx] = { ...staffList.value[idx], ...payload }
    return updated ?? staffList.value[idx]
  }

  async function remove(id) {
    await request.delete(`/staff/${id}`)
    staffList.value = staffList.value.filter((s) => s.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function setStaffList(list) {
    staffList.value = Array.isArray(list) ? list : []
  }

  return { staffList, total, fetchList, add, update, remove, setStaffList }
})
