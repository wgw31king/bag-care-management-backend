<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../../stores/order'
import { getWashServiceLabels, getStatusLabel } from '../../constants/order'
import OrderStatusTag from '../../components/order/OrderStatusTag.vue'
import OrderFormDialog from '../../components/order/OrderFormDialog.vue'
import { resolveUploadUrl } from '../../utils/upload-url'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const id = computed(() => route.params.id)
const order = ref(null)
const loading = ref(false)

const dialogVisible = ref(false)

const defectImageUrls = computed(() =>
  (order.value?.defectImages || []).map((url) => resolveUploadUrl(url)),
)

async function loadOrder() {
  loading.value = true
  try {
    order.value = (await orderStore.fetchOne(id.value)) || null
  } finally {
    loading.value = false
  }
}

watch(id, () => {
  loadOrder()
})

onMounted(() => {
  loadOrder()
})

function back() {
  router.push('/orders')
}

function openEdit() {
  if (!order.value) return
  dialogVisible.value = true
}

function onSaved() {
  loadOrder()
}
</script>

<template>
  <div v-loading="loading">
    <div v-if="order" class="detail-wrap">
      <div class="detail-head">
        <div>
          <el-button text type="primary" @click="back">
            <el-icon><ArrowLeft /></el-icon>
            返回列表
          </el-button>
          <h2 class="title">
            订单 {{ order.orderNo }}
            <OrderStatusTag :status="order.status" class="ml" />
          </h2>
          <p class="sub">客户：{{ order.customerName }} · {{ order.phone }}</p>
        </div>
        <el-button type="primary" @click="openEdit">编辑订单</el-button>
      </div>

      <el-row :gutter="16">
        <el-col :xs="24" :lg="14">
          <el-card shadow="never" class="block">
            <template #header><span class="block-title">客户与沟通</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="客户姓名">{{ order.customerName }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ order.phone }}</el-descriptions-item>
              <el-descriptions-item label="微信备注" :span="2">{{ order.wechatNote || '—' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="block">
            <template #header><span class="block-title">包包信息</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="品牌">{{ order.brand }}</el-descriptions-item>
              <el-descriptions-item label="款式">{{ order.style }}</el-descriptions-item>
              <el-descriptions-item label="颜色">{{ order.color }}</el-descriptions-item>
              <el-descriptions-item label="材质">{{ order.material }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="block">
            <template #header><span class="block-title">瑕疵与图片</span></template>
            <p class="defect-text">{{ order.defectDesc }}</p>
            <div v-if="defectImageUrls.length" class="img-row">
              <el-image
                v-for="(src, i) in defectImageUrls"
                :key="i"
                :src="src"
                :preview-src-list="defectImageUrls"
                :initial-index="i"
                fit="cover"
                class="thumb"
              />
            </div>
            <el-empty v-else description="暂无瑕疵图片" :image-size="80" />
          </el-card>
        </el-col>

        <el-col :xs="24" :lg="10">
          <el-card shadow="never" class="block">
            <template #header><span class="block-title">洗护与时间</span></template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="洗护项目">{{ getWashServiceLabels(order.washServices) }}</el-descriptions-item>
              <el-descriptions-item label="下单时间">{{ order.orderTime }}</el-descriptions-item>
              <el-descriptions-item label="预计取件">{{ order.expectPickupTime }}</el-descriptions-item>
              <el-descriptions-item label="订单状态">{{ getStatusLabel(order.status) }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="block">
            <template #header><span class="block-title">金额与备注</span></template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="订单金额">¥ {{ order.amount }}</el-descriptions-item>
              <el-descriptions-item label="预付款">¥ {{ order.prepay }}</el-descriptions-item>
              <el-descriptions-item label="订单备注">{{ order.remark || '—' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>

      <OrderFormDialog v-model="dialogVisible" mode="edit" :order-id="order.id" @saved="onSaved" />
    </div>

    <el-result v-else-if="!loading" icon="warning" title="未找到订单" sub-title="请从订单列表进入或检查链接">
      <template #extra>
        <el-button type="primary" @click="back">返回订单列表</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.detail-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  background: #fff;
  border: 1px solid var(--bw-border);
  border-radius: 12px;
  padding: 16px 20px;
}

.title {
  margin: 8px 0 4px;
  font-size: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.ml {
  margin-left: 4px;
}

.sub {
  margin: 0;
  color: var(--bw-text-secondary);
  font-size: 14px;
}

.block {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid var(--bw-border);
}

.block-title {
  font-weight: 600;
}

.defect-text {
  margin: 0 0 12px;
  line-height: 1.6;
  color: #37474f;
}

.img-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.thumb {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  border: 1px solid var(--bw-border);
}
</style>
