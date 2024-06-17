<template>
<!--<div class="productCard" style="height: 200px;width: 190px;margin:5px">
  <img :src="props.product.imageUrl" alt="" style="width: 150px;height: 150px">
  <h6 style="margin: 0">{{props.product.productName}}</h6>
  price:<span style="margin-right: 30px">{{props.product.price}}元</span><el-icon @click="minusNum"><Minus /></el-icon><span>{{num}}</span><el-icon @click="plusNum"><Plus /></el-icon>
</div>-->
  <el-card style="width: 170px;height:260px;position: relative" class="el-card" shadow="hover">
    <img :src="props.product.imageUrl" alt="" style="width: 150px;height: 150px; cursor: pointer" @click="handleClickImage">
    <el-tooltip :content="props.product.productName" placement="bottom" effect="light">
      <el-text truncated><el-icon><Goods /></el-icon><font style="font-family: 钉钉进步体;color: black">{{props.product.productName}}</font></el-text>
    </el-tooltip>
<!--    <h6 style="margin: 0">{{props.product.productName}}</h6>-->
    <template #footer>
      <font style="font-family: 钉钉进步体;font-size: small">单价:</font><span style="margin-right: 30px;font-family: 钉钉进步体;font-size: small">{{props.product.price}}元</span><span style="position: absolute;right: 10px"><el-button type="warning" :icon="Minus" size="small" circle style="margin-right: 5px" @click="minusNum"/><span style="font-family: 钉钉进步体;font-size: small">{{num}}</span><el-button type="primary" :icon="Plus" size="small" circle style="margin-left: 5px" @click="plusNum"/></span>
    </template>
  </el-card>
</template>

<script setup>
import {computed, ref} from "vue";
import {Minus, Plus,Goods} from "@element-plus/icons-vue";
import {useStore} from "vuex";
import product from "@/pages/product.vue";
  // props:["id","productName","categoryId","brandId","price","imageUrl"],
    let num = ref(0)

    const props = defineProps(['product']);

    const totalPrice = computed(()=>{
      return props.product.price * num
    })

    /*let cartItem = {
      id :props.id,
      productName :props.productName,
      categoryId :props.categoryId,
      brandId :props.brandId,
      totalPrice : totalPrice
    }*/
    const store = useStore()
    function minusNum(){
      if (num.value >= 1){
        num.value--
        // let removeId = props.product.id;
        if (num.value === 0){
          //如果num为0，直接从临时购物车移除该商品
          store.commit("REMOVE_FROM_TEMP_CART", props.product.id)
        }else {
          //如果不为零，则只减数量即可
          store.commit("REDUCE_NUM_BY_PRODUCTID",props.product.id)
        }
        // console.log(removeId)

      }

    }
    function plusNum(){
      num.value++
      if (!store.state.tempCart.has(props.product.id)){
        //临时购物车如果没有这个商品，那就新增
        // let tempCartItemJsonObj = {productId:product.id, num:num}
        store.commit("ADD_TO_TEMP_CART",props.product.id)
      }else {
        //说明该商品已经有了，只需要增加数量就行了
        store.commit("ADD_NUM_BY_PRODUCTID",props.product.id)
      }

  }

  //点击这个子组件中的图片，通过自定义事件，给父组件传数据
    const emit = defineEmits(['showProductDetail'])
    function handleClickImage(){
      emit('showProductDetail', props.product.id)
    }

</script>

<style scoped>
.productCard{
  margin: 20px;
  width: 300px;
  height: 400px;
}
img{
  width: 200px;
  height: 200px;
}
.el-card{
  padding: 0;
  margin: 0 5px;
}

.el-card >>> .el-card__body {
  padding-top: 10px;
  padding-bottom: 13px;
  padding-left: 10px;
  padding-right: 10px;
}
.el-card >>> .el-card__footer {
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


</style>