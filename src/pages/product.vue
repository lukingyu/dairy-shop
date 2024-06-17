<template>
  <el-input
      v-model="keyword"
      style="width: 240px;margin-left: 105px"
      placeholder="请输入商品名"
  >
    <template #prefix>
      <el-icon class="el-input__icon"><search /></el-icon>
    </template>
  </el-input>
  <el-button type="primary" round @click="getProducts(keyword)" style="margin-left: 5px" :disabled="keyword.trim()===''">搜索商品</el-button>
  <el-button type="info" round @click="resetProducts" style="margin-left: 5px">重置所有</el-button>
  <el-badge :value="selectedProductMap.size" class="item" style="position: absolute;right: 125px" :show-zero="false" type="warning">
    <el-button @click="getSelectedProductInfos" color="darkseagreen">已选择的商品</el-button>
  </el-badge>

  <div style="margin-left: 105px;margin-top: 20px">
    <font style="font-size: small;font-family: 钉钉进步体;margin-right: 10px">品牌</font>
    <el-select
        v-model="selectedBrandIds"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="3"
        placeholder="选择品牌"
        style="width: 150px"
        size="small"
        @blur="filterProductsByBrandAndCategory"
        @remove-tag="filterProductsByBrandAndCategory"
    >
      <el-option
          v-for="brand in brands"
          :key="brand.id"
          :label="brand.brandName"
          :value="brand.id"
      />
    </el-select>
    <font style="font-size: small;font-family: 钉钉进步体;margin-right: 10px;margin-left: 10px">分类</font>
    <el-select
        v-model="selectedCategoryNames"
        multiple
        collapse-tags
        collapse-tags-tooltip
        :max-collapse-tags="3"
        placeholder="选择分类"
        style="width: 150px"
        size="small"
        @blur="filterProductsByBrandAndCategory"
        @remove-tag="filterProductsByBrandAndCategory"
    >
      <el-option
          v-for="(category,index) in categories"
          :key="index"
          :label="category[0]"
          :value="category[0]"
      />
    </el-select>
  <el-button round size="small" style="margin-left: 10px" @click="filterProductsByBrandAndCategory" disabled>筛选</el-button>
  </div>

  <div style="position: absolute;top: 190px;right: 30px;left: 120px;bottom: 0;width: 1290px">
    <productCard v-for="product in products" :key="dateKey" :product="product" :ref="product.id" style="display: inline-block" @showProductDetail="showProductDetail"></productCard>
    <img v-if="products.length === 0" src="../assets/images/productIsNull.png" alt="" style="width: 490px; margin-left: 290px">
  </div>
<!--  <product-card/>-->
  <!--查看已选择商品信息的弹出对话框，里面有很多卡片-->

  <el-dialog v-model="dialogVisible" title="Tips" width="500">
    <selected-product-info-card v-for="Vo in selectInfoList" :Vo="Vo" :ref="Vo.productId"/>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
        <el-popconfirm
            confirm-button-text="确定"
            cancel-button-text="取消"
            :icon="InfoFilled"
            icon-color="#626AEF"
            title="你确定将这些商品加入你的购物车吗？"
            @confirm="addToMyCart"
            @cancel=""
        >
          <template #reference>
            <el-button type="success">加入购物车</el-button>
          </template>
        </el-popconfirm>

      </div>
    </template>
  </el-dialog>

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

<script>
import productCard from "@/pages/productCard.vue";
import {computed, onMounted, reactive, ref} from "vue";
import {ArrowRightBold, Calendar, GoodsFilled, InfoFilled, Search, User} from '@element-plus/icons-vue'
import axios from "axios";
import {useStore} from "vuex";
import SelectedProductInfoCard from "@/pages/selectedProductInfoCard.vue";
import {ElMessage, ElNotification} from "element-plus";
import {useRouter} from "vue-router";
import evaluationCard from "@/pages/evaluationCard.vue";
export default {
  computed: {
    ArrowRightBold() {
      return ArrowRightBold
    },
    InfoFilled() {
      return InfoFilled
    }
  },
  components:{User, ArrowRightBold, GoodsFilled, SelectedProductInfoCard, Search, productCard,evaluationCard},
  setup(){
    const router = useRouter()
    let dialogVisible = ref(false)
    const store = useStore()
    let keyword = ref('');
    let products = ref([]);

    //不改变的products，为了保证组件渲染完后最原始的products数据
    let unchangedProducts = ref([])


    let brands = ref([])
    let selectedBrandNames = ref([])
    let selectedBrandIds = ref([])

    let categories = ref(null)
    let selectedCategoryNames = ref([])
    let selectedCategoryIds = ref([])

    //经过品牌名和分类名过滤后的product数组
    let filteredProductsByBrandsAndCategories = computed(()=>{

      if (selectedCategoryNames.value.length===0){
        //如果没有选择种类，则只过滤品牌
        return unchangedProducts.value.filter(product => selectedBrandIds.value.includes(product.brandId))
      }else if(selectedBrandIds.value.length===0){
        //如果没有选择品牌，则只过滤种类
        let newids = []
        for(let cname of selectedCategoryNames.value){
          newids = newids.concat(categories.value.get(cname))
        }
        console.log(newids)
        return unchangedProducts.value.filter(product=> {

         return  newids.includes(product.categoryId)
        })
      }
      else {
        //都不为空，则都进行过滤
        let newids = []
        for(let cname of selectedCategoryNames.value){
          newids = newids.concat(categories.value.get(cname))
        }
        return unchangedProducts.value.filter(product => {
          return selectedBrandIds.value.includes(product.brandId) && newids.includes(product.categoryId)
        })
      }
    })
    function filterProductsByBrandAndCategory(){
      console.log(selectedBrandIds.value)
      console.log(selectedCategoryNames.value)
      if (selectedBrandIds.value.length===0 && selectedCategoryNames.value.length===0){
        //如果都为空，恢复最原始的数据
        products.value = unchangedProducts.value;
      }else{
        //已选择的品牌id或者种类id，只要有，才进行过滤
        products.value = filteredProductsByBrandsAndCategories.value
      }

    }


    function getProducts(keyword){
      if (keyword.trim() !== ''){
        axios.get("/api/product/getProductsByKeyword/"+keyword.trim()).then((res)=>{
          if (res.data.code === 200){
            products.value = res.data.data
            unchangedProducts.value = res.data.data
          }
        }).catch((error)=>console.log(error))
      }else if(keyword===''){
        axios.get("/api/product/getAllProducts").then((res)=>{
          if (res.data.code === 200){
            products.value = res.data.data
            unchangedProducts.value = res.data.data
          }
        }).catch((error)=>console.log(error))
      }
    }
    function resetProducts(){
      keyword.value = ''
      selectedBrandIds.value = []
      selectedCategoryNames.value = []
      axios.get("/api/product/getAllProducts").then((res)=>{
        if (res.data.code === 200){
          products.value = res.data.data
          unchangedProducts.value = res.data.data
        }
      }).catch((error)=>console.log(error))
    }

    onMounted(async ()=>{
      axios.get("/api/product/getAllProducts").then((res)=>{
        if (res.data.code === 200){
          products.value = res.data.data
          unchangedProducts.value = res.data.data
        }
      }).catch((error)=>console.log(error))
      axios.get('/api/product/getAllBrands').then((res)=>{
        if (res.data.code === 200){
          //拿到所有的brand对象
          brands.value = res.data.data
        }else {
          //出错了
        }
      })
      await axios.get('/api/product/getAllCategories').then((res)=>{
        if (res.data.code === 200){
          //拿到所有的category对象
          categories.value = new Map(Object.entries(res.data.data))

        }else {
          //出错了
        }
      })
      console.log("是Map类型吗", categories.value instanceof Map)
      console.log(categories.value)
    })

    let selectedProductMap = reactive(store.state.tempCart)

    let selectInfoList = ref([])
    function getSelectedProductInfos(){
      if (selectedProductMap.size !== 0){
        let jsonObj = Object.fromEntries(selectedProductMap);

        axios.post('/api/product/getSelectedProductInfos',jsonObj).then((res)=>{
          if (res.data.code === 200){
            //设置数据
            selectInfoList.value = res.data.data
            //打开面板
            dialogVisible.value = true;

          }
        }).catch((error)=>console.log(error))
      }else {
        ElMessage({
          message:'您还没有选择任何商品哦',
          type:'warning'
        })
      }

    }

    function addToMyCart(){
      let selectInfoListHasUserId = {
        userId : window.localStorage.getItem("userId"),
        selectInfoList : selectInfoList.value
      }
      axios.post('/api/product/addToMyCart', selectInfoListHasUserId).then((res)=>{
        if (res.data.code === 200){
          //弹出成功消息
          /*ElMessage({
            message:'添加到购物车成功',
            type:"success"
          })*/
          ElNotification.success("添加到购物车成功")
          //关闭对话框
          dialogVisible.value = false
          //改变组件的key值，会重新渲染商品小组件
          dateKey.value = Date.now()
          //重置临时购物车（你已选择的商品）
          store.commit("RESET_TEMPCART")
          // router.push('/shop/product')
        }else {
          //弹出失败消息
          ElMessage({
            message:'添加到购物车失败',
            type:"error"
          })
        }
      })
    }

    let dateKey = ref(Date.now())

    let productDetailDialogVisible = ref(false)
    let productDetailVo = ref(null)
    //展示商品详情
    function showProductDetail(productId){
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

    return {products,keyword,getProducts,selectedProductMap,dialogVisible,getSelectedProductInfos,selectInfoList,addToMyCart,
            dateKey, brands,  selectedBrandNames, categories, selectedCategoryNames, filteredProductsByBrandsAndCategories,
            filterProductsByBrandAndCategory, selectedBrandIds, selectedCategoryIds, unchangedProducts, showProductDetail,
            productDetailDialogVisible, productDetailVo, allEvaluationDrawerVisible,allEvaluations,showAllEvaluationDrawer,
            resetProducts}
  }
}


</script>

<style scoped>
.el-card-detail:deep(.el-card__body) {
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