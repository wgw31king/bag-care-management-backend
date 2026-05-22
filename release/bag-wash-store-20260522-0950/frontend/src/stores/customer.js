import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../api/request'

function pickList(data) {
  if (Array.isArray(data)) return data
  return data?.list ?? data?.items ?? data?.records ?? []
}

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])
  const total = ref(0)

  async function fetchList(params = {}) {
    const res = await request.get('/customers', { params })
    const data = res.data || {}
    customers.value = pickList(data)
    total.value = data.total ?? customers.value.length
    return { list: customers.value, total: total.value }
  }

  async function add(row) {
    const res = await request.post('/customers', row)
    const created = res.data
    if (created) customers.value.unshift(created)
    return created
  }

  async function update(id, payload) {
    const res = await request.put(`/customers/${id}`, payload)
    const updated = res.data
    const idx = customers.value.findIndex((c) => c.id === id)
    if (idx >= 0 && updated) customers.value[idx] = updated
    else if (idx >= 0) customers.value[idx] = { ...customers.value[idx], ...payload }
    return updated ?? customers.value[idx]
  }

  async function remove(id) {
    await request.delete(`/customers/${id}`)
    customers.value = customers.value.filter((c) => c.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function setCustomers(list) {
    customers.value = Array.isArray(list) ? list : []
  }

  return { customers, total, fetchList, add, update, remove, setCustomers }
})
