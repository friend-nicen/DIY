<template>
  <view class='container' @touchstart.capture="start" @touchmove.capture="move" @touchend.capture="end"
        @touchcancel.capture="cancel">

    <!-- 顶部代码 -->
    <Headers ref="header" :brand="system.info.deviceBrand"></Headers>

    <canvas id="canvas" class="canvas" type='2d'>
    </canvas>


    <canvas id="canvas2" class="canvas2" type='2d'>
    </canvas>

    <view v-if="app.stage && number.count == 0" class="select">
      <!-- 定位到中心偏上的位置 -->
      <view class="asset">
        <image data-eventsync="true" @click="draw(false)" class="image" mode="widthFix"
               src="@/assets/image/select.svg"></image>
        <text id="upload" class="text">上传素材</text>
      </view>
    </view>

    <!-- 底部处理器 -->
    <Handle></Handle>
    <!-- 侧边栏 -->
    <SideBar ref="sidebar" v-if="!!app.stage" @select='draw'></SideBar>


  </view>


  <!-- 分布指引 -->
  <driver v-if="!!app.stage" index="step_comments" :steps="step" :parent="that"></driver>

</template>

<script>
import BetterGesture from "@/common/canvas/gesture"
import Stage from "@/common/canvas/stage"
import Driver from "@/components/driver/driver.vue"

import {getCurrentInstance, provide, reactive, ref} from 'vue'

import {getend, getPosOfEvent} from "@/common/util/common.js"

import load from "@/common/util/load";
import systems from "@/store/system.js"

import Headers from "./Headers/Headers.vue"
import Footer from "./Footer/Footer.vue"
import SideBar from "./Sidebar/Sidebar.vue"


import init from './init'

export default {
  /*
    注册自定义组件
   */
  components: {
    Handle: Footer,
    Headers: Headers,
    SideBar: SideBar,
    Driver: Driver
  },
  setup() {

    /* 功能初始化 */
    const {
      draw,
      app
    } = init();


    const number = reactive({
      count: 0
    }); //图形数量

    /* 系统信息 */
    const system = systems();

    /* 依赖注入*/
    provide("app", app);
    /* 依赖注入*/
    provide("number", number);

    /* 指引 */
    const that = getCurrentInstance(); //组件实例

    const step = ref([{
      el: "#addText",
      placement: "right",
      component: "sidebar",
      content: "点击这里可以生成各种各样的好看的文字，生成后可以点击文字进行拖动、缩放、旋转！"
    },
      {
        el: "#removeBg",
        placement: "right",
        component: "sidebar",
        content: "点击这里可以自动去除图片的背景，生成后可以点击图片进行拖动、缩放、旋转！"
      },
      {
        el: "#upload",
        placement: "bottom",
        content: "点击这里可以上传需要定制的图片素材！也可以点击下方创意和素材选择您喜欢的样式，素材上传后您可以直接点击图片进行拖动、缩放、旋转！"
      },
      {
        el: "#model",
        placement: "bottom",
        component: "header",
        content: "点击这里可以更换当前所选的手机模型图，首次进入小程序显示的是默认模型！"
      },
      {
        el: "#step1",
        placement: "bottom",
        component: "header",
        content: "点击这里可以生成最终的作品，生成之后您可以选择导出作品或者直接购买定制！"
      }
    ]);


    return {
      draw,
      app,
      number,
      system,
      that,
      step
    }

  },

  async onReady() {

    load.start(); //加载效果
    let that = this; //实例对象
    let start, end; //开始和结束的点

    // 实例化手势识别类
    new BetterGesture(that, {
      // 开始
      start(evt) {

        /* 获取所有触摸点的位置 */
        let pos = getPosOfEvent(evt);
        start = pos[0]; //记录开始点

        /* 触发的是不是变形 */
        if (!that.app.stage.isTransform(pos)) {
          /* 触发画布的事件 */
          that.app.stage.start(pos);
        } else {
          start = null; //标记点击的是变形
        }
      },
      end(evt) {
        /* 获取所有触摸点的位置 */
        let pos = getend(evt);

        /* 触发单击事件 */
        if (start) {
          if (pos[0].x == start.x && pos[0].y == start.y) {
            /* 判断单击选中 */
            that.app.stage.start(pos, true);
          }

        }

        /* 触发画布触摸结束事件 */
        that.app.stage.end();
      },
      //拖拽
      pressMove(evt) {
        let pos = getPosOfEvent(evt);
        that.app.stage.move(pos);
      },
      // 旋转
      rotate(evt) {
        that.app.stage.rotate(evt.angle);
      },
      // 缩放
      pinch(evt) {
        that.app.stage.scale(evt.zoom);
      },
    });


    /* 获取canvas 2d对象 */
    await new Promise(resolve => {
      uni.createSelectorQuery()
          .select("#canvas")
          .node(res => {
            that.app.canvas = res.node;
            that.app.context = res.node.getContext("2d");
            resolve()
          })
          .exec();
    });


    /* 获取canvas 2d对象 */
    await new Promise(resolve => {
      uni.createSelectorQuery()
          .select("#canvas2")
          .node(res => {
            that.app.off = {
              canvas: res.node,
              context: res.node.getContext("2d")
            };
            resolve()
          })
          .exec();
    });


    /* 获取canvas位置信息 */
    await new Promise(resolve => {
      uni.createSelectorQuery()
          .select("#canvas")
          .boundingClientRect((rect) => {

            /*
              解析canvas位置
             */
            that.app.position = {
              x: rect.left,
              y: rect.top,
              w: rect.width,
              h: rect.height,
              offset: (that.system.screenHeight - rect.height) / 2 //状态栏的高度
            };


            resolve();

          })
          .exec();
    });


    /* 初始化舞台 */
    that.app.stage = new Stage({
      context: that.app.context,
      Bounds: that.app.position,
      canvas: that.app.canvas,
      number: that.number,
      off: that.app.off
    });

    load.hide(500);
  }
}
</script>

<style lang="scss" scoped>
@import './index.scss'
</style>
