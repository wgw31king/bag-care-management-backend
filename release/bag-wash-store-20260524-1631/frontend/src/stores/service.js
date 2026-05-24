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
    const { name, price, durationMin, enabled, sort } = row
    const payload = { name, price, durationMin, enabled, sort }
    const code = row.code?.trim()
    if (code) payload.code = code
    return payload
  }

  function getWashServiceLabels(values) {
    if (!values?.length) return '—'
    return values
      .map((v) => {
        const s = services.value.find(
          (x) => (x.code && x.code === v) || x.id === v || x.name === v,
        )
        return s?.name ?? v
      })
      .join('、')
  }

  async function fetchEnabledForSelect() {
    await fetchList({ page: 1, pageSize: 100, enabled: '1' })
    return services.value
      .filter((s) => s.enabled)
      .map((s) => ({
        value: s.code || s.id,
        label: s.name,
      }))
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

  return {
    services,
    total,
    fetchList,
    fetchEnabledForSelect,
    getWashServiceLabels,
    save,
    remove,
    setServices,
  }
})
