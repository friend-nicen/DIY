const host = "接口域名"; //主域名

export default {
    cdn: "CDN域名", //cdn缓存的域名
    host: host, //接口
    segment: host + "/mini/getImage", //图像上传
    login: host + "/entry/login", //登录
    updateInfo: host + "/mini/updateInfo", //更新用户信息
    models: host + "/mini/models", //模型列表
    defaultModel: host + "/mini/default", //商品的默认模型
    cats: host + "/mini/cats", //素材分类列表
    assets: host + "/mini/assets", //素材列表
    files: host + "/mini/file_list", //成品列表
    fonts: host + "/mini/font_list", //字体列表
    images: host + "/mini/images", //图片列表
    getImage: host + "/mini/image", //获取图片配置
    showImage: host + "/entry/show", //展示图片
    image: host + "/image", //生成图片
    text: host + "/text", //生成字体
    checkImage: host + "/mini/checkImage", //图片检测
    getCopyId: host + "/mini/getCopyId", //获取抖店商品对应的创意ID
    getCreativeImage: host + "/mini/get_creative_image", //创意图片生成作品
    updateOrder: host + "/mini/update_order", //更新订单号
}