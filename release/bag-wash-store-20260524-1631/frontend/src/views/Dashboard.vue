<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { formatDateLabel, beijingToday } from '../utils/beijing-date'

const dashboardStore = useDashboardStore()
const loading = ref(false)
const revenueLoading = ref(false)

const dateOptions = computed(() =>
  dashboardStore.last7DayOptions().map(({ value }) => ({
    value,
    label: formatDateLabel(value),
  })),
)

async function loadCards() {
  loading.value = true
  try {
    await dashboardStore.loadCards()
  } finally {
    loading.value = false
  }
}

async function loadRevenue() {
  revenueLoading.value = true
  try {
    await dashboardStore.loadDailyRevenue(dashboardStore.revenueDate)
  } finally {
    revenueLoading.value = false
  }
}

watch(
  () => dashboardStore.revenueDate,
  () => {
    loadRevenue()
  },
)

onMounted(async () => {
  dashboardStore.revenueDate = beijingToday()
  await Promise.all([loadCards(), loadRevenue()])
})

const cards = computed(() => [
  {
    key: 'today',
    title: '今日订单',
    value: dashboardStore.stats.todayCount,
    sub: '含新建与到店登记（北京时间）',
    icon: 'Calendar',
    tone: 'blue',
  },
  {
    key: 'wash',
    title: '洗护中',
    value: dashboardStore.stats.washingCount,
    sub: '洗护中 + 修复中',
    icon: 'Brush',
    tone: 'cyan',
  },
  {
    key: 'pick',
    title: '待取件',
    value: dashboardStore.stats.waitPickupCount,
    sub: '已完工待客户取包',
    icon: 'Box',
    tone: 'amber',
  },
  {
    key: 'done',
    title: '已完成',
    value: dashboardStore.stats.doneCount,
    sub: '已取件归档',
    icon: 'CircleCheck',
    tone: 'green',
  },
])

const selectedDateLabel = computed(() => formatDateLabel(dashboardStore.dailyRevenue.date))

function formatMoney(n) {
  return `¥ ${Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 0 })}`
}
</script>

<template>
  <div class="dashboard">
    <el-row v-loading="loading" :gutter="16" class="stat-row">
      <el-col v-for="c in cards" :key="c.key" :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card" :class="`tone-${c.tone}`">
          <div class="stat-inner">
            <div class="stat-text">
              <div class="stat-title">{{ c.title }}</div>
              <div class="stat-value">{{ c.value }}</div>
              <div class="stat-sub">{{ c.sub }}</div>
            </div>
            <div class="stat-icon-wrap">
              <el-icon :size="28"><component :is="c.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="rev-row">
      <el-col :xs="24" :lg="16">
        <el-card v-loading="revenueLoading" shadow="never" class="panel">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">营收概览</span>
              <el-select
                v-model="dashboardStore.revenueDate"
                placeholder="选择日期"
                style="width: 160px"
              >
                <el-option
                  v-for="opt in dateOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :span="12">
              <div class="rev-block">
                <div class="rev-label">{{ selectedDateLabel }}订单金额合计</div>
                <div class="rev-amount primary">{{ formatMoney(dashboardStore.dailyRevenue.revenue) }}</div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="rev-block">
                <div class="rev-label">{{ selectedDateLabel }}预收款合计</div>
                <div class="rev-amount muted">{{ formatMoney(dashboardStore.dailyRevenue.prepay) }}</div>
              </div>
            </el-col>
          </el-row>
          <el-divider />
          <p class="rev-tip">
            统计按北京时间（UTC+8），下单日期 {{ dashboardStore.dailyRevenue.date }}，当日共
            {{ dashboardStore.dailyRevenue.todayCount }} 笔订单。
          </p>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="panel quick">
          <template #header>
            <span class="panel-title">快捷入口</span>
          </template>
          <div class="quick-list">
            <router-link to="/orders" class="quick-item">新建 / 查看订单</router-link>
            <router-link to="/customers" class="quick-item">维护客户资料</router-link>
            <router-link to="/services" class="quick-item">调整洗护项目价格</router-link>
            <router-link to="/staff" class="quick-item">配置员工权限</router-link>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid var(--bw-border);
}

.stat-card :deep(.el-card__body) {
  padding: 18px 20px;
}

.stat-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stat-title {
  font-size: 14px;
  color: var(--bw-text-secondary);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--bw-text);
  margin: 6px 0 4px;
  letter-spacing: -0.5px;
}

.stat-sub {
  font-size: 12px;
  color: #90a4ae;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.tone-blue .stat-icon-wrap {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
}
.tone-cyan .stat-icon-wrap {
  background: linear-gradient(135deg, #00838f, #26c6da);
}
.tone-amber .stat-icon-wrap {
  background: linear-gradient(135deg, #ef6c00, #ffb74d);
}
.tone-green .stat-icon-wrap {
  background: linear-gradient(135deg, #2e7d32, #66bb6a);
}

.rev-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.panel {
  border-radius: 12px;
  border: 1px solid var(--bw-border);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
}

.panel-title {
  font-weight: 600;
  font-size: 15px;
}

.rev-block {
  padding: 8px 0;
}

.rev-label {
  font-size: 13px;
  color: var(--bw-text-secondary);
}

.rev-amount {
  font-size: 26px;
  font-weight: 700;
  margin-top: 8px;
}

.rev-amount.primary {
  color: var(--bw-primary);
}

.rev-amount.muted {
  color: #546e7a;
}

.rev-tip {
  font-size: 13px;
  color: #78909c;
  line-height: 1.6;
  margin: 0;
}

.quick :deep(.el-card__body) {
  padding-top: 8px;
}

.quick-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-item {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f5f9ff;
  color: var(--bw-primary);
  text-decoration: none;
  font-size: 14px;
  border: 1px solid #e3f2fd;
  transition: background 0.15s;
}

.quick-item:hover {
  background: #e3f2fd;
}
</style>
