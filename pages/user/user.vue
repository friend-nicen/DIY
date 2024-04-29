<template>

	<view class="one">


		<template v-if="loaded">

			<template v-if="files.length > 0">

				<view class="task" v-for="(file,key) in files" :key="file.id">
					<view class="line">
						<view class="label">
							<text class="iconfont icon-tupian" style="margin-right: 15rpx;"></text>
							<text>{{file.mname}}（{{ file.file_size }}m）</text>
						</view>

						<view class="tab">
							<text>{{file.id}}</text>
						</view>
					</view>

					<view class="popup-text">
						<text>上传时间：{{ file.upload_date }} {{ file.upload_time }}</text>
						<view style="cursor: pointer;" class="point" @click="goto(file)">
							<text>查看</text>
						</view>
					</view>

				</view>

				<view class="endes">已经到底了</view>
			</template>

			<template v-else>
				<view class="empty">
					<image class="image" src="@/assets/image/empty.svg" mode="widthFix"></image>
					<text class="info">暂无数据</text>
				</view>
			</template>


		</template>



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

	import api from "@/service/api";
	import load from "@/common/util/load";
	import user from "@/store/user.js"

	import {
		onReachBottom,
		onShow
	} from "@dcloudio/uni-app";




	let userInfo = user(); //用户信息
	let page = ref(0); //素材页数
	let total = ref(1); //总页数
	let files = ref([]); // 已加载的素材
	let loaded = ref(false); //加载

	/* 加载素材 */
	let loadFiles = (flag = true) => {

		if (total.value == page.value) {
			return;
		}

		if (flag) {
			load.start("加载中...");
		}

		page.value++; //页数加1

		uni.request({
			url: api.files,
			method: "POST",
			data: {
				page: page.value
			}
		}).then(res => {

			/* 判断请求结果 */
			if (res.data.code) {

				/* 第一页替换，非第一页追加 */
				if (page.value == 1) {
					files.value = res.data.data.data;
				} else {
					files.value.concat(res.data.data.data);
				}

				files.value = res.data.data.data;
				total.value = !res.data.data.last_page ? 1 : res.data.data.last_page;

			} else {
				load.fail(res.data.errMsg)
			}

		}).catch(e => {
			load.fail(e)
		}).finally(() => {
			if (flag) {
				load.hide(300);
			}
			loaded.value = true;
		})
	}





	/* 是否已登录 */
	if (userInfo.token) {
		loadFiles();
	} else {
		watch(() => userInfo.token, loadFiles)
	}



	let throttleLoadAssets = throttle(loadFiles, 300); //节流


	onReachBottom(throttleLoadAssets); //下拉刷新

	/* 加载数据 */
	onShow(() => {
		page.value = 0;
		total.value = 1;
		loadFiles(false); //刷新
	})


	let goto = (item) => {

		/*跳转到展示页面 */
		uni.navigateTo({
			url: `/pages/show/show?image=${item.file_url}&model=${item.pic_url}&guid=${item.id}`
		})
	}
</script>

<style lang="scss" scoped>
	@import './user.scss';
</style>
