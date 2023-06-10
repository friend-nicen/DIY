<template>

	<view class="operate">

		<view class="left">
			<text class="info">型号/模型：</text>
			<text class="brand">{{brand}}</text>
			<text id="model" class="replace" @click="to">更换</text>
		</view>

		<view class="right">

			<view class="mini-btn reset" v-show="number.count > 0" @click="reset" size="mini">
				清空素材
			</view>

			<text id="step1" class="mini-btn" @click="next" size="mini">
				下一步
			</text>


		</view>



	</view>



</template>

<script setup>
	import {
		ref,
		reactive,
		getCurrentInstance
	} from "vue"


	import api from "@/service/api.js";
	import load from '@/common/util/load.js';

	import mixin from "@/common/util/mix.js";



	/* 设备品牌 */
	defineProps(['brand']);

	const {
		source,
		systems,
		app,
		number
	} = mixin(); //混入



	/* 跳转模型选择 */
	let to = () => {
		uni.navigateTo({
			url: '/pages/models/models'
		})
	}



	/* 进入下一步 */
	let next = () => {

		let length = Object.values(app.value.stage.shapes).length;

		/* 图形数量 */
		if ('model' in app.value.stage.shapes) {
			length = length - 1;
		} else {

			uni.showToast({
				icon: "error",
				title: "未选择模型"
			});

			return;
		}

		if (length === 0) {

			uni.showToast({
				icon: "error",
				title: "未选择素材"
			});

			return;
		} else {

			load.confirm("您已做好选择了吗？", () => {

				load.start("制作中..");
				toNext(); //处理

			})

		}

	};


	/* 导出画布 */
	let exportImage = () => {


		let that = app.value.stage;
		let off = that.off; //另一块画布

		if (!off.context.canvas.toDataURL) {
			throw new Error("不支持")
		}


		let shapes = that.shapes; //克隆所有图形
		let modelImage, image; //导出的数据



		/* 更新导出画布的长宽 */
		off.canvas.width = shapes.model.w;
		off.canvas.height = shapes.model.h;


		/* 清空导出画布 */
		off.context.clearRect(0, 0, off.canvas.width, off.canvas.height);


		let {
			x,
			y
		} = shapes.model; //图形位移偏差值


		/* 将模型放到最后绘制 */
		let shapesObj = that.getShapes();


		/* 改变所有图形的坐标 */
		for (const i of shapesObj /* .concat(this.operates) */ ) {
			/* 计数,排除model */
			if (i.name == "model") {
				i.save({
					context: off.context,
					x: 0,
					y: 0
				})
			} else {
				/* 更新偏差之后的坐标 */
				i.save({
					context: off.context,
					x: i.x - x,
					y: i.y - y
				})
			}

		}



		/* 带模型绘制 */
		for (const i of shapesObj /* .concat(this.operates) */ ) {
			i.draw(false);
		}


		modelImage = off.context.canvas.toDataURL(); //带模型导出
		/* 清空导出画布 */
		off.context.clearRect(0, 0, off.canvas.width, off.canvas.height);



		/* 不带模型绘制 */
		for (const i of shapesObj /* .concat(this.operates) */ ) {
			/* 排除model */
			if (i.type != "model") {
				i.draw(false);
			}
		}


		image = off.context.canvas.toDataURL(); //不带模型导出


		/* 回撤状态 */
		for (const i of shapesObj /* .concat(this.operates) */ ) {
			i.revoke();
		}


		return {
			modelImage,
			image
		}



	}




	/* 生成图片*/
	let toNext = () => {

		//app.stage.clip = true; //标记开始裁剪
		//app.stage.replay(); //重绘

		try {
			var {
				modelImage,
				image
			} = exportImage();
		} catch (e) {
			load.hide(); //关闭加载效果
			load.fail("导出失败，当前系统不支持该操作！");
			return
		}


		/* 生成图片 */
		uni.request({
			method: 'post',
			url: api.segment,
			data: {
				image: image,
				modelImage: modelImage,
				model: systems.env.model,
				goods: systems.env.goods
			}
		}).then((res) => {

			if (res.data.code) {

				/* 跳转到展示页面 */
				uni.navigateTo({
					url: `/pages/show/show?image=${res.data.data.url}&model=${res.data.data.model}&guid=${res.data.data.guid}&thumb=${res.data.data.thumb}`
				})

			} else {
				load.fail(res.data.errMsg);
			}

		}).catch(e => {
			load.fail(e)
		}).finally(() => {
			load.hide(0); //关闭动态加载
		});
	}

	/* 清空 */
	let reset = () => {
		app.value.stage.reset();
	}
</script>

<style lang="scss" scoped>
	@import './header.scss';
</style>
