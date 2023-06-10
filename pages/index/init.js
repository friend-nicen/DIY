import {
	shallowReactive
} from "vue";

import load from '@/common/util/load.js'

import user from "@/sotre/user.js"
import system from "@/sotre/system";
import {
	getUserInfo
} from "@/common/util/system.js";

import api from "@/service/api";


export default function() {

	/* 
		数据
	 */

	const app = shallowReactive({
		canvas: null, //画布
		context: null, //canvas上下文对象
		stage: null, //舞台
		position: null, //画布位置信息
		off: null //隐藏的画布
	});

	/* 获取小程序标识 */
	const systems = system();


	/* 用户信息 */
	const userInfo = user();



	/* 内容检测 */
	const checkImage = async (image, flag = false) => {

		let that = app.stage;
		let off = that.off; //另一块画布

		if (!off.context.canvas.toDataURL) {
			throw new Error("不支持")
		}

		/* 清空导出画布 */
		off.context.clearRect(0, 0, off.canvas.width, off.canvas.height);

		let param = await that.getImageInfo(image);

		/* 是否需要去除背景 */
		let w = flag ? param.width : param.w / app.stage.Big;
		let h = flag ? param.height : param.h / app.stage.Big; //大小

		/* 去除背景，判断图片的大小 */
		if (flag) {
			for (let i = 0; i <= 1; i++) {

				if (w > 1000) {
					h = 1000 * (h / w);
					w = 1000;
				}

				if (h > 1000) {
					w = 1000 * (w / h);
					h = 1000;
				}
			}
		}


		/* 更新导出画布的长宽 */
		off.canvas.width = w;
		off.canvas.height = h;


		off.context.drawImage(param.image, 0, 0, w, h);
		image = off.context.canvas.toDataURL(); //不带模型导出

		/* 上传到图片检测 */
		let result = await new Promise(resolve => {


			/* 如果是微信 */
			//#ifdef MP-WEIXIN
			let data = {
				image: image,
				rmBg: flag,
				scene: "wechat"
			}
			//#endif

			/* 如果是抖音 */
			//#ifdef MP-TOUTIAO
			let data = {
				image: image,
				rmBg: flag,
				/* 用于判断是哪个小程序 */
				mini: systems.env.mini
			}
			//#endif

			/* 开始请求 */
			uni.request({
				url: api.checkImage,
				method: "POST",
				data: data
			}).then((res) => {
				if (res.data.code) {
					resolve(res.data.data)
				} else {
					load.fail(res.data.errMsg);
					resolve(false)
				}
			}).catch(e => {
				load.fail(JSON.stringify(e))
			})

		})
		/* 清空导出画布 */
		off.context.clearRect(0, 0, off.canvas.width, off.canvas.height);
		return result;
	}




	/* 绘制 */
	/* 
		@param flag 绘制时是否去除背景
	 */
	const draw = async (flag = false) => {

		/* 判断是否完善了个人信息 */
		if (!userInfo.nickname) {
			await getUserInfo(); //获取用户信息
		}


		/* 选择图片*/
		uni.chooseImage({
			count: 9,
			sizeType: ['original'],
			async success(res) {

				let file = res.tempFilePaths[0]; //选择的文件

				load.start("检测中..."); //提示

				/* 错误捕获 */
				try {
					var result = await checkImage(res.tempFilePaths[0], flag);
					load.hide("300"); //提示
				} catch (e) {
					load.hide("300"); //提示
					load.fail("操作失败，当前系统不支持该操作！");
				}


				if (!result) return; //中断操作

				/* 如果去除了背景 */
				if (flag) {
					file = await app.stage.down(api.cdn + result); //下载图片
				}

				app.stage.drawImage(app.stage.max, file);
			}
		})
	};



	return {
		draw,
		app
	}

}
