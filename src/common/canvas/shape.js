import Shape from './shape.base'




/* 
	图片
 */
export class Image extends Shape {

	image; //图片对象

	/*
		构造函数
		@name，图形唯一命名
	 */
	constructor(name, stage, image, config) {
		super(name, stage, config);
		this.image = image;
	}
	/* 
		图形绘制
		@param flag 绘制选择状态
	 */
	draw(flag = true) {

		/*
			判断图片对象是否存在
		 */
		if (!this.image) return;

		/* 离屏还是绘制 */
		let context = this.context; //上下文


		let {
			x,
			y,
			w,
			h
		} = this;


		/* 保存状态 */
		context.save();

		let rectCenterPoint = {
			x: x + w / 2,
			y: y + h / 2
		}; // 矩形中心点


		/* 是否需要旋转 */
		if (this.rotateRadius != 0) {
			context.translate(rectCenterPoint.x, rectCenterPoint.y);
			context.rotate(this.rotateRadius); //旋转
			context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
		}




		/* 是否需要缩放 */
		if (this.scaleRadio != 1) {
			context.translate(
				rectCenterPoint.x * (1 - this.scaleRadio),
				rectCenterPoint.y * (1 - this.scaleRadio));
			context.scale(this.scaleRadio, this.scaleRadio);
		}


		/* 浮于上方 */
		context.globalCompositeOperation = "destination-over"


		// 如果被选中则绘制被选中的效果
		// 离屏渲染不绘制
		// 是否选择、裁剪、离屏
		// 选择状态的反选
		if (this.clicked && flag && this.transform) {
			this.stage.transform(); //绘制选中状态
		}

		context.drawImage(this.image, x, y, w, h);
		context.restore(); //恢复状态

	}
}
