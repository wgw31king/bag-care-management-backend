<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const loading = ref(false)

async function onSubmit() {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  loading.value = true
  try {
    await auth.login(form.value.username, form.value.password)
    ElMessage.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.push(redirect)
  } catch {
    // 错误信息由 request 拦截器统一提示
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg" />
    <div class="login-card">
      <div class="login-brand">
        <div class="logo" />
        <div>
          <h1>包包洗护门店</h1>
          <p>订单管理系统</p>
        </div>
      </div>
      <el-form :model="form" label-position="top" class="login-form" @submit.prevent="onSubmit">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" clearable />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" class="login-btn" :loading="loading" native-type="submit" size="large">
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: #0a3d7a;
}

.login-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(100, 181, 246, 0.45), transparent),
    radial-gradient(ellipse 60% 40% at 90% 20%, rgba(33, 150, 243, 0.35), transparent),
    linear-gradient(160deg, #062a52 0%, #0d47a1 40%, #1565c0 100%);
}

.login-card {
  position: relative;
  z-index: 1;
  width: 400px;
  max-width: 92vw;
  padding: 36px 36px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 24px 80px rgba(2, 24, 68, 0.35);
}

.login-brand {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 28px;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  box-shadow: 0 8px 20px rgba(25, 118, 210, 0.35);
}

.login-brand h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0d47a1;
}

.login-brand p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #607d8b;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.login-btn {
  width: 100%;
  margin-top: 8px;
}
</style>
