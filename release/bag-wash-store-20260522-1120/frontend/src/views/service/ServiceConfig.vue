<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useServiceStore } from '../../stores/service'

const store = useServiceStore()

const keyword = ref('')
const enabledFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const dialogVisible = ref(false)
const form = ref({
  id: '',
  code: '',
  name: '',
  price: 0,
  durationMin: 60,
  enabled: true,
  sort: 1,
})

async function loadList() {
  loading.value = true
  try {
    await store.fetchList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      enabled: enabledFilter.value === '' ? undefined : enabledFilter.value,
    })
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  loadList()
}

function openAdd() {
  form.value = {
    id: '',
    code: '',
    name: '',
    price: 199,
    durationMin: 120,
    enabled: true,
    sort: (store.services.length || 0) + 1,
  }
  dialogVisible.value = true
}

function openEdit(row) {
  form.value = { ...row }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.name) {
    ElMessage.warning('请填写项目名称')
    return
  }
  try {
    await store.save({ ...form.value })
    ElMessage.success('已保存')
    dialogVisible.value = false
    onSearch()
  } catch {
    // 错误由拦截器提示
  }
}

async function removeRow(row) {
  await ElMessageBox.confirm(`删除项目「${row.name}」？`, '确认', { type: 'warning' })
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
          placeholder="搜索项目名称"
          clearable
          class="search-input"
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="enabledFilter" placeholder="启用状态" clearable style="width: 140px" @change="onSearch">
          <el-option label="已启用" value="1" />
          <el-option label="已停用" value="0" />
        </el-select>
        <el-button type="primary" @click="onSearch">查询</el-button>
      </div>
      <el-button type="primary" @click="openAdd">
        <el-icon class="mr"><Plus /></el-icon>
        新增项目
      </el-button>
    </div>

    <el-table v-loading="loading" :data="store.services" border stripe class="data-table" empty-text="暂无服务项目">
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column prop="code" label="编码" width="120" show-overflow-tooltip />
      <el-table-column prop="name" label="项目名称" min-width="140" />
      <el-table-column prop="price" label="标价（元）" width="120" align="right">
        <template #default="{ row }">¥ {{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="durationMin" label="参考耗时（分钟）" width="160" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" effect="plain">{{ row.enabled ? '启用' : '停用' }}</el-tag>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑服务' : '新增服务'" width="520px" destroy-on-close>
      <el-form :model="form" label-width="120px">
        <el-form-item label="项目编码">
          <el-input v-model="form.code" placeholder="如：fine_wash" />
        </el-form-item>
        <el-form-item label="项目名称" required>
          <el-input v-model="form.name" placeholder="如：精洗" />
        </el-form-item>
        <el-form-item label="标价（元）">
          <el-input-number v-model="form.price" :min="0" :step="10" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="参考耗时（分）">
          <el-input-number v-model="form.durationMin" :min="15" :step="15" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="1" :step="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
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
  width: 220px;
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
