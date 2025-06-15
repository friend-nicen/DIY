/* 组件公共设置 */

import {
	shallowReactive,
	onMounted,
	inject,
	computed,
} from "vue";

import system from "@/store/system.js";
import user from "@/store/user.js"


export default function() {


	//#ifdef MP-WEIXIN
	uni.showShareMenu({
		withShareTicket: true,
		menus: ['shareAppMessage', 'shareTimeline']
	})
	//#endif

	const userInfo = user(); //用户信息
	const systems = system(); //系统信息

	/* 数据源 */
	const source = shallowReactive({
		app: null,
		number: null
	});


	/* 生命周期 */
	onMounted(() => {
		source.app = inject("app"); //引入舞台
		source.number = inject("number"); //应用
	})


	const app = computed(() => {
		return !source.app ? {} : source.app;
	}); //应用

	const number = computed(() => {
		return !source.number ? 0 : source.number;
	}); //图形对象数量


	return {
		source,
		app,
		number,
		systems,
		userInfo
	}

}
