<template>
	<view class="addText">

		<view class="title">
			<view class="iconfont icon-guanbi" @click="close"></view>
			<view class="text">文字</view>
			<view class="iconfont icon-queding" @click="confirm"></view>
		</view>

		<!-- 颜色块 -->
		<scroll-view class="color-list" :scroll-x="true" :show-scrollbar="false" :enhanced="true">
			<view class="item">
				<template v-for="(item,index) of colors" :key="index">
					<view @click="config.color = item" class="color" :class="{active:item==config.color}"
						:style="{backgroundColor:item}"></view>
				</template>
			</view>
		</scroll-view>


		<!-- 字体列表 -->
		<scroll-view class="font-list" :scroll-x="true" :show-scrollbar="false" :enhanced="true">
			<view class="item">
				<template v-for="(item,index) of font_list" :key="index">
					<view @click="config.font=item.id" :class="{active:item.id==config.font}"
						:style="{borderColor:item.id==config.font?config.color:'transparent'}" class="font-item">
						<image class="image" :src="api.host+'/text?text='+item.name+'&font='+item.id" mode="heightFix">
						</image>
					</view>
				</template>
			</view>
		</scroll-view>

		<view class="form">
			<textarea :maxlength="15" v-model="config.text" v-if="loaded" :show-confirm-bar="false" :fixed="true"
				placeholder-class="placeholder" placeholder="选择颜色和字体后,输入待生成的文字,点击左上角进行生成" class="input"></textarea>


			<cover-view class="direction">

				<cover-view class="item" :class="{active:config.direction == 'horizontal'}"
					@click="config.direction = 'horizontal'">
					横向
				</cover-view>

				<cover-view class="item" :class="{active:config.direction == 'vertical'}"
					@click="config.direction = 'vertical'">
					竖向
				</cover-view>
			</cover-view>

		</view>


	</view>
</template>

<script setup>
	import {
		inject,
		nextTick,
		onMounted,
		reactive,
		ref,
		shallowReactive,
		watch
	} from "vue"

	import api from "@/service/api";
	import load from "@/common/util/load";
	import user from "@/sotre/user.js"

	const props = defineProps(['popup']);

	const font_list = ref([]); //字体列表

	/* 生命周期 */
	onMounted(() => {
		app.data = inject("app"); //引入舞台
	});

	let userInfo = user(); //用户信息
	let app = shallowReactive({
		data: null
	}); //应用

	/* 文字生成配置 */
	const config = reactive({
		color: "#000000",
		font: "0",
		direction: "horizontal",
		text: ""
	});


	const loaded = ref(false); //加载状态


	/* 关闭弹出框 */
	const close = () => {
		props.popup.close();
	}

	/* 颜色列表 */
	const colors = [
		"#000000",
		"#ffffff",
		"#ff0000",
		"#ffff00",
		"#00ff00",
		"#00ffff",
		"#0000ff",
		"#ff00ff",
		"#ff0000",
		"#F53F3F",
		"#F77234",
		"#FF7D00",
		"#F7BA1E",
		"#9FDB1D",
		"#00B42A",
		"#14C9C9",
		"#3491FA",
		"#165DFF",
		"#722ED1",
		"#D91AD9",
		"#F5319D",
		"#86909c"
	];


	/* 加载数据 */
	const loadInit = () => {

		/* 加载字体列表 */
		uni.request({
			url: api.fonts,
			method: "GET"
		}).then(res => {

			/* 判断请求结果 */
			if (res.data.code) {
				font_list.value = res.data.data;
				loaded.value = true; //加载成功

				nextTick(() => {
					config.font = res.data.data[0].id; //默认字体
				})
			} else {
				load.fail(res.data.errMsg)
			}

		}).catch(e => {
			load.fail(e)
		}).finally(() => {
			load.hide(300);
		});

	}


	if (userInfo.token) {
		loadInit();
	} else {
		watch(() => userInfo.token, loadInit)
	}



	/* 
		确认生成
	 */
	const confirm = () => {

		/* 
			限制
		 */
		if (config.text.length > 15) {
			load.fail("单次最多输入15个文字哦");
			return;
		}


		if (config.text) {

			load.start("加载中..."); //加载文本

			let color = config.color.replaceAll("#", "*"); //颜色

			/* 加载字体列表 */
			uni.request({
				url: api.text,
				method: "POST",
				data: {
					text: config.text,
					color: color,
					font: config.font,
					direction: config.direction,
					echo: true
				}
			}).then(res => {

				/* 判断请求结果 */
				if (res.data.code) {

					uni.$emit("updateImage", {
						image: api.host + "/" + res.data.data
					});

					close(); //关闭弹窗


				} else {
					load.fail(res.data.errMsg)
				}

			}).catch(e => {
				load.fail(e)
			}).finally(() => {
				load.hide(300);
			});

		} else {
			load.fail("请输入文字后继续");
		}
	}
</script>

<style lang="scss" scoped>
	@import './addText.scss';
</style>
