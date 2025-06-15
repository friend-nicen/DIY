export function getPosOfEvent(ev) {
	//多指触摸， 返回多个手势位置信息
	if ("touches" in ev && ev.touches) {
		const posi = [];
		let src = null;

		for (let t = 0, len = ev.touches.length; t < len; t++) {
			src = ev.touches[t];
			posi.push({
				x: src.pageX,
				y: src.pageY
			});
		}
		return posi;
	} //处理PC浏览器的情况
	else {
		return [];
	}
}

/* 结束点 */
export function getend(ev) {
	//多指触摸， 返回多个手势位置信息
	if ("changedTouches" in ev && ev.changedTouches) {
		const posi = [];
		let src = null;

		for (let t = 0, len = ev.changedTouches.length; t < len; t++) {
			src = ev.changedTouches[t];
			posi.push({
				x: src.pageX,
				y: src.pageY
			});
		}
		return posi;
	} //处理PC浏览器的情况
	else {
		return [];
	}
}

/* 
	节流
 */
export function throttle(cb, wait = 3000) {
	let previous = 0;
	return (...args) => {
		const now = +new Date();
		if (now - previous > wait) {
			previous = now;
			cb.apply(this, args);
		}
	}
}


/* 
	获取时间戳
 */
export function getTime() {
	return String((new Date()).getTime())
}
