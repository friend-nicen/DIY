<template>

	<view class="body" v-if="cats.length > 0">

		<!--
		<view class="search">
			<uni-easyinput suffixIcon="search" v-model="keyword" @iconClick="search" @confirm="search" @change="search"
				:inputBorder="false" placeholder="输入关键词进行搜索">
			</uni-easyinput>
		</view>
		-->

		<view class="models">
			<scroll-view class="scroll var" :scroll-y="true">
				<template v-for="(item,index) of cats" :key="item.value">
					<view class="item" :class="{active:active == item.value}" @click="active = item.value">
						{{item.label}}
					</view>
				</template>
			</scroll-view>


			<scroll-view class="scroll content" @scrolltolower="throttleLoadAssets" :scroll-y="true">
				<view class="contain" v-if="loaded">
					<template v-for="(item,index) of assets" :key="item.id">
						<view class="box">
							<image :lazy-load="true" data-eventsync="true" @click="back(item)" class="item-image"
								mode="heightFix" :src="api.cdn+item.thumb"></image>
						</view>
					</template>
				</view>

				<view class="footer" :style="{visibility: page == total ?'visible':'hidden'}">没有更多了</view>

			</scroll-view>
		</view>

	</view>

</template>

<script setup>
	import {
		ref,
		watch
	} from "vue";

	import {
		throttle
	} from "@/common/util/common.js";


	import {
		getUserInfo
	} from "@/common/util/system.js";

	import api from "@/service/api";
	import user from "@/store/user.js"
	import load from "@/common/util/load";


	//let keyword = ref(null); //搜索
	let active = ref(null); //被选分类

	let cats = ref([]); //模型列表
	let userInfo = user(); //用户信息
	let loaded = ref(false); //加载完毕

	/* 加载模型 */
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
		}).finally(() => {
			load.hide(300);
		})
	}

	/* 是否已登录 */
	load.start("加载中...")
	if (userInfo.token) {
		loadCats();
	} else {
		watch(() => userInfo.token, loadCats)
	}



	let page = ref(0); //素材页数
	let total = ref(1); //总页数
	let assets = ref([]); // 已加载的素材

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
					assets.value = res.data.data.data;
					loaded.value = true;
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


	/* 加载素材 */
	watch(active, () => {
		page.value = 0;
		total.value = 1;
		loaded.value = false;
		loadAssets();
	});



	/* 更新模型，回到定制页面 */
	let back = async (item) => {

		/* 判断是否完善了个人信息 */
		if (!userInfo.nickname) {
			await getUserInfo(); //获取用户信息
		}

		uni.switchTab({
			url: '/pages/index/index',
			success() {
				uni.$emit("updateImage", {
					image: api.cdn + "/" + item.url
				})
			}
		})
	}
</script>

<style lang="scss" scoped>
	@import './list.scss';
</style>
