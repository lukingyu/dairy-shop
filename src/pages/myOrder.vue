<template>

  <div style="margin-left: 8px">
    <order-card v-for="kv in orderMap" :orderId="kv[0]" :key="dateKey" @clickOrderDetailButton="doOrderDetailButton" @clickDelOrderButton="doDelOrderButton"></order-card>
  </div>
  <!--自定义事件，子组件触发事件，然后在父组件中监视这个事件，一旦发生，就打开这个对话框（订单详情）-->
  <el-dialog v-model="orderDetailDialogVisible" title="订单详情" width="433">
    <el-card style="width: 400px" v-for="(orderItem,index) in store.state.orderMap.get(orderId).orderItems" :key="index">
      <img :src="orderItem.imageUrl" alt="" width="70px" height="70px">
      <div style="display: inline-block; position: absolute;top: 5px;margin-left: 7px">
        <span><el-tooltip :content="orderItem.productName"><el-text line-clamp="1" style="width: 200px">{{orderItem.productName}}</el-text></el-tooltip></span> <br>
        <span><font style="font-size: smaller;color: #545c64">数量X {{orderItem.productNum}}</font></span>
      </div>
      <div style="display: inline-block; position: absolute;top: 5px;right: 5px">
        <span><font style="font-size: small">价格：{{orderItem.itemPrice}}元</font></span>
      </div>

      <template #footer>
        <el-button type="info" disabled v-if="orderItem.isEvaluated === 1">已评价</el-button>
        <el-button type="primary" plain v-if="orderItem.isEvaluated === 0" @click="openEvaluateDialog(orderItem.productId)">我要评价</el-button>
      </template>
    </el-card>
    <div style="margin-top: 10px;margin-bottom: 10px">
      <div style="width: 400px;position: relative"><font>订单编号</font><font style="position: absolute;right: 2px">{{store.state.orderMap.get(orderId).orderNo}}</font></div>
      <div style="width: 400px;position: relative"><font>支付时间</font><font style="position: absolute;right: 2px">{{store.state.orderMap.get(orderId).createTime}}</font></div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="orderDetailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="orderDetailDialogVisible = false">已阅</el-button>
      </div>
    </template>
  </el-dialog>

  <!--评价对话框-->
  <el-dialog v-model="evaluateDialogVisible" title="请您对此订单中该商品进行评价" width="320">
    <h5 style="margin: 0">评分等级</h5>
    <el-rate v-model="grade" size="large" :texts="['非常差', '差', '一般', '好', '非常好']"  show-text/>
    <br>
    <el-input
        v-model="comments"
        style="width: 288px; margin-top: 5px;margin-bottom: 5px"
        type="textarea"
        placeholder="求好评~~~"
        maxlength="100"
        show-word-limit
        prefix-icon="EditPen"
        :rows="3"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button size="small" @click="evaluateDialogVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="evaluate">提交评价</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import OrderCard from "@/pages/orderCard.vue";
import {onMounted, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage, ElMessageBox, ElNotification} from "element-plus";
import {useStore} from "vuex";

const store = useStore()

let orderMap = reactive(store.state.orderMap)

onMounted(()=>{
  //该组件渲染完之后，就查询所有的订单信息VO响应数据，是一个数组。
  axios.get('/api/order/getAllMyOrderVOs/'+localStorage.getItem('userId')).then((res)=>{
    if (res.data.code === 200){
      //查询订单VOs成功，将数据封装到vuex
      store.commit('FIRST_GIVE_TO_OrderMap', res.data.data)
    }else {
      //查询失败，消息通知
      ElNotification({
        title: 'Error',
        message: '查询你的订单信息时出错了',
        type: 'error',
      })
    }
  })
})

let dateKey = ref(Date.now())

let orderDetailDialogVisible = ref(false)

let orderId = ref(null)
let productIdWhenYouEvaluate = ref(null)

function doOrderDetailButton(orderIdFromOtherVC){ //orderId是子组件传过来的。通过自定义事件
  orderId.value = orderIdFromOtherVC
  orderDetailDialogVisible.value = true
}

function doDelOrderButton(orderIdFromOtherVC){
  ElMessageBox.confirm(
      '您确定要删除此订单吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  )
      .then(() => {
        //先删除缓存中的某个订单
        store.commit("DEL_ONE_ORDER", orderIdFromOtherVC)
        //再删除数据库的真实订单
        axios.post('/api/order/delOrder/'+orderIdFromOtherVC).then((res)=>{
          if (res.data.code===200){
            ElNotification.success("订单删除成功")
          }
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '您取消了删除',
        })
      })

}

let evaluateDialogVisible = ref(false)
function openEvaluateDialog(productId){
  evaluateDialogVisible.value = true
  productIdWhenYouEvaluate.value = productId
}
//评分的分数（0-5），用户必须选择一个分数，否则不能评价
let grade = ref(0)
//评价文本
let comments = ref('')
//评级函数
function evaluate(){
  if (grade.value === 0){
    //如果没有选择评分，就不进行真正的评价操作
    ElMessage({
      message:'请您选择商品的评分哦',
      type:'info'
    })
  }else {
    //先将内存中的该orderItem设为已评价
    let obj = {
      orderId:orderId.value,
      productId:productIdWhenYouEvaluate.value
    }
    store.commit("SET_ORDER_ITEM_IS_EVALUATED", obj)
    //然后发送dto数据，真正的进行评价
    let dto = {
      productId : productIdWhenYouEvaluate.value,
      orderId : orderId.value,
      userId : window.localStorage.getItem("userId"),
      grade:grade.value,
      comments:comments.value
    }
    axios.post('/api/order/evaluateProduct', dto).then((res)=>{
      if (res.data.code === 200){
        //该订单中的该订单项(商品)评价成功
        //关闭评价对话框
        evaluateDialogVisible.value = false
        //弹出成功消息
        ElMessage({
          message:'评价成功！',
          type:'success'
        })
        //将grade和comments重置
        grade.value = 0
        comments.value = ''
      }else {
        //评价失败，弹出失败信息
        ElMessage({
          message:'评价失败，请联系后台',
          type:'error'
        })
      }
    })
  }
}
</script>

<style scoped>
.el-card{
  position: relative;
  margin-bottom: 5px;
}
.el-card:deep(.el-card__body){
  padding: 5px;
}
.el-card:deep(.el-card__footer){
  padding-top: 5px;
  padding-bottom: 8px;
}
</style>