<template>
	<view class="footer">


		<view class="tip">点击拖动，双指旋转缩放图片</view>


		<scroll-view class="var" :scroll-x="true">
			<template v-for="(item,index) of cats" :key="item.value">
				<view class="item" :class="{active:active == item.value}" @click="active = item.value">
					{{item.label}}
				</view>
			</template>
		</scroll-view>


		<scroll-view class="content" @scroll="(e)=>{scroll=e.detail.scrollLeft}" :scroll-left="scroll"
			@scrolltolower="throttleLoadAssets" :scroll-x="true">

			<template v-for="(item,index) of assets" :key="item.id">
				<image class="item-image" mode="heightFix" data-eventsync="true" :src="api.cdn+item.thumb"
					@click="back(item)"></image>
			</template>

		</scroll-view>

	</view>
</template>

<script setup>
	import {
		inject,
		onMounted,
		ref,
		watch
	} from "vue"

	import {
		throttle
	} from "@/common/util/common.js";

	import {
		getUserInfo
	} from "@/common/util/system.js";

	import api from "@/service/api";
	import user from "@/store/user.js"
	import load from "@/common/util/load";

	/* 生命周期 */
	onMounted(() => {
		app = inject("app"); //引入舞台
	})


	let app = {}; //应用



	//let keyword = ref(null); //搜索
	let active = ref(null); //被选分类
	let children = ref(null); //被选素材
	let scroll = ref(0); //滚动的长度
	let cats = ref([]); //模型列表
	let userInfo = user(); //用户信息


	/* 加载素材分类 */
	let loadCats = () => {
		uni.request({
			url: api.cats,
			method: "GET",
		}).then(res => {

			/* 判断请求结果 */
			if (res.data.code) {
				cats.value = res.data.data;
				active.value = res.data.data[0].value;
			} else {
				load.fail(res.data.errMsg)
			}

		}).catch(e => {
			load.fail(e)
		})
	}

	/* 是否已登录 */
	//load.start("加载中...")

	if (userInfo.token) {
		loadCats();
	} else {
		watch(() => userInfo.token, loadCats)
	}

	let page = ref(0); //素材页数
	let total = ref(1); //总页数
	let assets = ref([]); // 记录已加载的素材

	/* 加载素材 */
	let loadAssets = () => {

		if (total.value == page.value) {
			return;
		}

		load.start("加载中...");

		page.value++; //页数加1

		uni.request({
			url: api.assets,
			method: "POST",
			data: {
				page: page.value,
				cat: active.value
			}
		}).then(res => {

			/* 判断请求结果 */
			if (res.data.code) {

				/* 第一页替换，非第一页追加 */
				if (page.value == 1) {
					scroll.value = 0; //滚动归0
					assets.value = res.data.data.data;
				} else {
					assets.value = assets.value.concat(res.data.data.data);
				}


				total.value = !res.data.data.last_page ? 1 : res.data.data.last_page;


			} else {
				load.fail(res.data.errMsg)
			}

		}).catch(e => {
			load.fail(e)
		}).finally(() => {
			load.hide(300);
		})
	}


	let throttleLoadAssets = throttle(loadAssets, 300); //节流



	/* 监控目录变化 */
	watch(active, () => {
		page.value = 0;
		total.value = 1;
		loadAssets();
	});



	/* 更新模型，回到定制页面 */
	let back = async (item) => {

		/* 判断是否完善了个人信息 */
		if (!userInfo.nickname) {
			await getUserInfo(); //获取用户信息
		}

		/* if (children.value == item.id) {
			return;
		} */

		children.value = item.id;

		uni.$emit("updateImage", {
			image: api.cdn + "/" + item.url
		})
	}
</script>

<style lang="scss" scoped>
	@import './footer.scss';
</style>
