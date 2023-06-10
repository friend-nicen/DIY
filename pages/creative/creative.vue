<template>

	<view class="body">

		<template v-for="(images,index) of creatives" :key="index">

			<view class="column">

				<view v-for="(item,index) of images" :key="item.id" class="item" @click='goto(item.id)'>

					<image data-eventsync="true" :lazy-load="true" class="item-image" mode="widthFix"
						:src="api.cdn+item.thumb"></image>

					<view class="item-text">
						<view class="left">{{item.name}}</view>
						<view class="right">
							<text class="iconfont icon-xihuan"></text>
							<text class="count">&nbsp;{{item.used}}次</text>
						</view>
					</view>

				</view>

			</view>

		</template>

		<view class="footer" :style="{visibility: page == total ?'visible':'hidden'}">没有更多了</view>

	</view>

</template>

<script setup>
	import {
		computed,
		ref,
		watch
	} from "vue";

	import {
		throttle
	} from "@/common/util/common.js";

	import {
		onReachBottom
	} from "@dcloudio/uni-app";

	import {
		getUserInfo
	} from "@/common/util/system.js";

	import api from "@/service/api";
	import user from "@/sotre/user.js"
	import load from "@/common/util/load";
	import systems from "@/sotre/system.js"


	/* 系统信息 */
	const system = systems();
	const userInfo = user(); //用户信息

	const page = ref(0); //素材页数
	const total = ref(1); //总页数
	const images = ref([]); // 已加载的素材

	/* 实际数据 */
	const creatives = computed(() => {

		const source = [
			[],
			[],
			[]
		];

		/* 生成素材 */
		images.value.forEach((item, index) => {
			source[index % 3].push(item);
		});

		return source;
	})


	/* 加载素材 */
	const loadImages = () => {

		if (total.value == page.value) {
			return;
		}


		load.start("加载中...");

		page.value++; //页数加1

		uni.request({
			url: api.images,
			method: "POST",
			data: {
				page: page.value,
				goods: system.env.goods
			}
		}).then(res => {

			/* 判断请求结果 */
			if (res.data.code) {

				/* 第一页替换，非第一页追加 */
				if (page.value == 1) {
					images.value = res.data.data.data;
				} else {
					images.value = images.value.concat(res.data.data.data);
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

	const throttleLoadimages = throttle(loadImages, 300); //节流

	/* 下一页 */
	onReachBottom(() => {
		throttleLoadimages();
	})

	/* 是否已登录 */
	if (userInfo.token) {
		loadImages();
	} else {
		watch(() => userInfo.token, loadImages)
	}


	/* 跳转制作页面 */
	const goto = (id) => {
		uni.navigateTo({
			url: "/pages/make/make?id=" + id
		})
	}
</script>

<style lang="scss" scoped>
	@import './creative.scss';
</style>
