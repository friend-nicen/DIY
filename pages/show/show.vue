<template>
  <view class="display">

    <view class="info-top">

      <!-- 展示区 -->
      <swiper class="swiper" circular :indicator-dots="true">
        <swiper-item v-if="model">
          <view class="top" @click="preview">
            <image :src="api.cdn+model" class="image" mode="widthFix"></image>
          </view>
        </swiper-item>

        <swiper-item v-if="image">
          <view class="top" @click="preview">
            <image :src="api.cdn+image" class="image" mode="widthFix"></image>
          </view>
        </swiper-item>

      </swiper>


      <!-- 数据列表 -->
      <view class="list">

        <view class="li">

          <text class="left">作品编号</text>
          <text class="right">{{ guid }}</text>

        </view>

        <view class="li">

          <text class="left">设备型号</text>
          <text class="right">{{ system.info.deviceModel }}</text>

        </view>

        <view class="li" v-if="!!system.order.order_id">

          <text class="left">订单编号</text>
          <text class="right">{{ system.order.order_id }}</text>

        </view>

      </view>

    </view>


    <view class="bottom">

      <view class="inline">

        <button class="click" open-type="contact">
          <text class="iconfont icon-kefu">
          </text>
          <text class="info"> 客服</text>
        </button>

        <!-- <button class="click" @click="down">
          <text class="iconfont icon-baocun">
          </text>
          <text class="info"> 保存</text>
        </button> -->

      </view>


      <view class="inline">

        <view class="button left" @click="copy" v-if="!system.order.order_id">
          复制编号
        </view>

        <view class="button left" @click="submit" v-else>
          提交作品
        </view>

        <view class="button right" @click="down">
          下载保存
        </view>

      </view>


    </view>
  </view>
</template>

<script setup>
import api from "@/service/api.js"
import load from '@/common/util/load.js'
import {watchVideo} from '@/common/util/system.js'
import systems from "@/store/system.js"

const props = defineProps(['image', "guid", "model", "thumb"]);


/* 系统信息 */
const system = systems();


/* 复制编号 */
const copy = () => {
  uni.setClipboardData({
    data: "您的作品编号ID为：" + props.guid,
    showToast: false,
    success() {
      load.info("作品编号复制成功，如果不知道如何使用，请点击左下角联系客服！")
    }
  })
};

/* 下载文件，复制到相册 */
const down = () => {


  /* 弹出选 */
  uni.showActionSheet({
    itemList: ['样品图', '模型图'],
    success: function (res) {
      load.confirm("即将保存作品到本地相册，保存前可能需要观看广告，是否继续？", async () => {


        /* 判断观看结果 */
        if (!await watchVideo()) {
          return;
        }

        load.start("正在保存...");

        const image = res.tapIndex === 0 ? [props.image] : [props.model];

        /* 保存素材图 */
        for (let i of image) {

          await new Promise(resolve => {

            uni.downloadFile({
              url: api.cdn + i, //仅为示例，并非真实的资源
              success: (res) => {
                uni.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success() {
                    resolve()
                  }
                })
              },
              fail: (e) => {
                load.fail(JSON.stringify(e));
              }
            });
          })
        }


        load.hide(1500, () => {
          uni.showToast({
            icon: "success",
            title: "已保存到相册！"
          });
        }); //关闭加载效果

      })
    }
  });


};

/* 跳转商城 */
const goto_shop = () => {
  uni.navigateToMiniProgram({
    shortLink: "#小程序://Nice小商场/0PzNnKCMswibnfF"
  })
}


/* 提交作品到请求的订单 */
const submit = () => {
  // 确认框
  load.confirm("确定要将该作品作为您的订单素材？", async () => {


    load.start("正在提交...");

    let filePath = null; //需要提交的素材

    /* 下载缩略图 */
    await new Promise(resolve => {
      uni.downloadFile({
        url: api.cdn + props.thumb, //仅为示例，并非真实的资源
        success: (res) => {
          filePath = res.tempFilePath;
          resolve();
        },
        fail: (e) => {
          load.fail(JSON.stringify(e));
        }
      });
    })

    /* 提交商品的定制信息 */
    tt.submitEcCustomGoods({
      orderId: system.order.order_id,
      filePath: filePath,
      customData: {
        text: [{
          id: Number(props.guid),
          key: "手机型号",
          content: system.info.deviceBrand
        }],
        image: [{
          id: Number(props.guid),
          url: api.cdn + props.image
        }],
      },
      success(res) {

        /* 生成图片 */
        uni.request({
          method: 'post',
          url: api.updateOrder,
          data: {
            guid: props.guid,
            order_id: system.order.order_id
          }
        }).then((res) => {

          if (res.data.code) {

            system.setOrder({});
            load.info("素材提交成功，您的订单定制信息已更新！");

          } else {
            load.fail(res.data.errMsg);
          }

        }).catch(e => {
          load.fail(e)
        }).finally(() => {
          load.hide(0); //关闭动态加载
        });

      },
      fail(res) {
        load.fail(res.errMsg);
      }
    });

  })
}
</script>

<style scoped lang="scss">
@import './show.scss';
</style>
