<template>
  <el-card style="max-width: 480px">
    <template #header>
      <div class="card-header">
        <img :src="props.Vo.imageUrl" style="width: 100px;height: 100px;display: inline-block" alt=""><span>{{props.Vo.productName}}</span>
      </div>
    </template>
    <span>数量：{{props.Vo.num}}</span><span>合计：{{props.Vo.totalPrice}}元</span>
<!--    <template #footer>Footer content</template>-->
  </el-card>
</template>

<script setup>
const props = defineProps(['Vo'])

</script>


<style scoped>

</style>