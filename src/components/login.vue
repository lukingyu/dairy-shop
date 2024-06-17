<template>
<!--登录组件-->
  <div class="common-layout" style="top: 0;left: 0;right: 0;bottom: 0;position: absolute">
    <el-container style="top: 0;left: 0;right: 0;bottom: 0;position: absolute">
      <el-aside width="75%">
        <img src="../assets/images/销售系统登录背景图片.jpg" style="position: absolute;top: 0;bottom: 0;height: 695px;width: 1152px" alt=""/>
      </el-aside>
      <el-main style="display: flex;justify-content:center;align-items:center;padding: 0;height: 695px">
        <div>
          <div class="flex gap-2">
            <el-tag type="primary"><el-link @click="showLogin()">登录</el-link></el-tag>
            <el-tag type="success"><el-link @click="showRegister()">注册</el-link></el-tag>
          </div>
          <div class="login" v-show="isShowLogin" style="background-color: whitesmoke;padding: 20px;border-width: 1px;border-radius: 15px">
            <p class="title">登录界面</p>
            <div class="top" >
              <el-form :model="user"  :rules="loginRules" ref='loginFormEl'>
                <el-form-item label="用户名" prop="username">
                  <el-input placeholder="请输入用户名" v-model="user.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input placeholder="请输入密码" type="password" v-model="user.password"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="bottom">
              <el-button type="primary" @click="Login">登录</el-button>
            </div>
          </div>
          <div class="register" v-show="isShowRegister" style="background-color: whitesmoke;padding: 20px;border-width: 1px;border-radius: 15px">
            <p class="title">注册界面</p>
            <div class="top">
              <el-form :model="regUser" :rules="regRules" ref="regFormEl">
                <el-form-item label="注册用户名" prop="username">
                  <el-input placeholder="请输入用户名" v-model="regUser.username" on-blur="usernameExist"></el-input>
                </el-form-item>
                <el-form-item label="注册密码" prop="password">
                  <el-input placeholder="请输入密码" type="password" v-model="regUser.password"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="bottom">
              <el-button type="primary" @click="Register">注册</el-button>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>

</template>

<script>
import {reactive, ref} from "vue";
  import axios from "axios";
  import {useStore} from "vuex";
  import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";
export default {

  setup(){
    const user = reactive({
      username:'',
      password:''
    })
    const regUser = reactive({
      username:'',
      password:''
    })

    const store = useStore()
    const router = useRouter()

    const loginFormEl = ref(null)
    const regFormEl = ref(null)


    function Login(){
      loginFormEl.value.validate((valid)=>{
        if (valid){
          axios.post('/api/user/login',user).then((res)=>{
                if (res.data.code === 200){
                  window.localStorage.setItem("jwtStr", res.data.data.jwtStr)
                  window.localStorage.setItem("userId",res.data.data.userId)
                  window.localStorage.setItem("isAuth","yes")
                  router.push('/shop')
                }else {
                  window.localStorage.removeItem("jwtStr")
                  window.localStorage.setItem("isAuth","no")
                  router.push('/login')
                }
              }, (error)=>console.log(error)
          ).catch((error)=>console.log(error))
        }
      })

    }

    function Register(){
      regFormEl.value.validate((valid)=>{
        if(valid){
          axios.post('/api/user/register',regUser).then((res)=>{
                if (res.data.code === 200){
                  showElMessage("注册成功",'success')
                  regFormEl.value.resetFields()
                  showLogin()
                  //router.push('/login')
                }else {
                  showElMessage("注册失败，请联系管理员",'error')
                  regFormEl.value.resetFields()
                  showRegister()
                  //router.push('/login')
                }
              }, (error)=>console.log(error)
          ).catch((error)=>console.log(error))
        }
      })

    }


    let isShowLogin = ref(true)
    let isShowRegister = ref(false)
    function showLogin(){
      isShowRegister.value = false
      isShowLogin.value = true
    }
    function showRegister(){
      isShowLogin.value = false
      isShowRegister.value = true
    }

    //显示消息
    function showElMessage(msg, type){
      if (type === 'success'){
        ElMessage({
          message: msg,
          type: "success",
        })
      }
      if (type === 'error'){
        ElMessage.error(msg)
      }
    }

    const loginRules = reactive({
      username:[
        {required:true,message:'请输入用户名',trigger:'blur'},
        {min:3,max:12,message: '您的用户名长度应该不对吧？',trigger: 'blur'}
      ],
      password:[
        {required:true,message:'请输入密码'}
      ]
    })

    function validateUsername(rule, value, callback) {
      //根据用户名称进行查询接口
      axios.post('/api/user/usernameExist/' + value).then((res) => {
        const result = res.data.data;
        if (result === true) {
          callback(new Error('用户名已经存在'));
        } else {
          callback();
        }
      });
    }
    const regRules = reactive({
      username:[
        {required:true,message:'请输入用户名',trigger:'blur'},
        {min:3,max:12,message: '用户名长度必须>=3或者<=12',trigger: 'blur'},
        {
          validator: (rule, value, callback) => {
            validateUsername(rule, value, callback);
          },
          trigger: 'blur',
        },
      ],
      password:[
        {required:true,message:'请输入密码'},
        {min:3,max:12,message: '密码长度必须 3 to 12',trigger: 'blur'}
      ]
    })

    function usernameExist(){
      //检验用户名是否存在，存在则无法注册
    }

    return {user,regUser, Login,Register, isShowLogin,isShowRegister,showLogin,showRegister,loginRules,loginFormEl,
              regRules,regFormEl}
  }

}

</script>


<style scoped>

</style>