<template>
	<view></view>
</template>

<script setup>
	import load from '@/common/util/load.js'; //加载效果

	import {
		onLoad
	} from "@dcloudio/uni-app";

	import System from "@/store/system.js"
	import user from "@/store/user.js"
	import {
		watch
	} from 'vue'
	import api from '@/service/api';

	const props = defineProps(["order_id", "product_id", "sku_id"]); //接受传参
	const systems = System(); //系统相关参数
	const userInfo = user(); //用户信息


	load.start("加载订单.."); //提示

	/* 页面加载完毕 */
	onLoad(() => {
		// 保存订单
		systems.setOrder({
			"order_id": props.order_id,
			"product_id": props.product_id,
			"sku_id": props.sku_id
		});
	});

	/* 初始化数据 */
	const loadInit = () => {
		uni.request({
			url: api.getCopyId,
			method: 'POST',
			data: {
				product_id: props.product_id
			}
		}).then(res => {

			const result = res.data;

			/* 判断结果 */
			if (result.code) {
				uni.redirectTo({
					url: "/pages/make/make?id=" + result.data
				})
			} else {
				uni.switchTab({
					url: "/pages/index/index"
				})
			}

		}).catch(e => {
			load.fail(e)
		}).finally(() => {
			load.hide(0); //关闭动态加载
		});
	}

	/* 等待初始化 */
	if (userInfo.token) {
		loadInit();
	} else {
		watch(() => userInfo.token, loadInit)
	}
</script>

<style>

</style>
