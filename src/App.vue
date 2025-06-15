<script>
import {login} from "@/common/util/system.js";


export default {
  onLaunch: function () {
    login(); //开始登录

    /* 如果是微信 */
    //#ifdef MP-WEIXIN


    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })


    /* 自动监测小程序是否有新版本 */
    /* 这个是异步的 */
    if (wx.canIUse('getUpdateManager')) {

      const updateManager = wx.getUpdateManager(); //获取更新管理器
      /* 如果有更新则直接更新 */
      updateManager.onUpdateReady(function () {
        updateManager.applyUpdate()
      })
    }

    //#endif

  },
  onShow: function () {

  },
  onHide: function () {

  }
}
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/uni_modules/uni-scss/index.scss';

// 设置整个项目的背景色
page {
  background-color: #f6f6f6;
}

view, text, button, page, image {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
</style>
