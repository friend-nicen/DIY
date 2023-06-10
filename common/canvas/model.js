/* 
	截图模型类
 */
import Shape from './shape.base'






/* 
	圆形
 */
export class ModelCircle extends Shape {

	/* 
		构造函数
	 */
	constructor(name, stage, config) {
		super(name, stage, config);
		this.selectable = false;
	}

	/* 
		图形绘制
		@param offcanvas 离屏渲染
	 */
	draw() {

		/* 
			离屏还是绘制
		 */
		let context = this.context; //上下文

		let {
			x,
			y,
			r
		} = this;


		let canvas_w, canvas_h; //画布大小

		canvas_w = this.Bounds.w;
		canvas_h = this.Bounds.h;


		/* 保存状态 */
		context.save();
		context.beginPath(); //关闭路径

		if (!this.stage.clip) {
			context.fillStyle = "rgba(236,236,236,0.6)"; //背景色
		} else {
			context.fillStyle = "rgba(255,255,255,1)"; //背景色
		}



		/* 
			内圆外方，画一个蒙版
		 */
		context.arc(x, y, r + 2, 0, 2 * Math.PI); //画圆
		context.rect(0, 0, canvas_w, canvas_h); //画圆
		context.closePath(); //关闭路径
		context.fill("evenodd");
		context.restore(); //恢复状态


		/* 
			是否需要裁剪
		 */
		if (!this.stage.clip) {
			context.beginPath(); //关闭路径
			context.arc(x, y, r + 2, 0, 2 * Math.PI);
			context.closePath(); //关闭路径
			context.stroke();
		}
	}


}




/* 
	圆形
 */
export class ModelImage extends Shape {

	/* 
		构造函数
	 */
	constructor(name, stage, config) {
		super(name, stage, config);
		this.selectable = false;
		this.type = "model"; //标记为模型
	}

	/* 
		图形绘制
		@param offcanvas 离屏渲染
	 */
	draw() {

		/* 
			离屏还是绘制
		 */
		let context = this.context; //上下文

		let {
			x,
			y,
			w,
			h
		} = this;

		let canvas_w, canvas_h; //画布大小
		canvas_w = this.Bounds.w;
		canvas_h = this.Bounds.h;

		/* 保存状态 */
		context.save();



		/* 如果不需要裁剪 */
		context.fillStyle = "rgba(246,246,246,0.6)"; //背景色
		context.fillRect(0, 0, canvas_w, canvas_h); //画圆
		context.globalCompositeOperation = "destination-out"

		context.fillStyle = "rgba(255,255,255,1)"; //背景色
		context.fillRect(x, y, w, h); //画圆
		context.restore(); //恢复状态

		context.drawImage(this.image, x, y, w, h);

	}
}
