/* 
	图形的基类
	实例变形时会改变图形的实际x,y,w,h大小
 */
export default class Shape {


	/* 
		构造函数
		@name，图形唯一命名
	 */
	constructor(name, stage, config) {

		this.name = name; //图形名称
		this.stage = stage; //舞台对象 
		this.context = stage.context; //canvas上下文
		this.Bounds = stage.Bounds; // canvas位置长宽
		this.type = "shape"; //判断是图形还是模型，模型在导出时不会进行绘制
		this.sort = 0; //排序

		this.canMove = true; //能否移动
		this.canRotate = true; //能否旋转
		this.canScale = true; //能否缩放
		this.canUp = true; //响应鼠标抬起


		this.transform = false; //绘制选择状态

		/* 
			位置、长宽
		 */
		Object.assign(this, {
			rotate_speed: 50, //旋转的速率,放慢的倍数
			minRatate: 0.1, //最小旋转的角度
			minScale: 0, //最小触发缩放的倍率
			rotateRadius: 0, //当前旋转角度
			scaleRadio: 1, //当前放大缩小倍数，
			clicked: false, //当前是否被选中
			selectable: true, //是否能被选中
			drawScale: 2, //放大倍数
		}, config); //配置合并

	}


	/*
		默认的判断是否被点击的方法
		子类可以进行重载
		@flag 为false代表需要标记为未选
	 */
	isClick(click_x, click_y, flag = true) {


		/* 
			如果不可被选中
		 */
		if (!this.selectable) {
			this.clicked = false;
			return false;
		}

		/* 
			是否需要跳过
		 */
		if (!flag) {
			this.clicked = false;
			return true;
		}


		let context = this.context; //上下文


		let {
			x,
			y,
			w,
			h
		} = this; //获取位置、长宽


		/* 
			判断点击是否在图形范围内
		 */
		context.save(); //恢复状态

		context.beginPath();

		const rectCenterPoint = {
			x: x + w / 2,
			y: y + h / 2
		}; // 矩形中心点


		/* 是否需要旋转 */
		if (this.rotateRadius != 0) {
			context.translate(rectCenterPoint.x, rectCenterPoint.y);
			context.rotate(this.rotateRadius); //旋转
			context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
		}

		/* 绘制图片的路径信息，用户判断是否被点击 */
		context.rect(x, y, w, h);
		context.closePath();

		/* 通过路径判断点击状态 */
		this.clicked = context.isPointInPath(click_x, click_y);
		context.restore(); //恢复状态
		return this.clicked;

	}





	/* 
		图形移动
		@param pos，位置数组
		@param point，触摸起始点和原点的偏差值
	 */
	move(pos, point) {



		/*
			多个手指触摸时，不进行拖动
			会导致反复横跳
		 */
		if (pos.length > 1) {
			return false;
		}


		/*
			处理DOM偏差
		 */
		const {
			x,
			y
		} = pos[0];

		this.x = x - point.x;
		this.y = y - point.y;

		return true;
	}


	/* 
		图形缩放
		@param scale 缩放的比例
	 */
	scale(scale) {



		/* 大于最小可缩放 */
		if (Math.abs(scale - this.scaleRadio) > this.minScale) {

			this.scaleRadio = scale;
			return true;

		} else {

			return false;
		}

	}

	/* 
		图形旋转事件

	 */
	rotate(rotate, flag = false) {

		if (flag) {

			/* 记录开始旋转时的角度 */
			if (!this.startRadius) {
				this.startRadius = this.rotateRadius;
			}

			this.rotateRadius = (this.startRadius + rotate);
			return true;

		} else {
			/* 大于最小可转动 */
			if (Math.abs(rotate - this.rotateRadius) > this.minRatate) {
				this.rotateRadius += rotate / this.rotate_speed;;
				return true;
			} else {
				return false;
			}
		}



	}





	/* 
		触摸结束时
		换算为实际大小，重置状态
	 */
	reset() {



		/* 是否需要缩放 */
		/* 如果进行了缩放 */
		if (this.scaleRadio != 1) {


			/* 坐标要以放大前的标准去判断 */
			this.x += (this.w * (1 - this.scaleRadio)) / 2;
			this.y += (this.h * (1 - this.scaleRadio)) / 2;

			this.w = this.w * this.scaleRadio;
			this.h = this.h * this.scaleRadio;

		}

		this.scaleRadio = 1; //重置放大倍数
		this.startRadius = null; //清除初始角度记录

	}



	/**
	 * 
	 * @param {CanvasContext} context canvas上下文
	 * @param {number} x 圆角矩形选区的左上角 x坐标
	 * @param {number} y 圆角矩形选区的左上角 y坐标
	 * @param {number} w 圆角矩形选区的宽度
	 * @param {number} h 圆角矩形选区的高度
	 * @param {number} r 圆角的半径
	 */
	roundRect(context, x, y, w, h, r) {
		// 开始绘制
		//context.beginPath()
		// 因为边缘描边存在锯齿，最好指定使用 transparent 填充
		// 这里是使用 fill 还是 stroke都可以，二选一即可
		//context.setFillStyle('transparent')
		// context.setStrokeStyle('transparent')
		// 左上角
		context.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

		// border-top
		context.moveTo(x + r, y)
		context.lineTo(x + w - r, y)
		context.lineTo(x + w, y + r)
		// 右上角
		context.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

		// border-right
		context.lineTo(x + w, y + h - r)
		context.lineTo(x + w - r, y + h)
		// 右下角
		context.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

		// border-bottom
		context.lineTo(x + r, y + h)
		context.lineTo(x, y + h - r)
		// 左下角
		context.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

		// border-left
		context.lineTo(x, y + r)
		context.lineTo(x + r, y)

		// 这里是使用 fill 还是 stroke都可以，二选一即可，但是需要与上面对应
		//context.fill()
		// context.stroke()
		//context.closePath()
		// 剪切
		//context.clip()
	}



	/* 保存前一刻的状态，更新一个新的状态 */
	save(config) {
		this.snap = {}; //快照
		/* 保存到snap */
		for (let i in config) {
			this.snap //快照 = {};
			[i] = this[i];
		}

		/* 位置、长宽 */
		Object.assign(this, config); //配置合并

	}


	/* 回撤到上一个状态 */
	revoke() {
		if (!this.snap) return; //终止
		/* 位置、长宽 */
		Object.assign(this, this.snap); //配置合并
		delete this.snap; //删除快照
	}

}
