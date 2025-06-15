/* 显示uni的各种加载特效 */

let loading = 0; //加载的数量
let timer = null; //定时器
export default {
	/* 显示加载动画 */
	start(text = "加载中") {

		if (loading === 0) {
			uni.showLoading({
				title: text
			});
		}

		loading++; //弹窗+1


	},
	/* 隐藏加载 */
	hide(time = 300, callback = null) {

		/* 没有弹窗 */
		if (loading == 0) {
			return;
		}

		if (loading >= 1) {
			loading--; //弹窗减一
		}

		/* 需要关闭弹窗 */
		if (loading === 0) {
			timer = setTimeout(() => {
				uni.hideLoading();
				clearTimeout(timer);

				/* 触发回调 */
				if (callback) {
					callback()
				}
			}, time);
		}
	},
	/* 成功提示 */
	success: function(text) {

		uni.showToast({
			mask: true,
			icon: "success",
			title: text,
			duration: 2000
		});
	},
	fail: function(text) {

		uni.hideLoading();
		loading = 0; //重置

		uni.showModal({
			title: '错误提示',
			showCancel: false,
			content: text,
			success: function(res) {
				return; //仅提示，不作任何操作
			}
		});
	},
	confirm: function(text, callback = null) {

		uni.hideLoading();
		loading = 0; //重置

		uni.showModal({
			title: '温馨提示',
			content: text,
			success: function(res) {
				if (res.confirm && callback) {
					callback()
				}
			}
		});
	},
	info: function(text, callback = null) {

		uni.hideLoading();
		loading = 0; //重置

		uni.showModal({
			title: '温馨提示',
			showCancel: false,
			content: text,
			success: function(res) {
				if (callback) {
					callback()
				}
			}
		});
	},
	to: function(url, time) {
		/* 跳转回列表 */
		let timer = setTimeout(() => {
			clearTimeout(timer);
			uni.switchTab({
				url: url
			})
		}, time)
	},

	/* 跳转回普通页面 */
	toto: function(url, time) {
		/* 跳转回列表 */
		let timer = setTimeout(() => {
			clearTimeout(timer);
			uni.redirectTo({
				url: url
			})
		}, time)
	}

}
