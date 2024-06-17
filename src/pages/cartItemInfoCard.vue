<template>
  <el-card style="width: 370px; background-color: whitesmoke;margin-bottom: 10px" shadow='hover' class="el-card">
    <template #header>
      <div class="card-header">
        <el-icon><Goods /></el-icon>
        <span class="proName"><el-tooltip :content="store.state.myCartItemMap.get(props.productId).productName"><el-text line-clamp="1" style="width: 200px;color: cornflowerblue">{{store.state.myCartItemMap.get(props.productId).productName}}</el-text></el-tooltip></span>
        <span class="icons">
          <span style="position: relative;bottom: 2px">数量</span>
          <el-icon class="reduceIcon" @click="cartItemReduceNumById"><Remove/></el-icon>
<!--          <span class="proNum">{{props.arr[1].productNum}}</span>-->
          <span class="proNum">{{store.state.myCartItemMap.get(props.productId).productNum}}</span>
          <el-icon class="plusIcon" @click="cartItemPlusNumById"><CirclePlus /></el-icon>
        </span>
      </div>
    </template>

    <span>单价：{{store.state.myCartItemMap.get(props.productId).unitPrice}}元</span>
    <span style="position: absolute; left: 160px">总价：{{store.state.myCartItemMap.get(props.productId).totalPrice}}元</span>
    <el-button class="delete-button" type="danger" :icon="Delete" circle plain @click="deleteMyCartItem"/>

  </el-card>
</template>

<script setup>

import {CirclePlus, Delete, Goods, Remove} from "@element-plus/icons-vue";
import {useStore} from "vuex";
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import {markRaw} from "vue";

const store = useStore()

const props = defineProps(['productId'])

function cartItemReduceNumById(){
  //如果该商品数量大于等于2，才进行减操作。
  if (store.state.myCartItemMap.get(props.productId).productNum >=2){
    store.commit("CART_REDUCE_NUM_BY_ID", props.productId)
    //然后真正的减少数据库中的数量
    let dto = {
      userId:window.localStorage.getItem("userId"),
      productId:props.productId,
      unitPrice:store.state.myCartItemMap.get(props.productId).unitPrice
    }
    postReduceProNum(dto)
  }else if(store.state.myCartItemMap.get(props.productId).productNum === 1){
    //等于1，就不减了，直接移除就行
    store.commit("DELETE_PRODUCT_FROM_CART_BY_ID", props.productId)
    //然后真正的移除数据库购物车中的该商品项
    let dto = {
      userId:window.localStorage.getItem("userId"),
      productId:props.productId,
    }
    postDeletePro(dto)
  }

}

function cartItemPlusNumById(){
  //因为是加，不用考虑负数的问题，直接加就行
  store.commit("CART_PLUS_NUM_BY_ID", props.productId)
  //然后真正的增加数据库中的数量
  let dto = {
    userId:window.localStorage.getItem("userId"),
    productId:props.productId,
    unitPrice:store.state.myCartItemMap.get(props.productId).unitPrice
  }
  postPlusProNum(dto)
}
function deleteMyCartItem(){
  ElMessageBox.confirm(
      '您确定将该商品从购物车中移除吗?',
      'Warning',
      {
        confirmButtonText: '移除',
        cancelButtonText: '取消',
        type: 'warning',
        icon: markRaw(Delete)
      }
  )
      .then(() => {
        //先移除内存中的该购物车项
        store.commit("DELETE_PRODUCT_FROM_CART_BY_ID", props.productId)
        //然后真正的移除数据库购物车中的该商品项
        let dto = {
          userId:window.localStorage.getItem("userId"),
          productId:props.productId,
        }
        postDeletePro(dto)

        ElMessage({
          type: 'success',
          message: '商品移除成功',
        })
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '您已取消移除',
        })
      })
}

/*function clearMyCart(){
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

      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: '您已取消清空购物车'
        })
      })
}*/
//封装减数量的方法
function postReduceProNum(dto){
  axios.post('/api/cart/reduceCartItemProductNum',dto).then((res)=>{
    if (res.data.code === 200){
      //do nothing
    }else {
      ElMessage({
        message:'减少购物车商品数量时出错',
        type:'error'
      })
    }
  })
}
//封装删除商品的方法
function postDeletePro(dto){
  axios.post('/api/cart/deleteCartItemProduct',dto).then((res)=>{
    if (res.data.code === 200){
      //do nothing
    }else {
      ElMessage({
        message:'删除购物车商品项时出错',
        type:'error'
      })
    }
  })
}
//封装加数量的方法
function postPlusProNum(dto){
  axios.post('/api/cart/plusCartItemProductNum',dto).then((res)=>{
    if (res.data.code === 200){
      //do nothing
    }else {
      ElMessage({
        message:'增加购物车商品数量时出错',
        type:'error'
      })
    }
  })
}

</script>


<style scoped>
.proName{
  margin-right: 20px;
  margin-left: 10px;
}
.icons{
  margin-right: 0;
  position: absolute;
  right: 20px;
}
.proNum{
  margin-right: 5px;
  margin-left: 5px;
  position: relative;
  bottom: 1px;

}
.reduceIcon{
  margin-top: 3px;
}
.plusIcon{
  margin-top: 3px;
}
.delete-button{
  position: absolute;
  right: 20px;
}


</style>