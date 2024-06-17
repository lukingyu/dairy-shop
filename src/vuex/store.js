import {createStore} from "vuex";
import axios from "axios";
import {computed, reactive} from "vue";

const store = createStore({
    state:{
        // token:'',
        // isAuth:false,
        tempCart: new Map(), //临时已选择的商品
        myCartItemMap:new Map(),  //从数据库获取的个人购物车信息，key是商品id，value是该商品的信息
        needPayPrice: computed(()=>{    //总价，用户需要支付的金额
            const values = store.state.myCartItemMap.values();
            let price = 0;
            for (let value of values) {
                price += value.totalPrice
            }
            return price;
        }),

        orderMap:new Map()
    },
    actions:{

    },
    mutations:{
        /*SET_TOKEN(state, value){
            state.token = value;
        },*/
        SET_ISAUTH(state, value){
            state.isAuth = value
        },
        ADD_TO_TEMP_CART(state, value){
            state.tempCart.set(value, 1)
            console.log(state.tempCart)
            console.log("第一次添加的方法执行了")
        },
        ADD_NUM_BY_PRODUCTID(state, value){
            console.log(state.tempCart.get(value))
            state.tempCart.set(value, state.tempCart.get(value)+1)
            console.log(state.tempCart)
            console.log("只添加数量的方法执行了")
        },
        REMOVE_FROM_TEMP_CART(state,value){
            //state.tempCart = state.tempCart.filter((jsonObj)=> jsonObj.productId !== value)
            /*for(let i in state.tempCart){
                if (state.tempCart[i]['productId'] === value){
                    state.tempCart.splice(i, 1)
                    console.log(state.tempCart.length)
                }
            }*/
            state.tempCart.delete(value)
        },
        REDUCE_NUM_BY_PRODUCTID(state, value){
            state.tempCart.set(value, state.tempCart.get(value)-1)
        },
        RESET_TEMPCART(state, value){
            //清空Map中所有键值对
            state.tempCart.clear()
        },
        FIRST_GIVE_TO_MyCartItemMap(state, value){
            //第一次给myCartItemMap赋值,value传过来的是数组形式的数据
            for(let i in value){
                state.myCartItemMap.set(value[i].productId,{
                    id:value[i].id,
                    userId:value[i].userId,
                    productName:value[i].productName,
                    productNum:value[i].productNum,
                    totalPrice:value[i].totalPrice,
                    unitPrice:value[i].unitPrice
                })
            }
        },
        CART_REDUCE_NUM_BY_ID(state, value){
            //先减数量
            state.myCartItemMap.get(value).productNum -= 1
            //再减价格
            state.myCartItemMap.get(value).totalPrice -= state.myCartItemMap.get(value).unitPrice
        },
        DELETE_PRODUCT_FROM_CART_BY_ID(state, value){
            //直接移除
            state.myCartItemMap.delete(value)
        },
        CART_PLUS_NUM_BY_ID(state, value){
            //加数量
            state.myCartItemMap.get(value).productNum += 1
            //再加价格
            state.myCartItemMap.get(value).totalPrice += state.myCartItemMap.get(value).unitPrice
        },
        CART_CLEAR(state, value){
            //清空内存中的购物车Map
            state.myCartItemMap.clear();
        },
        COMPUTE_NEED_PAY_PRICE(state, value){
            const values = state.myCartItemMap.values();
            for (let value of values) {
                state.needPayPrice += value.totalPrice
            }
        },
        FIRST_GIVE_TO_OrderMap(state, value){
            //第一次给OrderMap赋值
            for(let orderVO of value){
                let orderVoExceptIdObj = {
                    orderNo:orderVO.orderNo,
                    allPrice:orderVO.allPrice,
                    createTime:orderVO.createTime,
                    province:orderVO.province,
                    city:orderVO.city,
                    orderItems:orderVO.orderItems
                }
                state.orderMap.set(orderVO.id, orderVoExceptIdObj);
            }
        },
        DEL_ONE_ORDER(state, value){
            state.orderMap.delete(value)
        },
        //将某一订单的对应订单项设置为已评价
        SET_ORDER_ITEM_IS_EVALUATED(state, value){
            let len = state.orderMap.get(value.orderId).orderItems.length
            for(let i=0; i<len; i++){
                if (state.orderMap.get(value.orderId).orderItems[i].productId === value.productId){
                    state.orderMap.get(value.orderId).orderItems[i].isEvaluated = 1
                    break
                }
            }
        }
    },
    getters:{

    }

})

export default store