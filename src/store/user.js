import {
	defineStore
} from 'pinia';

export default defineStore('user', {
	state: () => {
		return {
			token: null,
			nickname: null,
			avatar: null,
			ad: null,
			adUnitId: null
		};
	},

	actions: {

		/* 
			记录token
		 */
		login(info) {

			this.$state = info; //更新个人信息
			this.save(); //保存

		},
		/* 
			个人信息
		 */
		setInfo(info) {
			this.nickname = info.nickname;
			this.avatar = info.avatar;
			//this.save(); //保存本地
		},
		/* 本地保存 */
		save() {
			//保存本地存储凭证
			uni.setStorageSync("userInfo", {
				token: this.token,
				nickname: this.nickname,
				avatar: this.avatar
			});
		}
	},
});
