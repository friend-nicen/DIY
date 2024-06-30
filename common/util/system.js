import user from "@/store/user.js"
import api from "@/service/api";
import load from "@/common/util/load.js"
import system from "@/store/system";


/* 
	系统相关的一些接口
 */




/* 
	添加拦截器
 */
function addIntercept() {
	/* 用户信息 */
	const userInfo = user();

	/* 
		全局认证头
	 */
	uni.addInterceptor('request', {
		invoke(args) {
			try {
				args.header = {};
				args.header['Authorization'] = userInfo.token
			} catch (e) {
				console.log(e);
			}

			return args;
		}
	})
}




/**
 * 系统登录接口
 */
export function login() {

	/* 用户信息 */
	const userInfo = user();

	//const info = uni.getStorageSync("userInfo");

	/* 如果本地没有缓存 */
	//if (!info) {

	return new Promise(resolve => {

		uni.login({
			force: true,
			success(res) {

				/* 如果是微信 */
				//#ifdef MP-WEIXIN
				const data = {
					code: res.code,
					scene: "wechat"
				}
				//#endif

				/* 如果是抖音 */
				//#ifdef MP-TOUTIAO

				/* 获取小程序标识 */
				const systems = system();

				const data = {
					code: res.code,
					mini: systems.env.mini
				}
				//#endif

				uni.request({
					url: api.login,
					method: "POST",
					data: data
				}).then((res) => {

					/* 如果登录成功！ */
					if (res.data.code) {
						userInfo.login(res.data.data)
						addIntercept(); //添加登录成功的拦截器
						resolve(); //退出promise
					} else {
						load.fail(res.data.errMsg); //弹出错误信息
					}
				}).catch(e => {
					load.fail(e)
				})
			},
			fail(res) {
				load.fail(JSON.stringify(res));
			}
		});

	})

	/* } else {
		userInfo.login(info); //直接使用本地凭证
		addIntercept(); //添加登录成功的拦截器
	} */



}


/* 
	获取用户信息
	@URL https://ask.dcloud.net.cn/question/142353
	data-eventsync="true"
 */
export function getUserInfo() {


	/* 用户信息 */
	const userInfo = user();

	return new Promise(resolve => {

		uni.getUserProfile({
			desc: "完善个人信息",
			force: true,
			success(res) {

				const info = {
					avatar: res.userInfo.avatarUrl,
					nickname: res.userInfo.nickName
				};

				load.start("加载中.."); //交互提示

				/* 更新本地用户信息 */
				userInfo.setInfo(info);

				try {
					uni.request({
						url: api.updateInfo,
						method: "POST",
						data: info
					}).then((res) => {
						/* 如果修改成功！ */
						if (res.data.code) {
							resolve(true);
						}
					}).catch(e => {
						load.fail(e)
					}).finally(() => {
						load.hide();
					})
				} catch (e) {
					console.log(e);
				}
			},
			fail(res) {
				load.info("授权失败！");
			}
		})
	})


}





/* 
	激励视频观看
 */
export function watchVideo() {

	/* 用户信息 */
	const userInfo = user();

	return new Promise(resolve => {

		if (!userInfo.ad) {
			resolve(true);
			return;
		}

		load.start("加载广告...");

		// 在页面onLoad回调事件中创建激励视频广告实例
		if (wx.createRewardedVideoAd) {

			const videoAd = wx.createRewardedVideoAd({
				adUnitId: userInfo.adUnitId
			});

			videoAd.onLoad(() => {});

			videoAd.onError(() => {
				resolve(true);
			})


			/* 判断广告如何关闭的 */
			videoAd.onClose((res) => {
				if (res && res.isEnded) {
					resolve(true);
				} else {
					load.fail("抱歉，您未完整观看，无法为您解除限制，给您带来的不便敬请谅解！感谢！");
					resolve(false);
				}
			});


			// 用户触发广告后，显示激励视频广告
			if (videoAd) {
				videoAd.show()
					.catch(() => {
						// 失败重试
						videoAd.load()
							.then(() => videoAd.show())
							.catch(() => {
								resolve(true)
							});
					})
			} else {
				resolve(true)
			}

			load.hide(); //关闭加载

		} else {
			resolve(true);
		}
	})
}
