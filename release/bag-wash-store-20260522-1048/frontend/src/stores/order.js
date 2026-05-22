import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../api/request'

function pickList(data) {
  if (Array.isArray(data)) return data
  return data?.list ?? data?.items ?? data?.records ?? []
}

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const total = ref(0)

  function getById(id) {
    return orders.value.find((o) => o.id === id)
  }

  async function fetchList(params = {}) {
    const res = await request.get('/orders', { params })
    const data = res.data || {}
    orders.value = pickList(data)
    total.value = data.total ?? orders.value.length
    return { list: orders.value, total: total.value }
  }

  async function fetchOne(id) {
    const cached = getById(id)
    if (cached) return cached
    const res = await request.get(`/orders/${id}`)
    const row = res.data
    if (row?.id) {
      const idx = orders.value.findIndex((o) => o.id === row.id)
      if (idx >= 0) orders.value[idx] = row
      else orders.value.unshift(row)
    }
    return row
  }

  async function add(payload) {
    const res = await request.post('/orders', payload)
    const row = res.data
    if (row) orders.value.unshift(row)
    return row
  }

  async function update(id, payload) {
    const res = await request.put(`/orders/${id}`, payload)
    const row = res.data
    const idx = orders.value.findIndex((o) => o.id === id)
    if (idx >= 0 && row) orders.value[idx] = row
    else if (idx >= 0) orders.value[idx] = { ...orders.value[idx], ...payload }
    return row ?? orders.value[idx]
  }

  async function updateStatus(id, status) {
    const res = await request.patch(`/orders/${id}/status`, { status })
    const row = res.data
    const idx = orders.value.findIndex((o) => o.id === id)
    if (idx >= 0 && row) orders.value[idx] = row
    else if (idx >= 0) orders.value[idx] = { ...orders.value[idx], status }
    return row ?? orders.value[idx]
  }

  async function remove(id) {
    await request.delete(`/orders/${id}`)
    orders.value = orders.value.filter((o) => o.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function setOrders(list) {
    orders.value = Array.isArray(list) ? list : []
  }

  return {
    orders,
    total,
    getById,
    fetchList,
    fetchOne,
    add,
    update,
    updateStatus,
    remove,
    setOrders,
  }
})
