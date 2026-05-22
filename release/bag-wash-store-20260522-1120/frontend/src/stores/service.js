import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../api/request'

function pickList(data) {
  if (Array.isArray(data)) return data
  return data?.list ?? data?.items ?? data?.records ?? []
}

export const useServiceStore = defineStore('service', () => {
  const services = ref([])
  const total = ref(0)

  async function fetchList(params = {}) {
    const res = await request.get('/services', { params })
    const data = res.data || {}
    services.value = pickList(data)
    total.value = data.total ?? services.value.length
    return { list: services.value, total: total.value }
  }

  function buildPayload(row) {
    const { code, name, price, durationMin, enabled, sort } = row
    return { code, name, price, durationMin, enabled, sort }
  }

  async function save(row) {
    const payload = buildPayload(row)
    let saved
    if (row.id) {
      const res = await request.put(`/services/${row.id}`, payload)
      saved = res.data
      const idx = services.value.findIndex((s) => s.id === row.id)
      if (idx >= 0 && saved) services.value[idx] = saved
      else if (idx >= 0) services.value[idx] = { ...services.value[idx], ...payload }
    } else {
      const res = await request.post('/services', payload)
      saved = res.data
      if (saved) services.value.push(saved)
    }
    services.value.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    return saved
  }

  async function remove(id) {
    await request.delete(`/services/${id}`)
    services.value = services.value.filter((s) => s.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  function setServices(list) {
    services.value = Array.isArray(list) ? list : []
  }

  return { services, total, fetchList, save, remove, setServices }
})
