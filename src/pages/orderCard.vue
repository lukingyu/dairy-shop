<template>
  <el-card style="width: 280px; display: inline-block" class="abc">
    <template #header>
      <span style="display: block"><font style="font-size: smaller">订单编号：{{store.state.orderMap.get(props.orderId).orderNo}}</font></span>
        <span><font style="font-size: smaller">下单时间：{{store.state.orderMap.get(props.orderId).createTime}}</font></span>
    </template>
    <el-text line-clamp="1">
      <span v-for="(orderItem,index) in store.state.orderMap.get(props.orderId).orderItems">{{orderItem.productName}}<span v-if="index !== arrLength-1">、</span></span>
    </el-text>
    <font>共{{arrLength}}种商品</font>
    <template #footer>
      <span><font style="font-size: smaller">订单金额：{{store.state.orderMap.get(props.orderId).allPrice}}元</font></span>
      <el-button type="info" :icon="Delete" size="small" style="position: absolute;right: 90px" @click="doEmitDelOrder(props.orderId)"/>
      <el-button type="primary" style="position: absolute;right: 5px" size="small" @click="doEmit(props.orderId)">查看详情</el-button>
    </template>
  </el-card>
</template>

<script setup>
import {useStore} from "vuex";
import {ref} from "vue";
import {Delete} from "@element-plus/icons-vue";

const props = defineProps(['orderId'])

const store = useStore()

let arrLength = ref(store.state.orderMap.get(props.orderId).orderItems.length)

let emit = defineEmits(['clickOrderDetailButton','clickDelOrderButton']);

function doEmit(orderId){
  emit('clickOrderDetailButton', orderId)
}

function doEmitDelOrder(orderId){
  emit('clickDelOrderButton', orderId)
}


</script>
<style scoped>
.abc:deep(.el-card__footer){
  padding-left: 20px;
  padding-right: 20px;
  padding-top:9px;
  padding-bottom:9px;
  position: relative;
}
.abc{
  margin-left: 5px;
  margin-right: 5px;
  background-color: powderblue;
}
</style>