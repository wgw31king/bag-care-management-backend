<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { useStaffStore, PERMISSION_OPTIONS } from '../../stores/staff'

const store = useStaffStore()
const auth = useAuthStore()

const keyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const forbidden = ref(false)

const dialogVisible = ref(false)
/** 编辑时若打开弹窗时已有登录账号，则禁止改账号（仅可改密码） */
const usernameLocked = ref(false)
/** 打开编辑弹窗时的登录账号，用于判断管理员是否只改资料 */
const originalUsername = ref('')
const form = ref({
  id: '',
  name: '',
  phone: '',
  role: '',
  status: '在职',
  permissions: [],
  username: '',
  password: '',
})

async function loadList() {
  loading.value = true
  forbidden.value = false
  try {
    await store.fetchList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: statusFilter.value || undefined,
    })
  } catch (err) {
    if (err?.response?.status === 403) {
      forbidden.value = true
    }
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  loadList()
}

function permLabel(value) {
  return PERMISSION_OPTIONS.find((p) => p.value === value)?.label ?? value
}

function openAdd() {
  usernameLocked.value = false
  originalUsername.value = ''
  form.value = {
    id: '',
    name: '',
    phone: '',
    role: '店员',
    status: '在职',
    permissions: ['dashboard', 'order'],
    username: '',
    password: '',
  }
  dialogVisible.value = true
}

const ASSIGNABLE = PERMISSION_OPTIONS.map((o) => o.value)

function normalizePermissions(list) {
  return (list || []).filter((p) => ASSIGNABLE.includes(p))
}

function openEdit(row) {
  originalUsername.value = row.username || ''
  usernameLocked.value = !auth.isManager && Boolean(row.username)
  form.value = {
    id: row.id,
    name: row.name,
    phone: row.phone,
    role: row.role,
    status: row.status,
    permissions: normalizePermissions(row.permissions),
    username: row.username || '',
    password: '',
  }
  dialogVisible.value = true
}

function buildStaffPayload() {
  const { name, phone, role, status, permissions, username, password } = form.value
  const payload = { name, phone, role, status, permissions }
  const u = username?.trim()

  // 新建：必须带账号+密码（与表单校验一致）
  if (!form.value.id) {
    payload.username = u
    payload.password = password
    return payload
  }

  // 编辑：管理员可只改资料 / 只改账号 / 只改密码
  if (auth.isManager) {
    if (password) {
      payload.password = password
      if (u) payload.username = u
    } else if (u && u !== originalUsername.value) {
      payload.username = u
    }
    return payload
  }

  if (u) payload.username = u
  if (password) payload.password = password
  return payload
}

async function save() {
  if (!form.value.name || !form.value.phone) {
    ElMessage.warning('请填写姓名与手机号')
    return
  }
  if (!form.value.permissions?.length) {
    ElMessage.warning('请至少勾选一个权限')
    return
  }
  if (!form.value.id) {
    if (!form.value.username?.trim() || !form.value.password) {
      ElMessage.warning('新建员工须同时填写登录账号与初始密码')
      return
    }
    if (form.value.password.length < 6) {
      ElMessage.warning('初始密码至少 6 位')
      return
    }
  } else if (form.value.password && form.value.password.length < 6) {
    ElMessage.warning('密码至少 6 位')
    return
  } else if (auth.isManager && form.value.id && !originalUsername.value) {
    const u = form.value.username?.trim()
    if (u && !form.value.password) {
      ElMessage.warning('首次开通登录须同时填写账号与密码')
      return
    }
    if (!u && form.value.password) {
      ElMessage.warning('开通登录时须填写账号')
      return
    }
  } else if (
    !auth.isManager &&
    form.value.id &&
    !usernameLocked.value &&
    form.value.username?.trim() &&
    !form.value.password
  ) {
    ElMessage.warning('补建登录账号时，账号与密码须同时填写')
    return
  }
  const payload = buildStaffPayload()
  try {
    if (form.value.id) {
      await store.update(form.value.id, payload)
      ElMessage.success('已更新')
    } else {
      await store.add(payload)
      ElMessage.success('已添加')
    }
    dialogVisible.value = false
    onSearch()
  } catch {
    // 错误由拦截器提示
  }
}

async function removeRow(row) {
  await ElMessageBox.confirm(`删除员工「${row.name}」？`, '确认', { type: 'warning' })
  try {
    await store.remove(row.id)
    ElMessage.success('已删除')
    loadList()
  } catch {
    // 错误由拦截器提示
  }
}

watch([page, pageSize], () => {
  loadList()
})

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="page-card">
    <el-result
      v-if="!auth.isManager"
      icon="warning"
      title="无访问权限"
      sub-title="仅门店管理员（admin 或岗位「店长」）可管理员工"
    />

    <el-result v-else-if="forbidden" icon="warning" title="无访问权限" sub-title="请求被拒绝（403）" />

    <template v-else>
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="keyword"
            placeholder="搜索姓名 / 手机 / 岗位"
            clearable
            class="search-input"
            @keyup.enter="onSearch"
            @clear="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="statusFilter" placeholder="在职状态" clearable style="width: 140px" @change="onSearch">
            <el-option label="在职" value="在职" />
            <el-option label="离职" value="离职" />
          </el-select>
          <el-button type="primary" @click="onSearch">查询</el-button>
        </div>
        <el-button type="primary" @click="openAdd">
          <el-icon class="mr"><Plus /></el-icon>
          新增员工
        </el-button>
      </div>

      <el-table v-loading="loading" :data="store.staffList" border stripe class="data-table" empty-text="暂无员工">
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="username" label="登录账号" width="120">
          <template #default="{ row }">
            <span v-if="row.username">{{ row.username }}</span>
            <el-tag v-else type="info" size="small" effect="plain">未开通</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="岗位" width="120" />
        <el-table-column label="权限" min-width="220">
          <template #default="{ row }">
            <el-tag v-for="p in row.permissions" :key="p" size="small" class="perm-tag" effect="plain">
              {{ permLabel(p) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '在职' ? 'success' : 'info'" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="removeRow(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="store.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>

      <el-dialog v-model="dialogVisible" :title="form.id ? '编辑员工权限' : '新增员工'" width="560px" destroy-on-close>
        <el-form :model="form" label-width="100px">
          <el-form-item label="姓名" required>
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="手机号" required>
            <el-input v-model="form.phone" maxlength="11" />
          </el-form-item>
          <el-form-item label="岗位">
            <el-input v-model="form.role" placeholder="如：洗护技师" />
          </el-form-item>
          <el-form-item label="在职状态">
            <el-radio-group v-model="form.status">
              <el-radio label="在职">在职</el-radio>
              <el-radio label="离职">离职</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="功能权限">
            <el-checkbox-group v-model="form.permissions">
              <el-checkbox v-for="opt in PERMISSION_OPTIONS" :key="opt.value" :label="opt.value" border>
                {{ opt.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <div class="section-hint">
            <template v-if="!form.id">新建须同时填写登录账号与初始密码（至少 6 位）。</template>
            <template v-else>已创建后，管理员可单独改资料、账号或密码，密码留空表示不修改。</template>
          </div>
          <el-form-item label="登录账号" :required="!form.id">
            <el-input
              v-model="form.username"
              :disabled="usernameLocked"
              placeholder="如 zhang01，勿用 admin"
              clearable
            />
          </el-form-item>
          <el-form-item :label="form.id ? '新密码' : '初始密码'" :required="!form.id">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              :placeholder="
                form.id
                  ? auth.isManager
                    ? '留空不改；可单独改账号或密码'
                    : '留空不改；补建账号须与账号同时填写'
                  : '至少 6 位'
              "
              clearable
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<style scoped>
.page-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--bw-border);
  padding: 20px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.search-input {
  width: 260px;
}

.data-table {
  width: 100%;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.perm-tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.mr {
  margin-right: 4px;
}

.section-hint {
  font-size: 13px;
  color: #78909c;
  margin: 8px 0 12px 100px;
}
</style>
