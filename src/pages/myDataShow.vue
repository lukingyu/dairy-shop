<template>
<div>
  <!-- 第一排的大div -->
  <div style="display: flex;justify-content: center;align-items: center">
    <!-- 个人购买数量随时间变化，折线图 -->
    <div style="display: inline-block;margin-right: 80px">
      <el-card style="width: 480px;background-color: lightgray" class="btaulCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px" color="#5F9EA0"><TrendCharts /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">近期您的购买趋势</span>
          </div>
        </template>
        <div id="buyTimeAndNumLine" style="height: 400px">
        </div>
      </el-card>
    </div>

    <!--个人品牌购买数量，相当于品牌喜爱度-->
    <div style="display: inline-block;margin-left: 80px">
      <el-card style="width: 480px;background-color: lightgray" class="babspCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px" color="#5F9EA0"><StarFilled /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">您的品牌喜好度</span>
          </div>
        </template>
        <div id="brandAndBuySumPie" style="height: 400px">
        </div>
      </el-card>
    </div>
  </div>

  <!-- 第二排的大div -->
  <div style="display: flex;justify-content: center;align-items: center;margin-top: 20px">
    <!--个人对商品的平均评价分数。仪表盘-->
    <div style="display: inline-block;margin-right: 80px">
      <el-card style="width: 480px;background-color: lightgray" class="aggCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px" color="#5F9EA0"><Odometer /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">您对本系统奶制品平均满意度</span>
          </div>
        </template>
        <div id="avgGradeGauge" style="height: 400px">
        </div>
      </el-card>
    </div>

    <!--您的奶制品类别喜爱度。雷达图-->
    <div style="display: inline-block;margin-left: 80px">
      <el-card style="width: 480px;background-color: lightgray" class="cgrCard">
        <template #header>
          <div class="card-header">
            <el-icon size="30" style="margin-right: 5px" color="#5F9EA0"><StarFilled /></el-icon><span style="font-family: 钉钉进步体;font-size: 18px">您更倾向于哪种分类奶制品</span>
            <el-select v-model="selectedBrandId" placeholder="默认1" style="width: 80px" @change="resetRadarOption">
              <el-option
                  v-for="brand in brandList"
                  :key="brand.id"
                  :label="brand.brandName"
                  :value="brand.id"
              />
            </el-select>
          </div>
        </template>
        <div id="categoryRadar" style="height: 400px">
        </div>
      </el-card>
    </div>

  </div>


</div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";
import * as echarts from "echarts"
import {Odometer, StarFilled, TrendCharts} from "@element-plus/icons-vue";

let buyTimeAndNumList = ref([])
let brandAndBuySumList = ref([])
let avgGrade = ref(null)

let selectedBrandId = ref(null)
let brandList = ref([])
let categoryBuySumByBrandList = ref([])

onMounted(async ()=>{
  await getBuyTimeAndNumList()
  await getBrandAndBuySumList()
  await getAvgGradeOfCurUser()
  await getAllSimpleBrandList()

})

async function getBuyTimeAndNumList(){
  let limit = 5
  await axios.get('/api/user/getBuyTimeAndNumList/'+ window.localStorage.getItem("userId") +'/' + limit).then((res)=>{
    if (res.data.code===200){
      buyTimeAndNumList.value = res.data.data
    }else {
      ElNotification.error("获取个人数据时出错")
    }
  })
  await console.log(buyTimeAndNumList.value)
  let line = await echarts.init(document.getElementById("buyTimeAndNumLine"),"dark", {height:300})
  line.setOption({
    xAxis: {
      type: 'category', data: buyTimeAndNumList.value.sort((a,b)=>new Date(a.buyTime)-new Date(b.buyTime)).map(b=>b.buyTime),axisLabel:{interval:0,rotate:30}
    },
    yAxis: {type: 'value'},
    series: [
      {
        data: buyTimeAndNumList.value.sort((a,b)=>new Date(a.buyTime)-new Date(b.buyTime)).map(b=>b.buyProNum),
        type: 'line',
        smooth: true,
        lineStyle: {
          normal: {color: 'lightblue', width: 4, type: 'dashed',}
        },
        label: {
          show: true, position: 'top', textStyle: {fontSize: 20}
        }
      }
    ],
    grid:{containLabel:true, y:30, y2:10}
  })
}

async function getBrandAndBuySumList(){
  await axios.get('/api/user/getBrandAndBuySumList/'+window.localStorage.getItem("userId")).then((res)=>{
    if (res.data.code===200){
      if (res.data.data !== null){
        brandAndBuySumList.value = res.data.data
      }else {
        ElMessage.info("您没有买过东西")
      }
    }
  })
  console.log(brandAndBuySumList.value)
  let pie = await echarts.init(document.getElementById("brandAndBuySumPie"),"dark",{height:300})
  pie.setOption({

    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: 'Nightingale Chart',
        type: 'pie',
        radius: [20, 120],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        data: brandAndBuySumList.value.map((b)=>{return {value:b.brandBuySum, name:b.brandName}})
      }
    ],
    grid:{
      y:20,
      y2:20
    }
  })
}

async function getAvgGradeOfCurUser(){
  await axios.get('/api/user/getAvgGradeOfCurUser/'+window.localStorage.getItem("userId")).then((res)=>{
    if (res.data.code===200){
      avgGrade.value = res.data.data
    }
  })
  console.log(avgGrade.value)
  let gauge = echarts.init(document.getElementById("avgGradeGauge"),"dark",{height:350})
  gauge.setOption({
    tooltip: {
      formatter: '{a} <br/>{b} : {c}分'
    },
    series: [
      {
        name: '个人满意度',
        type: 'gauge',
        progress: {
          show: true
        },
        detail: {
          valueAnimation: true,
          formatter: '{value}'
        },
        data: [
          {
            value: avgGrade.value,
            name: '满意度'
          }
        ],
        min:0,
        max:5
      }
    ],
    grid:{
      y:20,
      y2:20
    }
  })
}

var radar; //定义为全局变量，方便后续改变它的option
async function getCateBuySumByBrandAndUser(){
  await axios.get('/api/user/getCategoryBuySumByBrandList/'+selectedBrandId.value+'/'+localStorage.getItem("userId")).then((res)=>{
    if (res.data.code===200){
      if (res.data.data!==null){
        categoryBuySumByBrandList.value = res.data.data
      }else {
        ElMessage.info("该品牌下没有任何分类，或者您没有买过东西")
      }
    }
  })
  console.log(categoryBuySumByBrandList.value)
  radar = echarts.init(document.getElementById("categoryRadar"),null,{height:280})
  radar.setOption({
    legend: {
      data: ['您选择的品牌'],
      left:"left"
    },
    radar: {
      indicator: categoryBuySumByBrandList.value.map((c)=>{
        return {name:c.categoryName, max:9}
      })
    },
    series: [
      {
        name: 'gdfgdf',
        type: 'radar',
        data: [
          {
            value: categoryBuySumByBrandList.value.map((c)=>{
              return c.sum
            }),
            name: '您选择的品牌'
          }
        ]
      }
    ],
    grid:{
      y:20,
      y2:20
    }
  })
}
//获取所有品牌，包括id和名称。（为了下拉单选框）
async function getAllSimpleBrandList(){
  await axios.get('/api/brand/getAllSimpleBrandList').then((res)=>{
    if (res.data.code === 200){
        brandList.value = res.data.data
    }
  })
  console.log(brandList.value)
  selectedBrandId.value = brandList.value[0].id //首次默认查询第一个品牌
  await getCateBuySumByBrandAndUser() //将brand数组第一个对象的id 赋值给 已选择的brandId后，然后查询。
}

async function resetRadarOption(){ //和getCateBuySumByBrandAndUser()方法相同，只是少了echarts的初始化（这样可以提高效率）
  await axios.get('/api/user/getCategoryBuySumByBrandList/'+selectedBrandId.value+'/'+localStorage.getItem("userId")).then((res)=>{
    if (res.data.code===200){
      if (res.data.data!==null){
        categoryBuySumByBrandList.value = res.data.data
      }else {
        categoryBuySumByBrandList.value = []
        ElMessage.info("该品牌下没有任何分类，或者您没有买过东西")
      }
    }
  })
  radar.setOption({
    legend: {data: ['您选择的品牌'], left:"left"},
    radar: {
      indicator: categoryBuySumByBrandList.value.map((c)=>{
        return {name:c.categoryName, max:7}
      })
    },
    series: [
      {
        name: 'gdfgdf',
        type: 'radar',
        data: [
          {
            value: categoryBuySumByBrandList.value.map((c)=>{
              return c.sum
            }),
            name: '您选择的品牌'
          }
        ]
      }
    ],
    grid:{
      y:20,
      y2:20
    }
  })
}

</script>

<style scoped>
.btaulCard:deep(.el-card__body){
  padding: 0;
  height: 300px;
}
.babspCard:deep(.el-card__body){
  padding: 0;
  height: 300px;
}
.aggCard:deep(.el-card__body){
  padding: 0;
  height: 300px;
}
.cgrCard:deep(.el-card__body){
  padding: 0;
  height: 300px;
}
.card-header{
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>