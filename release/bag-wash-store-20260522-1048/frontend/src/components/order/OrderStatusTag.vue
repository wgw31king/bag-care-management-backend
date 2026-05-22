<script setup>
import { ORDER_STATUS_OPTIONS, ORDER_STATUS_TAG_TYPE, getStatusLabel } from '../../constants/order'

const props = defineProps({
  status: { type: String, required: true },
})

const type = () => ORDER_STATUS_TAG_TYPE[props.status] ?? 'info'
</script>

<template>
  <el-tag :type="type()" effect="light" class="status-tag">
    {{ getStatusLabel(status) }}
  </el-tag>
</template>

<style scoped>
.status-tag {
  border-radius: 6px;
  font-weight: 500;
}
</style>
