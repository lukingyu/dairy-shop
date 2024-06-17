<template>
  <div class="cart-mainer">
    <!--v-for遍历Map集合，元素指的是其中的一个个的键值对，每一个键值对本质上是一数组，0是key，1是value-->
    <cart-item-info-card v-for="kv in myCartItemMap" :productId="kv[0]" :key="dateKey"></cart-item-info-card>
  </div>
  <div class="two-buttons">
      <el-button class="clearCart-button" type="danger" @click="clearMyCart" v-show="store.state.myCartItemMap.size > 0">清空购物车</el-button>
      <div class="need-pay-price">
        <el-icon v-show="store.state.myCartItemMap.size > 0"><PriceTag /></el-icon>
        <span v-show="store.state.myCartItemMap.size > 0">总金额：{{store.state.needPayPrice}}元</span>
      </div>
      <el-button class="pay-button" type="primary" @click="openPayDialog" v-show="store.state.myCartItemMap.size > 0">立即支付</el-button>
  </div>

  <el-dialog
      v-model="payDialogVisible"
      title="付款码"
      width="400"
      align-center
  >
    <el-card style="max-width: 300px;margin-left: 31px" >
      <template #header>
        <div class="card-header">
          <span>请支付金额 {{store.state.needPayPrice}}元</span>
        </div>
      </template>
      <img src="@/assets/images/fuKuanMa.jpg" alt="" width="250px"/>
      <el-input v-model="province" style="width: 240px" placeholder="请输入收货地址省份" />
      <el-input v-model="city" style="width: 240px" placeholder="请输入收货地址城市" />
    </el-card>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="success" @click="pay">支付</el-button>
      </div>
    </template>
  </el-dialog>
  
  <img src="../assets/images/cartIsEmpty.png" alt="" v-if="store.state.myCartItemMap.size === 0">

</template>

<script setup>

import {markRaw, onMounted, reactive, ref} from "vue";
import axios from "axios";
import {ElMessage, ElMessageBox, ElNotification} from "element-plus";
import CartItemInfoCard from "@/pages/cartItemInfoCard.vue";
import {useStore} from "vuex";
import {Delete, PriceTag} from "@element-plus/icons-vue";

const store = useStore()

let myCartItems = ref([])
let myCartItemMap = reactive(store.state.myCartItemMap)

//完全渲染到浏览器之后，就发起请求获取个人所有的购物车项
onMounted(()=>{
  axios.get('/api/cart/getAllMyCartItems/'+localStorage.getItem("userId")).then((res)=>{
    if (res.data.code === 200){
      // myCartItems.value = res.data.data
      /*let dataArr = res.data.data
      for(let i in dataArr){
        myCartItemMap.value.set(dataArr[i].productId, {
          id:dataArr[i].id,
          userId:dataArr[i].userId,
          productName:dataArr[i].productName,
          productNum:dataArr[i].productNum,
          totalPrice:dataArr[i].totalPrice
        })
      }*/
      store.commit("FIRST_GIVE_TO_MyCartItemMap", res.data.data)
    }else {
      ElMessage({
        message:'出错了，请联系开发人员',
        type:'error'
      })
    }
  })
})

let dateKey = ref(Date.now())

function clearMyCart(){
  ElMessageBox.confirm(
      '您确定清空购物车吗?',
      'Warning',
      {
        confirmButtonText: '清空',
        cancelButtonText: '取消',
        type: 'warning',
        icon: markRaw(Delete)
      }
  )
      .then(() => {
        //先清空内存中的购物车项
        store.commit("CART_CLEAR")
        //发送数据。真正清空数据库中的购物车项
        let dto = {
          userId : window.localStorage.getItem("userId")
        }
        postClearMyCart(dto)
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '您已取消清空购物车'
        })
      })
}

let payDialogVisible = ref(false)
function openPayDialog(){
  payDialogVisible.value = true
}

function pay(){
  if (province.value==='' || city.value===''){
    ElNotification({
      title: '提示',
      message: '省份或城市不能为空哦',
      type: 'warning',
    })
  }else {
    //用户必须填写省份和城市，否则不进行支付操作
    const myCartItemMap = Object.fromEntries(store.state.myCartItemMap);
    let dto = {
      userId:window.localStorage.getItem("userId"),
      myCartItemMap:myCartItemMap,
      needPayPrice:store.state.needPayPrice,
      province:province.value,
      city:city.value
    }
    axios.post('/api/order/payGenOrderAndOrderItem', dto).then((res)=>{
      if (res.data.code === 200){
        //支付成功了，并且订单已经生成了
        ElNotification({
          title: '您好',
          message: '您已支付成功！',
          type: 'success',
        })
        //关闭对话框，清空省份和城市
        payDialogVisible.value = false
        province.value = ''
        city.value = ''
        //清空购物车
        //先清空内存中的购物车
        store.commit("CART_CLEAR")
        //然后发送数据。真正清空数据库中的购物车项
        let dto = {
          userId : window.localStorage.getItem("userId")
        }
        postClearMyCart(dto)
      }else{
        //支付失败
        ElNotification({
          title: '注意',
          message: '支付失败，请重试或者联系后台',
          type: 'error',
        })
      }
    })
  }
}

let needPayPrice = ref(store.state.needPayPrice)


let province = ref('')
let city = ref('')

//封装的方法（清空数据库中的购物车项）
function postClearMyCart(dto){
  axios.post("/api/cart/clearMyCart",dto).then((res)=>{
    if (res.data.code === 200){
      ElMessage({
        message:"购物车已清空",
        type:"success"
      })
    }else {
      ElMessage({
        message:"购物车清空失败",
        type:"error"
      })
    }
  })
}
</script>

<style scoped>
.cart-mainer{
  position: absolute;
  left: 34%;
}
.clearCart-button{
  position: absolute;
  right: 22%;
}
.pay-button{
  position: absolute;
  right: 14%;
}
.need-pay-price{
  display: inline-block;
  position: absolute;
  right: 1.5%;
  top: 13.5%;

}
</style>