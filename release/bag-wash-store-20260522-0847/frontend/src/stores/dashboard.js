import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../api/request'
import { lastNDaysInBeijing, beijingToday } from '../utils/beijing-date'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref({
    todayCount: 0,
    washingCount: 0,
    waitPickupCount: 0,
    doneCount: 0,
  })

  const revenueDate = ref(beijingToday())
  const dailyRevenue = ref({
    date: beijingToday(),
    revenue: 0,
    prepay: 0,
    todayCount: 0,
  })

  async function loadCards() {
    const res = await request.get('/dashboard/summary', {
      params: { date: beijingToday() },
    })
    const data = res.data || {}
    stats.value = {
      todayCount: data.todayCount ?? 0,
      washingCount: data.washingCount ?? 0,
      waitPickupCount: data.waitPickupCount ?? 0,
      doneCount: data.doneCount ?? 0,
    }
    return stats.value
  }

  async function loadDailyRevenue(date = revenueDate.value) {
    const res = await request.get('/dashboard/summary', {
      params: { date },
    })
    const data = res.data || {}
    dailyRevenue.value = {
      date: data.date ?? date,
      revenue: data.revenue ?? 0,
      prepay: data.prepay ?? 0,
      todayCount: data.todayCount ?? 0,
    }
    return dailyRevenue.value
  }

  async function refreshAll() {
    await Promise.all([loadCards(), loadDailyRevenue(revenueDate.value)])
  }

  function last7DayOptions() {
    return lastNDaysInBeijing(7).map((value) => ({ value }))
  }

  return {
    stats,
    revenueDate,
    dailyRevenue,
    loadCards,
    loadDailyRevenue,
    refreshAll,
    last7DayOptions,
  }
})
