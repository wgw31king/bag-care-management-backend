import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '数据仪表盘', icon: 'Odometer', permission: 'dashboard' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/order/OrderList.vue'),
        meta: { title: '订单管理', icon: 'Tickets', permission: 'order' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/OrderDetail.vue'),
        meta: { title: '订单详情', hidden: true },
      },
      {
        path: 'customers',
        name: 'Customers',
        component: () => import('../views/customer/CustomerList.vue'),
        meta: { title: '客户管理', icon: 'User', permission: 'customer' },
      },
      {
        path: 'services',
        name: 'Services',
        component: () => import('../views/service/ServiceConfig.vue'),
        meta: { title: '洗护服务配置', icon: 'Setting', permission: 'service' },
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('../views/staff/StaffManage.vue'),
        meta: { title: '员工权限', icon: 'Lock', requireManager: true },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const ROUTE_PERMISSION = {
  '/dashboard': 'dashboard',
  '/orders': 'order',
  '/customers': 'customer',
  '/services': 'service',
  '/staff': 'staff',
}

function firstAllowedPath(auth) {
  const order = ['/dashboard', '/orders', '/customers', '/services', '/staff']
  return order.find((p) => auth.hasPermission(ROUTE_PERMISSION[p])) || '/login'
}

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  if (to.path === '/login' && auth.isLoggedIn) {
    next(firstAllowedPath(auth))
    return
  }
  if (to.meta.requireManager && auth.isLoggedIn && !auth.isManager) {
    next(firstAllowedPath(auth))
    return
  }
  const needPerm = to.meta.permission
  if (needPerm && auth.isLoggedIn && !auth.hasPermission(needPerm)) {
    next(firstAllowedPath(auth))
    return
  }
  if (to.path.startsWith('/orders/') && auth.isLoggedIn && !auth.hasPermission('order')) {
    next(firstAllowedPath(auth))
    return
  }
  document.title = to.meta.title ? `${to.meta.title} · 包包洗护门店` : '包包洗护门店'
  next()
})

export default router
