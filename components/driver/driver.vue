<template>
	<view v-if='!finish' class="modal">

		<view class="angle" :class="step.placement"
			:style="{top:angle.top+'px',left:angle.left+'px',opacity: loaded?1:0}"></view>

		<view class="step" id="direct"
			:style="{top:position.top+'px',left:position.left+'px',width:position.width+'px',opacity: loaded?1:0}">

			<view class="content">{{step.content}}</view>

			<view class="button">
				<view class="cancel" @click="setFinish">关闭指引</view>
				<view class="next" @click="next">{{steps.length == current+1 ?"重新学习":"下一步"}}</view>
			</view>

		</view>
	</view>
</template>

<script setup>
	import $ from "@/common/util/jquery.js"
	import system from "@/sotre/system.js";

	import {
		getCurrentInstance,
		onMounted,
		reactive,
		watch,
		ref,
		computed
	} from "vue";


	const props = defineProps(['steps', 'parent', 'next', 'index']); //步骤相关数据
	const emit = defineEmits(['next']); //下一步的自定义事件
	const systems = system(); //系统信息
	const current = ref(0); //当前组件的位置

	const step = computed(() => {
		return props.steps[current.value];
	});


	/* 分步指引 */
	const finish = ref(uni.getStorageSync(props.index));

	const setFinish = () => {
		finish.value = true;
		uni.setStorageSync(props.index, 1)
	}

	/* 下一步 */
	const next = () => {
		if (props.steps.length > current.value + 1) {
			current.value++;
		} else {
			current.value = 0;
		}
	}


	/* 组件的位置信息 */
	const position = reactive({
		width: 0,
		height: 0,
		top: 0,
		left: 0
	});

	/* 组件的位置信息 */
	const angle = reactive({
		top: 0,
		left: 0
	});

	const that = $("#direct", getCurrentInstance());
	const loaded = ref(false); //加载完毕？

	/* 更新组件的大小信息 */
	const update = async () => {

		loaded.value = false; //显示组件


		let el_position = {
			width: 0,
			height: 0,
			top: 0,
			left: 0
		};

		const el = $(step.value.el, step.value.component ? props.parent.refs[step.value.component] : false);


		/* 元素选择 */
		await el.position().then((res) => {
			if (!res) return;
			el_position = res;
		});

		/* 计算可展示的边界 */
		let boundWidth = systems.info.screenWidth;
		let boundHeight = systems.info.screenHeight;

		/* 获取元素本身的大小 */
		await that.position().then(res => {
			if (!res) return;
			position.width = boundWidth * 0.65;
			position.height = res.height;
		});






		/* 判断组件展示的方向 */
		switch (true) {

			case step.value.placement == "left": {

				angle.top = el_position.top + (el_position.height / 2) - 5;
				angle.left = el_position.left - 5;

				position.top = el_position.top + (el_position.height / 2) - (position.height / 2);
				position.left = el_position.left - 5 - position.width;

				/* 边界检查 */
				if (position.top < 10) {
					position.top = 10;
				}

				if (position.left < 10) {
					position.left = 10;
					position.width = el_position.left - 15;
				}

				break;
			}

			case step.value.placement == "bottom": {

				angle.top = el_position.top + el_position.height - 5;
				angle.left = el_position.left + (el_position.width / 2) - 5;

				position.top = el_position.top + el_position.height + 5;
				position.left = el_position.left - (position.width / 2) + (el_position.width / 2);

				/* 边界检查 */
				if (position.top < 10) {
					position.top = 10;
				}

				if (position.left + position.width >= boundWidth) {
					position.left = boundWidth - position.width - 15;
				}

				break;
			}

			case step.value.placement == "top": {

				angle.top = el_position.top - 5;
				angle.left = el_position.left + (el_position.width / 2) - 5;

				position.top = el_position.top - position.height - 5;
				position.left = el_position.left - (position.width / 2) + (el_position.width / 2);

				/* 边界检查 */
				if (position.top < 10) {
					position.top = 10;
				}

				if (position.left + position.width >= boundWidth) {
					position.left = boundWidth - position.width - 15;
				}

				break;
			}

			case step.value.placement == "right": {

				angle.top = el_position.top + (el_position.height / 2) - 5;
				angle.left = el_position.left + el_position.width;

				position.top = el_position.top + (el_position.height / 2) - (position.height / 2);
				position.left = el_position.left + el_position.width + 10;

				/* 边界检查 */
				if (position.top < 10) {
					position.top = 10;
				}

				if (position.left + position.width >= boundWidth) {
					position.width = boundWidth - position.left - 30;
				}

				break;
			}

			default: {
				break;
			}

		}



		loaded.value = true; //显示组件

	}


	/* 实时同步 */
	watch(current, update);
	/* 获取组件的大小 */
	onMounted(update);
</script>

<style lang="scss" scoped>
	@import "index.scss";
</style>
