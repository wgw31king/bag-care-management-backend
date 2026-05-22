<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const users = ref([])
const selected = ref(null)
const password = ref('')

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    selected.value = null
    password.value = ''
    loading.value = true
    try {
      users.value = await auth.fetchSwitchableUsers()
    } catch {
      users.value = []
    } finally {
      loading.value = false
    }
  },
)

function close() {
  emit('update:modelValue', false)
}

function pickRow(row) {
  selected.value = row
  password.value = ''
}

async function confirmSwitch() {
  if (!selected.value) {
    ElMessage.warning('请选择要切换的员工')
    return
  }
  if (!password.value) {
    ElMessage.warning('请输入该员工的登录密码')
    return
  }
  submitting.value = true
  try {
    await auth.switchToUser(selected.value.username, password.value)
    ElMessage.success(`已切换为 ${selected.value.name}`)
    close()
    router.push('/dashboard')
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="切换用户"
    width="480px"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="hint">
      每位员工使用独立账号登录后，菜单与接口按「功能权限」隔离。切换时需输入对方密码。
    </p>
    <el-table
      v-loading="loading"
      :data="users"
      highlight-current-row
      max-height="240"
      empty-text="暂无已配置登录账号的在职员工"
      @current-change="pickRow"
    >
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="username" label="登录账号" min-width="120" />
      <el-table-column prop="role" label="岗位" width="100" />
    </el-table>
    <el-form v-if="selected" label-width="88px" class="pwd-form">
      <el-form-item label="当前选中">
        <span>{{ selected.name }}（{{ selected.username }}）</span>
      </el-form-item>
      <el-form-item label="登录密码" required>
        <el-input
          v-model="password"
          type="password"
          show-password
          placeholder="输入该员工密码以切换"
          @keyup.enter="confirmSwitch"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="confirmSwitch">确认切换</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.hint {
  font-size: 13px;
  color: #607d8b;
  line-height: 1.6;
  margin: 0 0 12px;
}

.pwd-form {
  margin-top: 16px;
}
</style>
