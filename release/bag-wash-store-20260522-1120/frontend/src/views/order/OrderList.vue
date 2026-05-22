<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDashboardStore } from '../../stores/dashboard'
import { useOrderStore } from '../../stores/order'
import { getWashServiceLabels, ORDER_STATUS_OPTIONS } from '../../constants/order'
import OrderStatusTag from '../../components/order/OrderStatusTag.vue'
import OrderFormDialog from '../../components/order/OrderFormDialog.vue'

const router = useRouter()
const orderStore = useOrderStore()
const dashboardStore = useDashboardStore()

const keyword = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const dialogVisible = ref(false)
const dialogMode = ref('add')
const editingId = ref('')

async function loadList() {
  loading.value = true
  try {
    await orderStore.fetchList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: statusFilter.value || undefined,
    })
  } finally {
    loading.value = false
  }
}

function openAdd() {
  dialogMode.value = 'add'
  editingId.value = ''
  dialogVisible.value = true
}

function openEdit(row) {
  dialogMode.value = 'edit'
  editingId.value = row.id
  dialogVisible.value = true
}

function goDetail(row) {
  router.push(`/orders/${row.id}`)
}

function onSearch() {
  page.value = 1
  loadList()
}

async function onSaved() {
  page.value = 1
  await loadList()
  await dashboardStore.refreshAll()
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除订单「${row.orderNo}」吗？删除后不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
  } catch {
    return
  }
  loading.value = true
  try {
    await orderStore.remove(row.id)
    ElMessage.success('订单已删除')
    await loadList()
    await dashboardStore.refreshAll()
  } finally {
    loading.value = false
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
          placeholder="搜索订单号 / 客户 / 手机 / 品牌"
          clearable
          class="search-input"
          @keyup.enter="onSearch"
          @clear="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="订单状态" clearable style="width: 160px" @change="onSearch">
          <el-option v-for="o in ORDER_STATUS_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-button type="primary" @click="onSearch">查询</el-button>
      </div>
      <el-button type="primary" @click="openAdd">
        <el-icon class="mr"><Plus /></el-icon>
        新增订单
      </el-button>
    </div>

    <el-table v-loading="loading" :data="orderStore.orders" border stripe class="data-table" empty-text="暂无订单">
      <el-table-column prop="orderNo" label="订单号" min-width="130" fixed />
      <el-table-column prop="customerName" label="客户" width="100" />
      <el-table-column prop="phone" label="联系电话" width="120" />
      <el-table-column prop="brand" label="品牌" min-width="110" show-overflow-tooltip />
      <el-table-column label="洗护项目" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          {{ getWashServiceLabels(row.washServices) }}
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额" width="90">
        <template #default="{ row }">¥{{ row.amount }}</template>
      </el-table-column>
      <el-table-column prop="orderTime" label="下单时间" width="170" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <OrderStatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row)">详情</el-button>
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="removeRow(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="orderStore.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <OrderFormDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :order-id="editingId"
      @saved="onSaved"
    />
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
  width: 280px;
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
