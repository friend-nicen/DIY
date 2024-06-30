<template>

	<view class="sidebar">

		<view id="removeBg" class="button" data-eventsync="true" @click="select(true)">
			<image class="image" mode="widthFix" src="@/assets/image/rm.svg"></image>
		</view>
		<text class="op">去除背景</text>

		<view class="button" data-eventsync="true" @click="select(false)">
			<image class="image" mode="widthFix" src="@/assets/image/res.svg"></image>
		</view>
		<text class="op">上传素材</text>

		<view id="addText" class="button" @click="open">
			<image class="image" mode="widthFix" src="@/assets/image/word.svg"></image>
		</view>
		<text class="op">添加文字</text>


		<view class="button" @click="to">
			<image class="image" mode="widthFix" src="@/assets/image/model.svg"></image>
		</view>
		<text class="op">选择型号</text>


		<uni-popup :safe-area="false" ref="popup" :is-mask-click="false" type="bottom" :animation="true">
			<add-text :popup="popup" />
		</uni-popup>

	</view>
</template>

<script setup>
	import {
		watch,
		ref
	} from "vue"

	import AddText from '../addText/addText.vue'

	import {
		getUserInfo
	} from "@/common/util/system.js";

	import api from "@/service/api.js"
	import load from '@/common/util/load.js'

	import mixin from "@/common/util/mix.js";


	const {
		app,
		systems,
		userInfo
	} = mixin(); //混入

	/* 重新选择 */
	const emit = defineEmits(['select']);


	/* 跳转模型选择 */
	const to = () => {
		uni.navigateTo({
			url: '/pages/models/models'
		})
	}


	const popup = ref(null); //ref标记

	const open = () => {
		popup.value.open('bottom')
	}


	/* 加载默认模型 */
	const loadInit = () => {

		try {
			uni.request({
				url: api.defaultModel,
				method: "POST",
				data: {
					goods: systems.env.goods,
					model: {
						deviceBrand: systems.info.deviceBrand,
						deviceModel: systems.info.deviceModel
					}
				}
			}).then(res => {
				/* 判断请求结果 */
				if (res.data.code) {
					systems.env.model = res.data.data.id; //当前使用的模型
					systems.info.deviceBrand = res.data.data.name; //模型名
					app.value.stage.setModel(2, api.cdn + res.data.data.url); //绘制默认图形
				} else {
					load.fail(res.data.errMsg)
				}

			}).catch(e => {
				load.fail(e)
			}).finally(() => {
				load.hide();
			})
		} catch (e) {
			load.fail(e)
		}

	}



	/* 监听素材的改变 */
	uni.$on("updateImage", async (res) => {
		if (!!res.image) {
			let file = await app.value.stage.down(res.image); //下载图片
			app.value.stage.drawImage(app.value.stage.max, file);
		}
	})


	/* 监听模型的改变 */
	uni.$on("updateModel", (res) => {
		if (!!res.image) {
			app.value.stage.setModel(2, res.image);
		}
	})


	/* 是否已登录 */
	load.start("加载模型...")
	if (userInfo.token) {
		loadInit();
	} else {
		watch(() => userInfo.token, loadInit)
	}


	/* 选择素材 */
	const select = async (flag) => {

		/* 判断是否完善了个人信息 */
		if (!userInfo.nickname) {
			await getUserInfo(); //获取用户信息
		}

		emit("select", flag); //选择
	}
</script>

<style lang="scss" scoped>
	@import './sidebar.scss';
</style>
