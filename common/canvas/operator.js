/* 
	截图模型类
 */
import load from '../util/load';
import Shape from './shape.base'


/* 获取两个点的向量 */
function getVector(p1, p2) {
	let x = Math.round(p1.x - p2.x)
	let y = Math.round(p1.y - p2.y);
	return {
		x,
		y
	};
}



/* 获取某个向量的模 */
function getLength(v1) {
	return Math.sqrt(v1.x * v1.x + v1.y * v1.y);
}

/* 获取向量的夹角 */
// 判断方向，顺时针为 1 ，逆时针为 -1;
function getAngle(v1, v2) {

	let direction = v1.x * v2.y - v2.x * v1.y > 0 ? 1 : -1;
	let len1 = getLength(v1);
	let len2 = getLength(v2);
	let mr = len1 * len2;
	let dot, r;

	if (mr === 0) return 0;

	// 通过数量积公式可以推导出:
	// cos =(x1 *x2 +y1*y2)/(lal * Ib1);

	dot = v1.x * v2.x + v1.y * v2.y;
	r = dot / mr;

	if (r > 1) r = 1;
	if (r < -1) r = -1;

	// 解值并结合方向转化为角度值;
	// 180 / Math.PI
	return Math.acos(r) * direction;

}

/* 旋转 */
export class Rotate extends Shape {

	/* 
		构造函数
	 */
	constructor(stage, image) {

		super("Rotate", stage, {
			image
		});

		this.canRotate = false; //禁用旋转
		this.canScale = false; //禁用缩放
		this.type = "Rotate"; //操作
	}

	/* 
		图形绘制
		@param offcanvas 离屏渲染
	 */
	draw() {

		/* 如果没有被选中的 */
		if (!this.stage.clicked) return;
		let context = this.context; //上下文

		let {
			x,
			y,
			w,
			h
		} = this.stage.clicked;



		let gap = (6 * this.stage.Big) / this.stage.clicked.scaleRadio;

		/* 调整间隙 */
		x = x - gap;
		y = y - gap;
		w = w + gap * 2;
		h = h + gap * 2;

		let v = (32 * this.stage.Big) / this.stage.clicked.scaleRadio; //大小

		context.drawImage(this.image, x + w - (v / 2), y - (v / 2), v, v);

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
		} = this.stage.clicked; //获取位置、长宽


		/* 
			判断点击是否在图形范围内
		 */
		context.save(); //恢复状态
		context.beginPath();

		let rectCenterPoint = {
			x: x + w / 2,
			y: y + h / 2
		}; // 矩形中心点


		/* 是否需要旋转 */
		if (this.stage.clicked.rotateRadius != 0) {
			context.translate(rectCenterPoint.x, rectCenterPoint.y);
			context.rotate(this.stage.clicked.rotateRadius); //旋转
			context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
		}



		/* 绘制图形的路径  */
		let gap = (6 * this.stage.Big) / this.stage.clicked.scaleRadio;

		/* 调整间隙 */
		x = x - gap;
		y = y - gap;
		w = w + gap * 2;
		h = h + gap * 2;

		let v = (50 * this.stage.Big) / this.stage.clicked.scaleRadio; //大小

		/* 绘制图片的路径信息，用户判断是否被点击 */
		context.rect(x + w - (v / 2), y - (v / 2), v, v);
		context.closePath();

		/* 通过路径判断点击状态 */
		this.clicked = context.isPointInPath(click_x, click_y);
		context.restore(); //恢复状态
		return this.clicked;

	}


	/* 移动事件 */
	move(pos) {

		if (!this.startPoint) {
			this.startPoint = pos[0];
		}

		let {
			x,
			y,
			w,
			h
		} = this.stage.clicked; //获取位置、长宽


		let rectCenterPoint = {
			x: x + w / 2,
			y: y + h / 2
		}; // 矩形中心点

		let angle = getAngle(getVector(rectCenterPoint, this.startPoint), getVector(rectCenterPoint, pos[0]));
		this.stage.clicked.rotate(angle, true); //旋转
	}



	/* 重置 */
	reset() {
		this.startPoint = null;
		this.stage.clicked.reset();
	}


}






/* 旋转 */
export class Scale extends Shape {

	/* 
		构造函数
	 */
	constructor(stage, image) {

		super("Scale", stage, {
			image
		});

		this.canRotate = false; //禁用旋转
		this.canScale = false; //禁用缩放
		this.type = "Scale"; //操作
	}

	/* 
		图形绘制
		@param offcanvas 离屏渲染
	 */
	draw() {

		/* 如果没有被选中的 */
		if (!this.stage.clicked) return;
		let context = this.context; //上下文

		let {
			x,
			y,
			w,
			h
		} = this.stage.clicked;


		let gap = (6 * this.stage.Big) / this.stage.clicked.scaleRadio;

		/* 调整间隙 */
		x = x - gap;
		y = y - gap;
		w = w + gap * 2;
		h = h + gap * 2;

		let v = (32 * this.stage.Big) / this.stage.clicked.scaleRadio; //大小

		context.drawImage(this.image, x + w - (v / 2), y + h - (v / 2), v, v);

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
		} = this.stage.clicked; //获取位置、长宽


		/* 
			判断点击是否在图形范围内
		 */
		context.save(); //恢复状态
		context.beginPath();

		let rectCenterPoint = {
			x: x + w / 2,
			y: y + h / 2
		}; // 矩形中心点


		/* 是否需要旋转 */
		if (this.stage.clicked.rotateRadius != 0) {
			context.translate(rectCenterPoint.x, rectCenterPoint.y);
			context.rotate(this.stage.clicked.rotateRadius); //旋转
			context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
		}



		/* 绘制图形的路径  */
		let gap = (6 * this.stage.Big) / this.stage.clicked.scaleRadio;

		/* 调整间隙 */
		x = x - gap;
		y = y - gap;
		w = w + gap * 2;
		h = h + gap * 2;

		let v = (50 * this.stage.Big) / this.stage.clicked.scaleRadio; //大小

		/* 绘制图片的路径信息，用户判断是否被点击 */
		context.rect(x + w - (v / 2), y + h - (v / 2), v, v);
		context.closePath();

		/* 通过路径判断点击状态 */
		this.clicked = context.isPointInPath(click_x, click_y);
		context.restore(); //恢复状态
		return this.clicked;

	}



	/* 移动事件 */
	move(pos) {


		let {
			x,
			y,
			w,
			h
		} = this.stage.clicked; //获取位置、长宽



		let rectCenterPoint = {
			x: x + w / 2,
			y: y + h / 2
		}; // 矩形中心点

		if (!this.startScale) {
			this.startScale = getLength(getVector(rectCenterPoint, pos[0]));
		}

		let current = getLength(getVector(rectCenterPoint, pos[0]));
		this.stage.clicked.scale(current / this.startScale); //缩放
	}


	/* 重置 */
	reset() {
		this.startScale = null;
		this.stage.clicked.reset();
	}



}




/* 旋转 */
export class Remove extends Shape {

	/* 
		构造函数
	 */
	constructor(stage, image) {

		super("Remove", stage, {
			image
		});

		this.canRotate = false; //禁用旋转
		this.canScale = false; //禁用缩放
		this.type = "Remove"; //操作
	}

	/* 
		图形绘制
		@param offcanvas 离屏渲染
	 */
	draw() {

		/* 如果没有被选中的 */
		if (!this.stage.clicked) return;
		let context = this.context; //上下文

		let {
			x,
			y,
			w,
			h
		} = this.stage.clicked;

		let gap = (6 * this.stage.Big) / this.stage.clicked.scaleRadio;

		/* 调整间隙 */
		x = x - gap;
		y = y - gap;
		w = w + gap * 2;
		h = h + gap * 2;

		let v = (32 * this.stage.Big) / this.stage.clicked.scaleRadio; //大小

		context.drawImage(this.image, x - (v / 2), y - (v / 2), v, v);

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
		} = this.stage.clicked; //获取位置、长宽


		/* 
			判断点击是否在图形范围内
		 */
		context.save(); //恢复状态
		context.beginPath();

		let rectCenterPoint = {
			x: x + w / 2,
			y: y + h / 2
		}; // 矩形中心点


		/* 是否需要旋转 */
		if (this.stage.clicked.rotateRadius != 0) {
			context.translate(rectCenterPoint.x, rectCenterPoint.y);
			context.rotate(this.stage.clicked.rotateRadius); //旋转
			context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
		}



		/* 绘制图形的路径  */
		let gap = (6 * this.stage.Big) / this.stage.clicked.scaleRadio;

		/* 调整间隙 */
		x = x - gap;
		y = y - gap;
		w = w + gap * 2;
		h = h + gap * 2;

		let v = (50 * this.stage.Big) / this.stage.clicked.scaleRadio; //大小

		/* 绘制图片的路径信息，用户判断是否被点击 */
		context.rect(x - (v / 2), y - (v / 2), v, v);
		context.closePath();

		/* 通过路径判断点击状态 */
		this.clicked = context.isPointInPath(click_x, click_y);
		context.restore(); //恢复状态

		/* 被选中 */
		let that = this; //实例对象

		if (this.clicked) {
			load.confirm("确定要删除这个素材吗", () => {
				that.stage.remove(that.stage.clicked);
				that.stage.clicked = null; //移除
				that.stage.replay();
			})
		}


		return this.clicked;

	}

}
