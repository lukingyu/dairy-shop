<template>
  <el-card style="max-width: 480px;background-color: whitesmoke" shadow="never" class="evaluation-card">
    <template #header>
      <div><el-icon><User /></el-icon>{{props.productEvaluation.username}}</div>
    </template>
    <div style="display: flex;align-items: center;position: relative"><el-rate
        v-model="props.productEvaluation.grade"
        disabled
        show-score
        text-color="#ff9900"
        score-template="{value} 分"
    /><el-text size="small" tag="ins" style="position: absolute;right: 0">{{props.productEvaluation.createTime}}</el-text>
    </div>
    <div style="margin-top: 10px;margin-bottom: 10px"><el-text line-clamp="3"><font>{{props.productEvaluation.comments}}</font></el-text></div>
    <template #footer>
      <div><el-text size="small" line-clamp="1">{{props.productName}}</el-text></div>
    </template>

  </el-card>
</template>

<script setup>
import {User} from "@element-plus/icons-vue";

const props = defineProps(['productEvaluation','productName'])
</script>


<style scoped>
.evaluation-card >>> .el-card__footer{
  padding: 5px 20px;
}
.evaluation-card >>> .el-card__header{
  padding: 10px 20px;
}
.evaluation-card >>> .el-card__body{
  padding: 5px 20px;
}
.evaluation-card{
  margin-bottom: 7px;
}
</style>