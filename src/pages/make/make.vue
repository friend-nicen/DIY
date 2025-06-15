<template>

  <view class="body">
    <view class="top">
      <image v-if="url" @load="loaded" class="image" :src="api.host+url" mode="widthFix"></image>
    </view>


    <view class="fixed">
      <view id="edit" class="button" @click="popup.open()">
        <image class="image" mode="widthFix" src="@/assets/image/Edit.svg"></image>
      </view>

      <view id="save" class="button" @click="save">
        <image class="image" mode="widthFix" src="@/assets/image/share.svg"></image>
      </view>


      <view id="submit" class="button">
        <image class="image" data-eventsync="true" @click="back" mode="widthFix"
               src="@/assets/image/confirm.svg"></image>
      </view>
    </view>

    <!-- 弹出 -->
    <uni-popup :safe-area="false" ref="popup" :is-mask-click="false" type="bottom" :animation="true">
      <view class="edit">
        <view class="title">
          <view class="iconfont icon-guanbi" @click="popup.close()"></view>
          <view class="text">文字编辑</view>
          <view class="iconfont icon-queding" @click="finish"></view>
        </view>

        <view class="content">
          <template v-if="config.json">
            <view class="bottom">
              <template v-for="(item,index) of config.json" :key="index">
                <uni-easyinput style="width: 100%;" placeholder="请输入内容" type="text" v-model="item.text">
                </uni-easyinput>
              </template>
            </view>
          </template>
        </view>

        <view class="footer">
          * 点击右上角重新生成图片
        </view>
      </view>
    </uni-popup>


  </view>

  <!-- 分布指引 -->
  <driver index="make_comments" :steps="step" :parent="that"></driver>

</template>

<script setup>
import Driver from "@/components/driver/driver.vue"
import {getCurrentInstance, reactive, ref, watch} from "vue";


import {getUserInfo, watchVideo} from "@/common/util/system.js";

import api from "@/service/api";
import user from "@/store/user.js"

import System from "@/store/system.js"
import load from "@/common/util/load";


const props = defineProps(['id']); //信息
const userInfo = user(); //用户信息
const systems = System(); //系统相关参数
const url = ref(null); //图片url
const key = ref(null); //图片的key值

/* 制作的配置 */
const config = reactive({
  image: props.id,
  json: [],
  type: 1,
})


/* 指引 */
const that = getCurrentInstance(); //组件实例

const step = ref([{
  el: "#edit",
  placement: "top",
  content: "点击这里可以修改图片上的文字，输入文字后点击右上角确定即可！"
},
  {
    el: "#save",
    placement: "top",
    content: "点击这里可以直接保存当前图片到您的相册！"
  },
  {
    el: "#submit",
    placement: "top",
    content: "点击这里可以将当前图片提交到创作页面！"
  }
]);

/* 加载素材 */
const loadConfig = () => {

  load.start("加载中...");

  uni.request({
    url: api.getImage,
    method: "POST",
    data: {
      id: props.id
    }
  }).then(res => {

    /* 判断请求结果 */
    if (res.data.code) {
      config.json = JSON.parse(res.data.data.config);
      loadImage(); //开始加载图片
    } else {
      load.fail(res.data.errMsg)
    }

  }).catch(e => {
    load.fail(e)
  }).finally(() => {
    load.hide(300);
  })
}


/* 加载默认信息 */
const loadImage = (ok = null) => {

  load.start("加载中...");

  uni.request({
    url: api.image,
    method: "POST",
    data: config
  }).then(res => {

    /* 判断请求结果 */
    if (res.data.code) {

      /* 未发生改变 */
      if (url.value == res.data.data) {
        load.hide(100); //关闭加载效果哦
      }

      url.value = res.data.data;
      key.value = res.data.key;

      if (ok) ok(); //加载结束
    } else {
      load.fail(res.data.errMsg)
    }

  }).catch(e => {
    load.fail(e)
  })
}


/* 是否已登录 */
if (userInfo.token) {
  loadConfig();
} else {
  watch(() => userInfo.token, loadConfig)
}


const popup = ref(null); //弹出

/* 加载 */
const finish = () => {
  loadImage(() => {
    popup.value.close();
  });
}


/* 更新模型，回到定制页面 */
let back = async () => {

  /* 判断是否完善了个人信息 */
  if (!userInfo.nickname) {
    await getUserInfo(); //获取用户信息
  }

  load.confirm("将这张生成好的图片作为素材？", () => {

    uni.switchTab({
      url: '/pages/index/index',
      success() {
        uni.$emit("updateImage", {
          image: api.host + url.value
        })
      }
    })
  })

}


/* 图片加载完毕 */
const loaded = () => {
  load.hide(0);
}


/* 保存到本地 */
const save = () => {

  load.confirm("即将保存素材到本地相册，保存前可能需要观看广告，是否继续？", async () => {

    /* 判断观看结果 */
    if (!await watchVideo()) {
      return;
    }
    ;

    load.start("正在保存...");

    await new Promise(resolve => {

      uni.downloadFile({
        url: api.cdn + url.value, //仅为示例，并非真实的资源
        success: (res) => {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success() {
              resolve()
            },
            fail() {
              resolve()
            }
          })
        },
        fail: (e) => {
          load.fail(JSON.stringify(e));
        }
      });
    })


    load.hide(1500, () => {
      uni.showToast({
        icon: "success",
        title: "已保存到相册！"
      });
    }); //关闭加载效果

  })
}
</script>

<style lang="scss" scoped>
@import './make.scss';
</style>
