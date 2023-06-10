<template>

	<view class="body" v-if="Object.keys(models).length > 0">

		<!--
		<view class="search">
			<uni-easyinput suffixIcon="search" v-model="keyword" @iconClick="search" @confirm="search" @change="search"
				:inputBorder="false" placeholder="输入关键词进行搜索">
			</uni-easyinput>
		</view>
		-->

		<view class="models">
			<scroll-view class="scroll var" :scroll-y="true">
				<template v-for="(item,index) of Object.keys(models)" :key="item">
					<view class="item" :class="{active:active == item}" @click="select(item,index)">{{item}}</view>
				</template>
			</scroll-view>
			<scroll-view :scroll-with-animation="true" :scroll-into-view="children" class="scroll content"
				:scroll-y="true">
				<template v-for="(item,index) of Object.keys(models)" :key="item">

					<view class="title" :id="'a'+index">{{item}}</view>

					<template v-for="k of models[item]" :key="k.mname">
						<view class="item" @click="back(k)">{{k.mname}}</view>
					</template>

				</template>
			</scroll-view>
		</view>

	</view>

</template>

<script setup>
	import {
		reactive,
		ref,
		watch
	} from "vue";

	import api from "@/service/api";
	import user from "@/sotre/user.js"
	import system from "@/sotre/system.js"
	import load from "@/common/util/load";


	//let keyword = ref(null); //搜索
	let active = ref(null); //被选分类
	let children = ref(null); //滚动到指定的子元素


	let models = reactive(Object.create(null)); //模型列表
	let userInfo = user(); //用户信息
	let systems = system(); //系统信息

	/* 加载模型 */
	let loadModel = () => {
		uni.request({
			url: api.models,
			method: "POST",
			data: {
				goods: systems.env.goods
			}
		}).then(res => {

			/* 判断请求结果 */
			if (res.data.code) {
				let data = res.data.data;
				let temp = null;

				/* 遍历 */
				for (let i of data) {
					if (temp != i.vname) {
						temp = i.vname;
						models[i.vname] = [];
					}
					models[i.vname].push(i);
				}

				/* 默认选择第一个 */
				if (data.length > 0) {
					active.value = data[0].vname;
				}

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
		loadModel();
	} else {
		watch(() => userInfo.token, loadModel)
	}


	/* 跟随滚动 */
	let select = (item, index) => {
		active.value = item;
		children.value = "a" + index;
	}


	/* 更新模型，回到定制页面 */
	let back = (item) => {
		uni.switchTab({
			url: '/pages/index/index',
			success() {
				systems.info.deviceBrand = item.mname;
				systems.env.model = item.mid; //当前使用的模型
				uni.$emit("updateModel", {
					image: api.cdn + "/" + item.url
				})
			}
		})
	}
</script>

<style lang="scss" scoped>
	@import './models.scss';
</style>
