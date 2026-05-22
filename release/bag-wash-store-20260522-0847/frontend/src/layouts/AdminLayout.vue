<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import SwitchUserDialog from '../components/layout/SwitchUserDialog.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const switchVisible = ref(false)

const active = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', label: '数据仪表盘', icon: 'Odometer', permission: 'dashboard' },
  { path: '/orders', label: '订单管理', icon: 'Tickets', permission: 'order' },
  { path: '/customers', label: '客户管理', icon: 'User', permission: 'customer' },
  { path: '/services', label: '洗护服务配置', icon: 'Setting', permission: 'service' },
]

const visibleMenus = computed(() => {
  const list = menuItems.filter((m) => auth.hasPermission(m.permission))
  if (auth.isManager) {
    list.push({ path: '/staff', label: '员工权限', icon: 'Lock', permission: 'staff' })
  }
  return list
})

function go(path) {
  router.push(path)
}

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

onMounted(() => {
  if (auth.isLoggedIn) {
    auth.fetchMe().catch(() => {})
  }
})
</script>

<template>
  <el-container class="layout-root">
    <el-aside width="220px" class="layout-aside">
      <div class="brand">
        <span class="brand-mark" />
        <div>
          <div class="brand-title">包包洗护</div>
          <div class="brand-sub">门店订单管理</div>
        </div>
      </div>
      <el-menu
        :default-active="active"
        class="aside-menu"
        background-color="transparent"
        text-color="rgba(255,255,255,0.85)"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item
          v-for="item in visibleMenus"
          :key="item.path"
          :index="item.path"
          @click="go(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container direction="vertical" class="layout-main-wrap">
      <el-header class="layout-header">
        <div class="header-left">
          <span class="page-title">{{ route.meta.title || '控制台' }}</span>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-trigger">
              <el-avatar :size="32" class="user-avatar">{{ auth.displayName.slice(0, 1) }}</el-avatar>
              <span class="user-name">{{ auth.displayName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="switchVisible = true">切换用户</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-main">
        <div class="main-inner">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>

    <SwitchUserDialog v-model="switchVisible" />
  </el-container>
</template>

<style scoped>
.layout-root {
  min-height: 100vh;
  background: var(--bw-bg-page);
}

.layout-aside {
  background: linear-gradient(180deg, #0b3d7a 0%, #0a58c4 45%, #1565c0 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(11, 61, 122, 0.18);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #7ecbff, #e3f2ff);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.brand-title {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.brand-sub {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
}

.aside-menu {
  border-right: none;
  flex: 1;
  padding: 12px 8px;
}

.aside-menu :deep(.el-menu-item) {
  border-radius: 8px;
  margin-bottom: 4px;
}

.aside-menu :deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.18) !important;
}

.layout-main-wrap {
  min-width: 0;
}

.layout-header {
  height: 56px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid var(--bw-border);
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--bw-text);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--bw-text);
}

.user-avatar {
  background: var(--bw-primary);
  color: #fff;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layout-main {
  padding: 0;
  background: var(--bw-bg-page);
}

.main-inner {
  padding: 20px 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
