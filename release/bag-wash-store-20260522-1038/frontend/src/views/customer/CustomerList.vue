<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCustomerStore } from '../../stores/customer'

const store = useCustomerStore()

const keyword = ref('')
const tagFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const dialogVisible = ref(false)
const form = ref({
  id: '',
  name: '',
  phone: '',
  wechat: '',
  tag: '普通',
  remark: '',
})
const isEdit = ref(false)

const tagOptions = [
  { label: '全部标签', value: '' },
  { label: '普通', value: '普通' },
  { label: 'VIP', value: 'VIP' },
  { label: '储值', value: '储值' },
]

async function loadList() {
  loading.value = true
  try {
    await store.fetchList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      tag: tagFilter.value || undefined,
    })
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  loadList()
}

function tagType(tag) {
  if (tag === 'VIP') return 'danger'
  if (tag === '储值') return 'warning'
  return 'info'
}

function openAdd() {
  isEdit.value = false
  form.value = { id: '', name: '', phone: '', wechat: '', tag: '普通', remark: '' }
  dialogVisible.value = true
}

function openEdit(row) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

function buildCustomerPayload() {
  const { name, phone, wechat, tag, remark } = form.value
  return { name, phone, wechat, tag, remark }
}

async function saveCustomer() {
  if (!form.value.name || !form.value.phone) {
    ElMessage.warning('请填写姓名与手机号')
    return
  }
  const payload = buildCustomerPayload()
  try {
    if (isEdit.value) {
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
  await ElMessageBox.confirm(`确定删除客户「${row.name}」？`, '确认', { type: 'warning' })
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
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="keyword"
          placeholder="搜索姓名 / 手机 / 微信"
          clearable
          class="search-input"
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="tagFilter" placeholder="客户标签" clearable style="width: 140px" @change="onSearch">
          <el-option v-for="o in tagOptions.slice(1)" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-button type="primary" @click="onSearch">查询</el-button>
      </div>
      <el-button type="primary" @click="openAdd">
        <el-icon class="mr"><Plus /></el-icon>
        新增客户
      </el-button>
    </div>

    <el-table v-loading="loading" :data="store.customers" border stripe class="data-table" empty-text="暂无客户">
      <el-table-column prop="name" label="客户姓名" width="120" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="wechat" label="微信" min-width="120" show-overflow-tooltip />
      <el-table-column label="标签" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="tagType(row.tag)" effect="plain">{{ row.tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderCount" label="关联订单数" width="120" align="center" />
      <el-table-column prop="lastVisit" label="最近到店" width="120" />
      <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '新增客户'" width="520px" destroy-on-close>
      <el-form :model="form" label-width="96px">
        <el-form-item label="客户姓名" required>
          <el-input v-model="form.name" placeholder="姓名" />
        </el-form-item>
        <el-form-item label="联系电话" required>
          <el-input v-model="form.phone" placeholder="手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="微信">
          <el-input v-model="form.wechat" placeholder="微信号" />
        </el-form-item>
        <el-form-item label="客户标签">
          <el-radio-group v-model="form.tag">
            <el-radio label="普通">普通</el-radio>
            <el-radio label="VIP">VIP</el-radio>
            <el-radio label="储值">储值</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCustomer">保存</el-button>
      </template>
    </el-dialog>
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

.mr {
  margin-right: 4px;
}
</style>
