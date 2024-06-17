<template>
  <el-card style="width: 170px;height:260px;position: relative" class="el-card" shadow="hover">
    <el-image :src="props.faProduct.imageUrl" alt="" style="width: 150px;height: 150px; cursor: pointer" @click="handleClickImage"/>
    <el-tooltip :content="props.faProduct.productName" placement="bottom" effect="light">
      <el-text truncated><el-icon><Goods /></el-icon><font style="font-family: 钉钉进步体;color: black">{{props.faProduct.productName}}</font></el-text>
    </el-tooltip>
    <template #footer>
      <font style="font-family: 钉钉进步体;font-size: small">单价:</font><span style="margin-right: 30px"><font style="font-family: 钉钉进步体;font-size: small">{{props.faProduct.price}}元</font></span>
      <span style="position: absolute;right: 10px">
        <el-popconfirm
          confirm-button-text="是"
          cancel-button-text="否"
          :icon="InfoFilled"
          icon-color="#626AEF"
          title="您确定将此商品直接加入购物车吗？"
          @confirm="directAddToCart"
        >
          <template #reference>
            <el-button class="direct-add-button">直接加购</el-button>
          </template>
        </el-popconfirm>
      </span>
    </template>
  </el-card>
</template>

<script setup>
import {Goods, InfoFilled} from "@element-plus/icons-vue";
import {useStore} from "vuex";
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";
import {ref} from "vue";
const props = defineProps(['faProduct']);

const store = useStore()

//点击这个子组件中的图片，通过自定义事件，给父组件传数据
const emit = defineEmits(['showFaProductDetail'])
function handleClickImage(){
  emit('showFaProductDetail', props.faProduct.id)
}

//直接加入购物车
function directAddToCart(){
  //虽然只有一个商品，也造出一个数组，为的是使用统一的接口
  let selectInfoListHasUserId = {
    userId : window.localStorage.getItem("userId"),
    selectInfoList : [{
        productId:props.faProduct.id,
        productName:props.faProduct.productName,
        num:1,
        totalPrice:props.faProduct.price,
        imageUrl:props.faProduct.imageUrl
    }]
  }
  axios.post('/api/product/addToMyCart', selectInfoListHasUserId).then((res)=>{
    if (res.data.code === 200){
      //弹出成功通知
      ElNotification.success({
        title:"成功",
        message:"直接加入购物车成功"
      })
    }else {
      //弹出失败通知
      ElNotification.error({
        title:"失败",
        message:"直接加入购物车失败"
      })
    }
  })
}
</script>

<style scoped>
img{
  width: 200px;
  height: 200px;
}
.el-card{
  padding: 0;
  margin: 0 11px;
}

.el-card:deep(.el-card__body) {
  padding-top: 10px;
  padding-bottom: 13px;
  padding-left: 10px;
  padding-right: 10px;
}
.el-card:deep(.el-card__footer){
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
.el-card{
  background-color: whitesmoke;
  margin-bottom: 5px;
  border-radius: 10px;
  border-width: 2px;
  border-color: #545c64;
}

.direct-add-button{
  padding: 0 5px;
  background-color: darkgray;
}
</style>