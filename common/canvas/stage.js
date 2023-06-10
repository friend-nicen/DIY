import {
	Image
} from "./shape.js"

import {
	ModelCircle,
	ModelImage
} from "./model.js"

import {
	Remove,
	Rotate,
	Scale
} from "./operator.js"

import load from "@/common/util/load.js"


/* 引入图标 */
import scaleIcon from "@/assets/image/scale.png"
import rotateIcon from "@/assets/image/rotate.png"
import removeIcon from "@/assets/image/remove.png"




/* 
	舞台基类
 */
class StageBase {

	/* 
		构造函数
		@param context2 canvas2d对象
		@param Bounds，画布元素的位置、长宽
		@param canvas 包含requestAnimationFrame方法的对象
	 */
	constructor(config) {

		this.shapes = Object.create(null); //保存所有图形
		this.operator = Object.create(null); //保存所有可操作的图形

		/*
			位置、长宽
		 */
		Object.assign(this, {
			context: null, //canvas上下文对象
			Bounds: null, //画布位置信息
			canvas: null, //画布
			number: null, //图形数量
			off: null //隐藏的画布
		}, config); //配置合并


		this.loop = false; //是否按帧绘制

		this.selected = null; //被选中的图形对象
		this.clicked = null; //被点击的图形对象

		this.isMoving = false; //是否正在触发拖动事件
		this.startOffset = null; //每次初始点击的位置和图形坐标原点的偏差

		this.Big = 3; //画布放大d

		this.Bounds.w = this.Bounds.w * this.Big; //放大
		this.Bounds.h = this.Bounds.h * this.Big; //放大
		this.Bounds.offset = this.Bounds.offset * this.Big; //放大

		/* 更新画布的长宽 */
		this.canvas.width = this.Bounds.w;
		this.canvas.height = this.Bounds.h;


		this.images = {}; //缓存所有图片资源
		this.max = 0; //最大图形数量
		this.initOperator(); //初始化tranform组件

	}



	/* 
		下载指定的图片
	 */
	down(url) {
		return new Promise(resolve => {

			/* 已存在，直接返回 */
			if (url in this.images) {
				resolve(this.images[url]);
				return;
			}

			load.start("加载中..");
			uni.downloadFile({
				url: url, //仅为示例，并非真实的资源
				success: (res) => {
					this.images[url] = res.tempFilePath;
					resolve(res.tempFilePath)
				},
				complete() {
					load.hide(300);
				}
			})
		})
	}


	/*加载指定的图片*/
	getImageInfo(file) {
		return new Promise(resolve => {
			/*获取图片的大小*/
			uni.getImageInfo({
				src: file, // 也可以为本地路径，相对路径或临时文件路径
				success: (res) => {


					let {
						//type,文件类型
						width,
						height,
						//path，文件路径
					} = res;


					/* 
						判断按长度还是按宽度缩放
					 */

					let w, h, x, y; //最终绘制的长宽

					if (width > height) {

						if (width > this.Bounds.w / 2) {
							w = this.Bounds.w * 0.8;
							h = w * (height / width);
						} else {
							w = width;
							h = height;
						}

						/* 如果过高 */
						if (h > this.Bounds.h / 2 * 0.8) {
							h = this.Bounds.h * 0.8;
							w = h * (width / height);
						}


					} else {

						if (height > this.Bounds.h / 2 * 0.8) {
							h = this.Bounds.h * 0.8;
							w = h * (width / height);
						} else {
							w = width;
							h = height;
						}
					}


					/* 
						计算图片坐标
					 */
					x = (this.Bounds.w - w) / 2;
					y = (this.Bounds.h - h) / 2;

					/* 
						创建图片对象
					*/
					let image = this.canvas.createImage();
					image.src = file;
					image.onload = () => {

						/* 
							触发回调
						 */
						resolve({
							image,
							x,
							y,
							w,
							h,
							/* 原大小 */
							width,
							height,
						})

					}
				},
			})
		})
	}

	/*
		获取指定名字的图形
		@param 图形名字
	 */
	getShape(name) {

		/* 判断name是否已经存在 */
		if (name in this.shapes || this.shapes[name]) {
			return this.shapes[name]; //图形对象
		} else {
			return false;
		}

	}


	/* 
		获取排序后的模型
	 */
	getShapes() {

		/*
			将模型放到最后绘制
		 */
		return Object.values(this.shapes).sort((a, b) => {
			if (a.name == "model") {
				return -1;
			} else if (b.sort > a.sort) {
				return 1;
			} else if (b.sort < a.sort) {
				return -1;
			} else {
				return 0;
			}
		})
	}
	/* 
		绘制所有图形
		@return 绘制的图形数量
	 */
	replay(flag = true) {

		let number = 0;

		/* 
			清空画布
			不调用beginPath会产生奇奇怪怪的问题
		 */
		this.context.beginPath();
		this.context.clearRect(0, 0, this.Bounds.w, this.Bounds.h);

		let shapes = this.getShapes(); //获取所有模型

		for (const i of shapes /* .concat(this.operates) */ ) {
			i.draw();

			/* 计数,排除model */
			if (i.name != "model") {
				number++;
			}

		}


		/* 
			是否有更新数量
		 */
		if (number != this.number.count) {

			//console.log(this.max);
			this.max++; //变化次数
			this.number.count = number;
		}

		//console.log(this.number);


		/* 
			判断是否需要按帧绘制
		 */
		if (this.loop && flag) {
			this.canvas.requestAnimationFrame(() => this.replay());
		}



		return number;
	}

	/* 
		删除一个图形
	 */
	remove(shape) {

		/* 
			传递的是命名
		 */

		let name; //图形命名

		if (typeof shape == "string") {
			name = shape; //图形名
		} else {
			/* 如果直接传递的对象 */
			name = shape.name;
		}

		/* 判断name是否已经存在 */
		if (name in this.shapes || this.shapes[name]) {
			delete this.shapes[name]; //删除这个属性代表的图形对象
			return true;
		} else {
			return false;
		}


	}


	/* 重置整个舞台的图形 */
	reset() {

		/* 删除模型以外的数据 */

		for (const i in this.shapes) {
			/* 计数,排除model */
			if (i != "model") {
				delete this.shapes[i];
			}
		}

		this.replay(); //重绘
	}


	/* 
		加载变形组件
	 */
	initOperator() {

		/* 
			创建图片对象
		*/
		let scale = this.canvas.createImage();
		scale.src = scaleIcon;
		scale.onload = () => {
			this.operator['scale'] = new Scale(this, scale)
		}

		let rotate = this.canvas.createImage();
		rotate.src = rotateIcon;
		rotate.onload = () => {
			this.operator['rotate'] = new Rotate(this, rotate)
		}

		let remove = this.canvas.createImage();
		remove.src = removeIcon;
		remove.onload = () => {
			this.operator['remove'] = new Remove(this, remove)
		}

	}


	/* 
		图形被选的变化
	 */
	transform() {

		let operators = Object.values(this.operator); //所有变形组件


		/*  */
		let {
			x,
			y,
			w,
			h
		} = this.clicked;

		for (const i of operators /* .concat(this.operates) */ ) {
			i.draw();
		}

		this.context.strokeStyle = "#ff3300";
		this.context.setLineDash([10, 10]);
		this.context.lineWidth = 4.5 / this.clicked.scaleRadio;
		this.context.lineCap = "round";
		this.context.lineJoin = "round";

		/* 选择框的间隙 */
		let gap = (6 * this.Big) / this.clicked.scaleRadio;
		this.context.strokeRect(x - gap, y - gap, w + gap * 2, h + gap * 2);


	}
}



class Stage extends StageBase {


	/* 
		舞台被触摸。触摸开始
		@param position 一个坐标数组
	 */
	start(position, isTap = false) {


		/* 每次触摸都会重新判断选择*/
		let changed = 0; //判断状态发生改变的图形数量
		this.selected = null; //清空被选中的图形对象

		const shapes = this.getShapes(); //获取所有模型

		/* 
			第一层循环所有坐标
			第二层循环所有图形
		 */
		for (const p of position) {

			let {
				x,
				y
			} = p;

			/* 放大，获取屏幕坐标在画布上的坐标 */
			x = x * this.Big
			y = y * this.Big

			for (const i of shapes) {

				/* 记录起始的被选状态 */
				let start = i.clicked;

				/* 
					如果已经检测到被选图形
					其他图形直接标记为未选
				 */
				if (!this.selected) {

					if (i.isClick(x, y)) {

						//改变加1
						changed++;

						this.clicked = i; //记录被点击的对象
						this.selected = i; //记录被选中的图形对象

						/* 绘制选择状态 */
						if (isTap) {
							i.transform = !i.transform; //选择的标记
						}
					} else {
						/* 取消其他图形的绘制 */
						if (isTap) {
							i.transform = false; //选择的标记
						}
					}
				} else {
					i.isClick(x, y, false); //直接标记未选
					/* 取消其他图形的绘制 */
					if (isTap) {
						i.transform = false; //选择的标记
					}
				}

				/* 判断状态是否发生改变 */
				/* 有被点击的都会+1 */
				if (i.clicked != start) {
					changed++;
				}
			}

			/* 
				如果找到被选中了
				重绘一遍
				就不需要继续判断其他坐标了。
			 */
			if (this.selected) {
				break;
			}

		}

		/* 
			判断有没有被选中的图形，
			如果没有被选中，并且在上一次有被选中的图形，则保持原图的选中状态
		 */
		if (!this.selected && this.clicked) {
			this.clicked.clicked = true; //改变之前被变为false的标记
		}



		/* 
			判断是否要重绘
			有图形状态改变了，才进行重绘
		 */
		if (changed > 0) {

			/* 
				有改变开启帧绘制
				抬起时取消
			 */

			this.loop = true;
			this.replay();
		}

	}


	/* 是否点击了变形组件 */
	isTransform(position) {


		/* 只响应单个手势 */
		if (position.length > 1) {
			return false;
		}

		/* 如果没有图形被选中 */
		if (!this.clicked) return false;


		/* 如果需要变形组件 */
		if (!this.clicked.transform) return false;



		this.selected = null; //重置
		/* 
			第一层循环所有坐标
			第二层循环所有图形
		 */
		for (const p of position) {

			let {
				x,
				y
			} = p;

			/* 放大，获取屏幕坐标在画布上的坐标 */
			x = x * this.Big
			y = y * this.Big

			for (const i of Object.values(this.operator)) {
				/* 
					如果已经检测到被选图形
					其他图形直接标记为未选
				 */
				if (!this.selected) {

					if (i.isClick(x, y)) {
						this.selected = i; //记录被点击的对象
					}
				} else {
					i.isClick(x, y, false); //直接标记未选
				}

				/*
					如果找到被选中了
					重绘一遍
					就不需要继续判断其他坐标了。
				 */
				if (this.selected) {
					this.loop = true;
					this.replay();
					return true;
				}
			}
		}

		return false;
	}


	/* 监测移动事件 */
	move(pos) {
		/* 存在被选对象，才进行拖动 */
		if (this.selected) {

			/* 是否可以移动 */
			if (!this.selected.canMove) return;


			let {
				x,
				y
			} = pos[0];

			/*
				放大
			 */
			x = x * this.Big
			y = y * this.Big



			/* 
				如果没有正在被拖动的对象
				记录初次拖动的偏差值
			 */
			if (!this.isMoving) {

				// 记录触发选中时和触摸点的偏差值
				this.startOffset = {
					x: x - this.selected.x,
					y: y - this.selected.y
				};

				this.isMoving = true;
				//this.replay();
			}

			//触发被选图形的移动事件，无需手动调用，此时还在帧绘制范围内
			this.selected.move([{
				x,
				y
			}], this.startOffset);

		}
	}

	/* 手指抬起释放被选被选，停止拖动事件触发*/
	end() {
		this.loop = false; //关闭帧刷新
		this.isMoving = false; //标记拖动结束
		/* 存在被选对象，才进行重置 */
		if (this.selected) {

			/* 是否可以移动 */
			if (!this.selected.canUp) return;

			this.selected.reset(); //重置缩放状态
		}
	}

	/* 缩放*/
	scale(scale) {
		/* 存在被选对象，才进行缩放 */
		if (this.selected) {

			/* 是否可以缩放 */
			if (!this.selected.canScale) return;

			/* 触发图形的缩放事件 */
			this.selected.scale(scale);
		}
	}

	/* 旋转*/
	rotate(rotate) {
		/* 存在被选对象，才进行旋转 */
		if (this.selected) {

			/* 是否可以旋转 */
			if (!this.selected.canRotate) return;

			/* 触发图形的旋转事件 */
			this.selected.rotate(rotate);
		}
	}


	/* 
		绘制图片
		@param image 图片对象
	 */
	async drawImage(name, image) {

		/* 判断name是否已经存在 */
		if (name in this.shapes || this.shapes[name]) {
			//console.warn(`图形命名${name}已存在！`);
			return;
		}

		/* 加载图片 */
		let param = await this.getImageInfo(image);
		/* 创建图片对象 */
		const imageShape = new Image(name, this, param.image, {
			x: param.x,
			y: param.y,
			w: param.w,
			h: param.h,
			big: this.Big,
			sort: this.number.count + 1
		});

		this.shapes[name] = imageShape;
		this.replay(); //重绘画布

		return imageShape;

	}

	/* 
		绘制模型
	 */
	async setModel(type, url = null) {

		/* 
			如果已有model
			移除已有的model
		 */
		if ("model" in this.shapes) {
			this.remove('model');
		}


		switch (type) {

			/* 
				椭圆模型
			 */
			case 1: {


				let r = this.Bounds.w / 6 * 2.5; //半径
				let x = this.Bounds.w / 2;


				let y = this.Bounds.h / 2;



				let shape = new ModelCircle('model', this, {
					x,
					y,
					r
				})

				this.shapes['model'] = shape;
				this.replay();
				break;

			}

			/* 
				图形
			 */
			case 2: {

				/* 加载图片 */
				let image = await this.down(url); //下载图片
				let param = await this.getImageInfo(image);
				let shape = new ModelImage('model', this, param)

				this.shapes['model'] = shape;
				this.replay(); //绘制
				break;
			}
		}

	}



}

export default Stage;
