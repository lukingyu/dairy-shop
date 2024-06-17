import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";
import login from '../components/login.vue'
import shop from '../components/shop.vue'
import shopIndex from '../pages/shopIndex.vue'
import {useStore} from "vuex";
import axios from "axios";
import product from "@/pages/product.vue";

const router = createRouter({
    history:createWebHistory(),
    routes:[
        {
            path:'/',
            //component:shop
            redirect:'/shop/shopIndex'
        },
        {
            path:"/login",
            name:'login',
            component:login
        },
        {
            path:'/shop',
            name:'shop',
            component:shop,
            children:[
                {
                    path:'',
                    name:'gdgdfg',
                    component:()=>import('../pages/shopIndex.vue')
                },
                {
                    path:'shopIndex',
                    name:'shopIndex',
                    component:()=>import('../pages/shopIndex.vue')
                },
                {
                    path:'product',
                    name:'product',
                    component:()=>import('../pages/product.vue')
                },
                {
                    path:'myCart',
                    name:'myCart',
                    component: ()=>import('../pages/myCart.vue')
                },
                {
                    path:'myOrder',
                    name:'myOrder',
                    component: ()=>import('../pages/myOrder.vue')
                },
                {
                    path:'myDataShow',
                    name:'myDataShow',
                    component:()=>import("../pages/myDataShow.vue")
                }
            ],
            redirect:'/shop/shopIndex'
        }
    ]
})

router.beforeEach((to,from,next)=>{
    const store = useStore()

    if (to.path === '/login'){
        window.localStorage.removeItem("jwtStr")
        window.localStorage.removeItem("userId")
        window.localStorage.setItem("isAuth","no")
        next()

    }else if(from.path === '/login'){
        next()
    }else {
        if (window.localStorage.getItem("isAuth") === "yes"){
            next()
        }
        const jwtStr = window.localStorage.getItem("jwtStr")
        if (jwtStr){
            axios.post('/api/user/checkToken',jwtStr).then((res)=>{
                if (res.data.code === 200 && res.data.data === true){
                    //验证通过
                    localStorage.setItem("isAuth","yes")
                    next()
                }else{
                    //验证失败，清除浏览器本地的jwtStr
                    window.localStorage.removeItem("jwtStr")
                    window.localStorage.removeItem("userId")
                    localStorage.setItem("isAuth","no")
                    next('/login')
                }
            })

            if (window.localStorage.getItem("isAuth") === "yes"){
                next()
            }else {
                next('/login')
            }
        }

        next('/login')
    }
})

export default router