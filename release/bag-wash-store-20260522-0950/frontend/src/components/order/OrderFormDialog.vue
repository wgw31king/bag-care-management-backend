<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useDashboardStore } from '../../stores/dashboard'
import { useOrderStore } from '../../stores/order'
import request from '../../api/request'
import {
  ORDER_STATUS_OPTIONS,
  WASH_SERVICE_OPTIONS,
} from '../../constants/order'
import { addBeijingDays, beijingNowDateTime, beijingToday } from '../../utils/beijing-date'
import { resolveUploadUrl, toStoredUploadUrl } from '../../utils/upload-url'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'add' }, // add | edit
  orderId: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const orderStore = useOrderStore()
const dashboardStore = useDashboardStore()
const formRef = ref()
const fileList = ref([])
const submitting = ref(false)

const emptyForm = () => ({
  customerName: '',
  phone: '',
  wechatNote: '',
  brand: '',
  style: '',
  color: '',
  material: '',
  defectDesc: '',
  defectImages: [],
  washServices: [],
  orderTime: '',
  expectPickupTime: '',
  amount: 0,
  prepay: 0,
  remark: '',
  status: 'pending_receive',
})

const form = ref(emptyForm())

const title = computed(() => (props.mode === 'edit' ? '编辑订单' : '新增订单'))

const rules = {
  customerName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  brand: [{ required: true, message: '请输入包包品牌', trigger: 'blur' }],
  style: [{ required: true, message: '请输入包包款式', trigger: 'blur' }],
  color: [{ required: true, message: '请输入颜色', trigger: 'blur' }],
  material: [{ required: true, message: '请输入材质', trigger: 'blur' }],
  defectDesc: [{ required: true, message: '请填写到店瑕疵描述', trigger: 'blur' }],
  washServices: [{ type: 'array', required: true, message: '请选择洗护项目', trigger: 'change' }],
  orderTime: [{ required: true, message: '请选择下单时间', trigger: 'change' }],
  expectPickupTime: [{ required: true, message: '请选择预计取件时间', trigger: 'change' }],
  amount: [{ required: true, message: '请输入订单金额', trigger: 'blur' }],
  prepay: [{ required: true, message: '请输入预付款', trigger: 'blur' }],
  status: [{ required: true, message: '请选择订单状态', trigger: 'change' }],
}

async function fillFormFromOrder(id) {
  const row = orderStore.getById(id) || (await orderStore.fetchOne(id))
  if (!row) return false
  form.value = {
    customerName: row.customerName,
    phone: row.phone,
    wechatNote: row.wechatNote ?? '',
    brand: row.brand,
    style: row.style,
    color: row.color,
    material: row.material,
    defectDesc: row.defectDesc,
    defectImages: [...(row.defectImages || [])],
    washServices: [...(row.washServices || [])],
    orderTime: row.orderTime,
    expectPickupTime: row.expectPickupTime,
    amount: row.amount,
    prepay: row.prepay,
    remark: row.remark ?? '',
    status: row.status,
  }
  fileList.value = (row.defectImages || []).map((url, i) => ({
    uid: `saved-${i}-${url}`,
    name: `瑕疵图${i + 1}`,
    url: resolveUploadUrl(url),
    status: 'success',
  }))
  return true
}

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    if (props.mode === 'edit' && props.orderId) {
      const ok = await fillFormFromOrder(props.orderId)
      if (ok) return
    }
    form.value = emptyForm()
    form.value.orderTime = beijingNowDateTime()
    form.value.expectPickupTime = `${addBeijingDays(beijingToday(), 3)} 18:00:00`
    fileList.value = []
  },
)

function syncImagesFromFileList() {
  form.value.defectImages = fileList.value
    .map((f) => toStoredUploadUrl(f.url))
    .filter((url) => url && !url.startsWith('data:'))
}

async function handleRequest(options) {
  const formData = new FormData()
  formData.append('file', options.file)
  try {
    const res = await request.post('/upload/images', formData)
    const data = res.data || {}
    const urls = data.urls ?? (data.url ? [data.url] : [])
    const stored = urls[0]
    if (!stored) {
      options.onError?.(new Error('upload empty'))
      return
    }
    // el-upload 选图后已自动加入 fileList，勿再 push，否则一张图会出现两条
    const target = fileList.value.find(
      (f) => f.uid === options.file.uid || f.name === options.file.name,
    )
    if (target) {
      target.url = resolveUploadUrl(stored)
      target.status = 'success'
    }
    syncImagesFromFileList()
    options.onSuccess?.({ url: stored }, options.file)
  } catch (err) {
    const idx = fileList.value.findIndex((f) => f.uid === options.file.uid)
    if (idx >= 0) fileList.value.splice(idx, 1)
    options.onError?.(err)
  }
}

function handleRemove() {
  syncImagesFromFileList()
}

function handlePreview(file) {
  if (file.url) window.open(file.url, '_blank')
}

function close() {
  emit('update:modelValue', false)
}

async function submit() {
  const valid = await formRef.value?.validate().then(() => true).catch(() => false)
  if (!valid) return
  syncImagesFromFileList()
  const payload = { ...form.value }
  submitting.value = true
  try {
    if (props.mode === 'edit' && props.orderId) {
      await orderStore.update(props.orderId, payload)
      ElMessage.success('订单已更新')
    } else {
      await orderStore.add(payload)
      ElMessage.success('订单已创建')
    }
    await dashboardStore.refreshAll()
    emit('saved')
    close()
  } catch {
    // 错误由拦截器提示
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="860px"
    align-center
    destroy-on-close
    class="order-form-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-scrollbar max-height="70vh">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="order-form">
        <div class="section-title">客户信息</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="form.customerName" placeholder="客户姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="手机号" maxlength="11" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="微信备注" prop="wechatNote">
              <el-input v-model="form.wechatNote" placeholder="微信号 / 备注" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">包包信息</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="包包品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="品牌" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="包包款式" prop="style">
              <el-input v-model="form.style" placeholder="款式" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="颜色" prop="color">
              <el-input v-model="form.color" placeholder="颜色" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="材质" prop="material">
              <el-input v-model="form.material" placeholder="材质" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">瑕疵与图片</div>
        <el-form-item label="瑕疵描述" prop="defectDesc">
          <el-input v-model="form.defectDesc" type="textarea" :rows="3" placeholder="到店检查结果、瑕疵位置与程度" />
        </el-form-item>
        <el-form-item label="瑕疵图片">
          <el-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :http-request="handleRequest"
            :on-remove="handleRemove"
            :on-preview="handlePreview"
            accept="image/*"
            multiple
            :limit="9"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <p class="upload-tip">支持多图，上传后保存为服务器 URL（非 base64）。</p>
        </el-form-item>

        <div class="section-title">洗护与时间</div>
        <el-form-item label="洗护项目" prop="washServices">
          <el-checkbox-group v-model="form.washServices">
            <el-checkbox v-for="opt in WASH_SERVICE_OPTIONS" :key="opt.value" :label="opt.value" border>
              {{ opt.label }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="下单时间" prop="orderTime">
              <el-date-picker
                v-model="form.orderTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择下单时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计取件" prop="expectPickupTime">
              <el-date-picker
                v-model="form.expectPickupTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="预计取件时间"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="section-title">金额与状态</div>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="订单金额" prop="amount">
              <el-input-number v-model="form.amount" :min="0" :step="10" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预付款" prop="prepay">
              <el-input-number v-model="form.prepay" :min="0" :step="10" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="form.status" placeholder="状态" style="width: 100%">
                <el-option v-for="o in ORDER_STATUS_OPTIONS" :key="o.value" :label="o.label" :value="o.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="订单备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="内部备注、客户特殊要求等" />
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--bw-primary);
  margin: 4px 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid #e3f2fd;
}

.order-form :deep(.el-checkbox) {
  margin-right: 10px;
  margin-bottom: 8px;
}

.upload-tip {
  margin: 6px 0 0;
  font-size: 12px;
  color: #90a4ae;
}
</style>
