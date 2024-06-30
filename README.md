# 介绍

一款基于UNIAPP开发的手机壳DIY小程序（前端示例代码），兼容抖音和微信小程序，在线案例：

## 新版体验

网页版：[https://douyin.nicen.cn/m.html](https://douyin.nicen.cn/m.html)

## 小程序演示

![DIY手机壳](demo.jpg "DIY手机壳")

# 使用方法

1. 下载HBuilderX，导入项目
2. 修改`manifest.json`中的`appid`为你的小程序的appid
3. 安装依赖 "npm i -D"
4. 运行到微信或抖音小程序（无后端代码，需要模拟接口）

# 项目结构

```
├─.hbuilderx         // HBuilderX配置文件
├─assets             // 静态资源
│  ├─css
│  └─image
├─common             // 公共方法
│  ├─canvas
│  └─util
├─components         // 自定义组件
│  └─driver
├─pages              // 页面
│  ├─creative
│  ├─custom-goods
│  ├─index
│  │  ├─addText
│  │  ├─Footer
│  │  ├─Headers
│  │  └─sidebar
│  ├─list
│  ├─make
│  ├─models
│  ├─show
│  └─user
├─service             // 接口
├─store               // 全局状态
├─static              // 静态资源
│  └─tabbar
└─uni_modules         // uni-app组件
```

# 合作咨询

微信：`good7341`，备注：`DIY小程序`