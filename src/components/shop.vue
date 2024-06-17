<template>
<!-- 登录之后的主页面组件-->
  <div class="bigDiv">
    <el-container class="el-container">
      <el-header class="el-header" style="position: sticky;top: 0;z-index: 1">
        <el-menu
            class="el-menu"
            mode="horizontal"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            :default-active="activeIndex"

        >
          <font style="font-family: 钉钉进步体;color: gold;font-size: larger;margin-top: 17px;margin-left: 68px;margin-right: 300px">奶制品销售系统</font>
          <el-menu-item index="1" @click="toShopIndex">首页</el-menu-item>
          <el-menu-item index="2" @click="toProduct">商品</el-menu-item>
          <el-menu-item index="3" @click="toMyCart">我的购物车</el-menu-item>
          <el-menu-item index="4" @click="toMyOrder">我的订单</el-menu-item>
          <el-menu-item index="5" @click="toMyDataShow">个人数据分析</el-menu-item>

        </el-menu>
        <el-dropdown class="el-dropdown">
          <span class="el-dropdown-link">
            欢迎{{username}}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="showUserInfoDrawer">个人信息</el-dropdown-item>
              <el-dropdown-item @click="Logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-main class="el-main">
        <router-view/>
      </el-main>
    </el-container>
  </div>

  <!--用户个人信息抽屉-->
  <el-drawer
      v-model="userInfoDrawerVisible"
      title="个人信息"
      direction="rtl"
      class="userInfo-drawer"
  >
    <div class="userInfo-drawer__content">
      <el-form :model="userInfo" :rules="rules" ref="userInfoForm">
        <el-form-item label="用户id" :label-width="formLabelWidth">
          <el-input v-model="userInfo.userId" disabled/>
        </el-form-item>
        <el-form-item label="用户名" prop="username" :label-width="formLabelWidth">
          <el-input v-model="userInfo.username" disabled/>
        </el-form-item>
        <el-form-item label="年龄" prop="age" :label-width="formLabelWidth">
          <el-input v-model.number="userInfo.age" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone" :label-width="formLabelWidth">
          <el-input v-model="userInfo.phone" />
        </el-form-item>
      </el-form>
      <div class="userInfo-drawer__footer" style="display: flex;justify-content: center">
        <el-button @click="closeDrawer">关闭</el-button>
        <el-button type="primary" @click="modifyUserInfo">修改</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import {useStore} from "vuex";
import shopIndex from "../pages/shopIndex.vue"
import {useRouter} from "vue-router";
import {onMounted, reactive, ref} from "vue";
import {ArrowDown} from "@element-plus/icons-vue";
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";
export default {
  components:{ArrowDown, shopIndex:shopIndex},
  setup(){
    let username = ref('');
    onMounted(()=>{
      axios.get("/api/user/getUsernameById/"+window.localStorage.getItem("userId")).then((res)=>{
        if (res.data.code === 200){
          username.value = res.data.data
          // username = ref("哈哈哈")
          //console.log(username)
        }
      })
    })
    let router = useRouter();
    /*onMounted(()=>{
      router.push('/shop/shopIndex')
    })*/
    const store = useStore()
    function toShopIndex(){
      router.push({
        name:"shopIndex"
      })
    }
    function toProduct(){
      router.push({
        name:"product"
      })
    }
    function toMyCart(){
      router.push({
        name:"myCart"
      })
    }

    function toMyOrder(){
      router.push({
        name:"myOrder"
      })
    }
    function toMyDataShow(){
      router.push({
        name:"myDataShow"
      })
    }
    const activeIndex = ref('1')

    function Logout(){
      let userId = window.localStorage.getItem("userId")
      if (userId){
        axios.post('/api/user/logout/'+userId).then((res)=>{
          if (res.data.code === 200){
            window.localStorage.removeItem("userId")
            window.localStorage.removeItem("jwtStr")
            window.localStorage.setItem("isAuth","no")
            ElMessage({
              message:'退出成功',
              type:'success'
            })
            router.push('/login')
            window.location.reload()
          }else {
            ElMessage({
              message:'退出失败',
              type:'error'
            })
          }
        }).catch((error)=>{console.log(error)})
      }
    }

    let userInfoDrawerVisible = ref(false)
    let userInfo = ref(null)

    let formLabelWidth = '80px'
    function showUserInfoDrawer(){
      //先获取数据
      axios.get('/api/user/getUserInfo/'+window.localStorage.getItem('userId')).then((res)=>{
        if (res.data.code === 200){
          userInfo.value = res.data.data
          //再打开抽屉
          userInfoDrawerVisible.value = true
        }else{
          ElMessage({
            message:'查询个人信息失败',
            type:'error'
          })
        }
      })
    }

    function closeDrawer(){
      userInfoDrawerVisible.value = false

    }
    function handleClose(){
      userInfo.value = null
    }

    const userInfoForm = ref(null)

    const rules = reactive({
      username:[
        {required:true,message:'请输入用户名',trigger:'blur'},
        {min:3,max:12,message: '您的用户名长度应该不对吧？',trigger: 'blur'}
      ],
      age:[
        {required:true,message:'请输入密码',type:'number'}
      ],
      phone:[
        {required:true,message:'请输入手机号',trigger:'blur'},
        {
          pattern: /^1[3456789]\d{9}$/,
          message: '请输入正确的手机号格式',
          trigger: 'blur',
        }
      ]
    })

    function modifyUserInfo(){
      userInfoForm.value.validate((valid)=>{
        if (valid){
          //表单合法，再修改数据
          axios.post('/api/user/modifyUserInfo', userInfo.value).then((res)=>{
            if (res.data.code === 200){
              //修改成功
              userInfoDrawerVisible.value = false
              ElMessage({
                message:'个人信息修改成功',
                type:'success'
              })
            }else{
              //修改失败
              ElMessage({
                message:'修改个人信息失败',
                type:'error'
              })
            }
          })
        }else{
          ElNotification({
            message:'不合法，请修改',
            type:'warning'
          })

        }
      })
    }

    return {store, toShopIndex,toProduct,activeIndex,username,Logout,toMyCart,toMyOrder,showUserInfoDrawer, userInfoDrawerVisible,
            userInfo, formLabelWidth,closeDrawer,modifyUserInfo,rules,handleClose,userInfoForm,toMyDataShow}
  }
}
</script>

<style scoped>
.bigDiv{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.el-container{
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
.el-header{
  padding-left: 0;
  padding-right: 0;
}
.el-dropdown{
  position: absolute;
  display: inline;
  right: 20px;
  top:20px
}
.el-dropdown-link{
  color: white;
  cursor: pointer;
}




</style>