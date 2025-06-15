import {
	defineStore
} from 'pinia';
import {
	watch,
	ref
} from 'vue';



const loaded = ref(false); //记录系统信息是否已经加载

const system = defineStore('system', {
	state: () => {

		loaded.value = true; //加载设备

		return {
			info: {
				deviceBrand: "未知",
				screenWidth: 0,
				screenHeight: 0,
				pixelRatio: null,
				deviceModel: null
			},
			env: {
				goods: 1, //商品id
				model: null, //当前使用的模型ID
				mini: "fork_b", //哪个小程序
			},
			/* 电商订单信息 */
			order: {
				order_id: "", //传递过来的订单号
				product_id: '', //商品ID
				sku_id: ""
			}
		};
	},

	actions: {
		setInfo(info) {
			this.info = info;
		},
		setOrder(order) {
			this.order = order;
		},
	},
});


/* 加载设备信息 */
if (!loaded.value) {

	const stopWatch = watch(loaded, () => {
		/* 获取系统信息 */
		uni.getSystemInfo({
			success(res) {

				loaded.value = true; //标记已经下载下次不加载

				system().setInfo({
					screenWidth: res.screenWidth,
					screenHeight: res.screenHeight,
					pixelRatio: res.pixelRatio,
					deviceBrand: res.deviceBrand,
					deviceModel: res.deviceModel
				});

				stopWatch(); //停止监视
			},
			fail(res) {
				console.log("getSystemInfo 调用失败", res);
			},
		});
	})
}

export default system;
