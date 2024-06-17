<template>
  <div>
    <el-carousel :interval="4000" type="card" height="300px" style="padding-left: 70px">
      <el-carousel-item v-for="(image,index) in images" :key="index">
        <img :src="image.imageUrl" alt="" width="600" height="300">
      </el-carousel-item>
    </el-carousel>


    <div style="margin-top: 50px;margin-left:65px;width: 1035px;display: inline-block">
      <el-text style="font-family: 钉钉进步体;font-size: 20px;margin-left: 10px">品牌介绍</el-text>
      <el-divider style="margin-top: 5px"/>
      <div style="display: inline-block">
        <el-card style="width: 150px;height: 200px;display: inline-block" shadow="hover" class="brand-list-card">
          <el-scrollbar>
          <el-menu background-color=green text-color="#fff" active-text-color="#fff">
            <el-menu-item v-for="(brand,index) in brands" @click="changeContent(brand)">
              <el-icon><Menu /></el-icon>
              <span>{{brand.brandName}}</span>
            </el-menu-item>
          </el-menu>
          </el-scrollbar>
        </el-card>
      </div>
      <div style="display: inline-block;margin-left: 20px">
        <el-card style="width: 855px;height: 200px" shadow="hover" class="brandIntro-card">
          <template #header>
              <el-image :src="brandYouWhatToShow.logoUrl" style="width: 40px;height: 37px"/>
              <span style="margin-left: 10px;font-family: 钉钉进步体">{{brandYouWhatToShow.brandName}}</span>
          </template>
          <p>{{brandYouWhatToShow.introduction}}</p>
        </el-card>
      </div>
    </div>

    <div style="display: inline-block;margin-left: 38px">
      <el-card style="width: 300px;height: 280px" shadow="hover" class="brand-heat-card">
        <template #header>
          <el-icon><Histogram /></el-icon>
          <span style="margin-left: 10px;font-family: 钉钉进步体">近期各大品牌热度</span>
        </template>
        <!--TODO-->
          <div style="height: 220px;width: 300px;overflow: auto" ref="hhh" id="chart">
<!--            <v-chart id="chart" class="chart" ref="brandHeatBarRef" manual-update='true' style="height: 220px;width: 300px;overflow: auto" />-->
          </div>
      </el-card>
    </div>

    <div style="margin-top: 50px;margin-left: 65px;width: 1370px">
      <el-text style="font-family: 钉钉进步体;font-size: 20px;margin-left: 10px">为你推荐</el-text>
      <el-divider style="margin-top: 5px"/>
      <div>
        <favorite-product-card v-for="faProduct in favoriteProducts" :key="dateKey" :faProduct="faProduct" :ref="faProduct.id" style="display: inline-block" @showFaProductDetail="showFaProductDetail"/>
      </div>
    </div>
  </div>

  <!--商品详情对话框-->
  <el-dialog v-model="productDetailDialogVisible" title="商品详情" width="400">
    <el-card style="max-width: 480px;background-color: whitesmoke" shadow="never" class="el-card-detail">
      <img :src="productDetailVo.imageUrl" alt="" width="300px" class="detail-image">
      <template #footer>
        <div><font style="font-family: 钉钉进步体;color: red">单价￥{{productDetailVo.price}}</font></div>
        <div style="display: flex;align-items: center;"><el-icon size="large"><GoodsFilled/></el-icon><el-text line-clamp="2"><font style="color: black;font-family: 钉钉进步体">{{productDetailVo.productName}}</font></el-text></div>
        <div><font style="color: #606266;font-size: small;font-family: 钉钉进步体">已售{{productDetailVo.totalSalesVolume}}</font></div>
      </template>
    </el-card>

    <el-card style="max-width: 480px;background-color: whitesmoke;margin-top: 15px" shadow="never" class="one-evaluation-card">
      <template #header>
        <div style="display: flex; align-items: center;position: relative">
          <font>评价({{productDetailVo.productEvaluations.length}})</font><el-button :icon="ArrowRightBold" circle size="small" style="position: absolute;right: 0" @click="showAllEvaluationDrawer" :disabled="allEvaluationDrawerVisible||productDetailVo.productEvaluations.length===0"/>
        </div>
      </template>
      <div v-if="productDetailVo.productEvaluations.length===0">该商品没有任何评价</div>
      <div v-if="productDetailVo.productEvaluations.length!==0"><el-icon><User /></el-icon>{{productDetailVo.latestProductEvaluation.username}}</div>
      <div style="display: flex;align-items: center;position: relative" v-if="productDetailVo.productEvaluations.length!==0"><el-rate
          v-model="productDetailVo.latestProductEvaluation.grade"
          disabled
          show-score
          text-color="#ff9900"
          score-template="{value} 分"
      /><el-text size="small" tag="ins" style="position: absolute;right: 0">{{productDetailVo.latestProductEvaluation.createTime}}</el-text>
      </div>
      <div style="margin-top: 10px;margin-bottom: 10px" v-if="productDetailVo.productEvaluations.length!==0"><el-text line-clamp="3"><font>{{productDetailVo.latestProductEvaluation.comments}}</font></el-text></div>
      <div v-if="productDetailVo.productEvaluations.length!==0"><el-text size="small" line-clamp="1">{{productDetailVo.productName}}</el-text></div>
    </el-card>

    <el-card style="max-width: 480px;background-color: whitesmoke;margin-top: 15px" shadow="never">
      <template #header>
        <div style="display: flex;justify-content: center">-----<el-text tag="b">产品信息</el-text>-----</div>
      </template>
      <div style="display: flex;align-items: center;position: relative">
        <el-text>[产品名称]</el-text><span style="display: flex;align-items: center;max-width: 115px"><el-tooltip :content="productDetailVo.productName" placement="top"><el-text line-clamp="1" type="success" style="margin-left: 5px">{{productDetailVo.productName}}哈哈哈哈</el-text></el-tooltip></span>
        <span style="position: absolute;left: 195px;display: flex;align-items: center"><el-text>[产品类型]</el-text><el-text line-clamp="1" type="success" style="margin-left: 5px">{{productDetailVo.categoryName}}</el-text></span></div>
      <div style="display: flex;align-items: center;margin-top: 20px;margin-bottom: 20px;position: relative">
        <el-text>[配料]</el-text><span style="display: flex;align-items: center;max-width: 115px"><el-tooltip :content="productDetailVo.ingredient" placement="top"><el-text line-clamp="1" type="success" style="margin-left: 5px">{{productDetailVo.ingredient}}</el-text></el-tooltip></span>
        <span style="position: absolute;left: 195px;display: flex;align-items: center"><el-text>[规格]</el-text><el-text line-clamp="1" type="success" style="margin-left: 5px">{{productDetailVo.specification}}</el-text></span></div>
      <div style="display: flex;align-items: center;position: relative">
        <el-text>[保质期]</el-text><el-text line-clamp="1" type="success" style="margin-left: 5px">{{productDetailVo.shelfLife}}</el-text>
      </div>

    </el-card>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="productDetailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="productDetailDialogVisible = false">确定</el-button>
      </div>
    </template>
  </el-dialog>

  <!--所有评价的抽屉-->
  <el-drawer
      v-model="allEvaluationDrawerVisible"
      title="所有评价"
      direction="rtl"
      size="30%"
      class="eva-drawer"
  >
    <evaluation-card v-for="(productEvaluation,index) in allEvaluations" :productEvaluation="productEvaluation" :productName="productDetailVo.productName" :key="index"></evaluation-card>
  </el-drawer>
</template>

<script setup>
import {computed, onBeforeMount, onMounted, reactive, ref} from "vue";
import axios from "axios";
import {useRouter} from "vue-router";
import {ArrowRightBold, GoodsFilled, Histogram, Menu, User} from '@element-plus/icons-vue'
import FavoriteProductCard from "@/pages/favoriteProductCard.vue";
import {ElMessage, ElNotification} from "element-plus";
import evaluationCard from "@/pages/evaluationCard.vue";
import * as echarts from 'echarts/core';

const router = useRouter()

let images = ref([]);

let brands = ref([])

let brandYouWhatToShow = ref({
  logoUrl:'',
  brandName:'',
  introduction:''
})

let favoriteProducts = ref([])
let dateKey = ref(Date.now())

let brandHeats = ref([])

function getAllBrands(){
  axios.get('/api/brand/getAllBrands').then((res)=>{
    if (res.data.code === 200){
      brands.value = res.data.data
      brandYouWhatToShow.value.logoUrl = brands.value[0].logoUrl
      brandYouWhatToShow.value.brandName = brands.value[0].brandName
      brandYouWhatToShow.value.introduction = brands.value[0].introduction
    }
  })
}

//获取当前用户可能喜欢的商品，后端会返回10件商品。即使该用户没有购买过任何商品，也要补齐10件商品。
function getFavoriteProducts(){
  axios.get('/api/product/getFavoriteProducts/'+window.localStorage.getItem("userId")).then((res)=>{
    if (res.data.code===200){
      favoriteProducts.value = res.data.data
    }else {
      ElMessage.error("获取你可能喜爱的商品时出错")
    }
  })
}

//获取品牌热度排名前五（暂时定为前五）
async function getBrandHeatsTop(){
  let topNum = 5; //暂定为5个，动态的告诉后端，后端根据这个数字来获取指定数量排名
  await axios.get('/api/brand/getBrandHeatsTop/'+topNum).then((res)=>{
    if (res.data.code===200){
      //获取成功
      brandHeats.value = res.data.data
      // console.log(res.data.data)
      // console.log(brandHeats)
      // console.log(brandHeats.value)
    }else {
      ElNotification.warning('获取品牌热度排名出错了')
    }
  })
}

let brandNames = []
let heats = []

onMounted(async ()=>{
  axios.get('/api/shop/shopIndexImages').then((res)=>{
    if (res.data.code === 200){
      /*let obj = JSON.parse(res.data)
      images = obj.data
      console.log(images)*/
      // console.log(res.data.data)
      images.value = res.data.data
      //console.log(images)
    }
  })
  getAllBrands()
  getFavoriteProducts()
  await getBrandHeatsTop()
  console.log(brandHeats.value)

  //给brandNames赋值
  for (let i=0; i<brandHeats.value.length;i++){
    brandNames.push(brandHeats.value[i].brandName)
  }
  //给heats赋值
  for (let i=0;i<brandHeats.value.length;i++){
    heats.push(brandHeats.value[i].heat)
  }
  console.log(brandNames, heats)


  let brandHeatBarOption = ref({
    tooltip: {},
    dataset: [{
      // 用 dimensions 指定了维度的顺序。直角坐标系中，如果 X 轴 type 为 category，
      // 默认把第一个维度映射到 X 轴上，后面维度映射到 Y 轴上。
      // 如果不指定 dimensions，也可以通过指定 series.encode
      // 完成映射，参见后文。
      dimensions: ['brandName','heat'],
      source: brandHeats.value.sort((a,b)=>{
        return a.heat-b.heat;
      }),
    },
    ],
    yAxis: { type: 'category' },
    xAxis: {axisLabel:{interval:0,rotate:30}},
    series: { type: 'bar'},
    grid:{
      containLabel:true,
      top:10,
      bottom:6,
      left:20,
      right:20
    }
  })
  let abc = echarts.init(document.getElementById("chart"),null,{height:220})
  abc.setOption(brandHeatBarOption.value)
})

function changeContent(brand){
  brandYouWhatToShow.value.logoUrl = brand.logoUrl
  brandYouWhatToShow.value.brandName = brand.brandName
  brandYouWhatToShow.value.introduction = brand.introduction
}

let productDetailDialogVisible = ref(false)
let productDetailVo = ref(null)
//展示商品详情
function showFaProductDetail(productId){
  //先获取数据
  axios.get('/api/product/getProductDetail/' + productId).then((res)=>{
    if (res.data.code === 200){
      //获取成功了
      productDetailVo.value = res.data.data
      //再打开详情对话框
      productDetailDialogVisible.value = true
    }else{
      //获取失败了
      ElMessage({
        message:'获取商品详情失败',
        type:'error'
      })
    }
  })
}

let allEvaluationDrawerVisible = ref(false)
let allEvaluations = ref(null)
function showAllEvaluationDrawer(){
  //先给数据
  allEvaluations.value = productDetailVo.value.productEvaluations
  //再弹出抽屉
  allEvaluationDrawerVisible.value = true
}

let brandHeatBarRef = ref(null) //品牌热度柱状图，元素引用。（.value）
// let brandHeatBar = echarts.init(document.getElementById("chart"));

console.log(document.getElementById("chart"))
</script>

<style scoped>
.brand-list-card:deep(.el-card__body){
  height: 200px;
  padding: 0;
  overflow: auto;
}
.brandIntro-card:deep(.el-card__header){
  padding: 5px 20px;
  display: flex;
  align-items: center;
}
.brandIntro-card:deep(.el-card__body){
  padding: 5px 20px;
}
.brand-heat-card:deep(.el-card__body){
  display: flex;
  height: 220px;
  padding: 0;
  overflow: auto;
}

.el-card-detail:deep(.el-card__body){
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.detail-image{

}
.one-evaluation-card:deep(.el-card__header){
  padding: 10px 20px;
}
.one-evaluation-card:deep(.el-card__body){
  padding-bottom: 10px;
}
.eva-drawer{
  overflow: auto;
}
</style>