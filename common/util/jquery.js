/* 获取元素 */
export default function $(match, obj = false) {

	/* 获取元素的位置和宽高 */
	const query = uni.createSelectorQuery(); //查询对象

	/* 自定义组件 */
	if (obj) {
		query.in(obj);
	}


	/* 对象属性 */
	const jquery = {
		// 元素选择器
		match: match,
		//节点
		node: null,
		// 元素位置信息
		bound: null,
		//页面滚动位置
		offsetTop: null
	}

	jquery.node = query.select(match); //设置节点信息

	/* 获取元素位置和大小 */
	jquery.position = async () => {

		/* 结果已经存在 */
		if (jquery.bound !== null) {
			return jquery.bound;
		}

		await new Promise(resolve => {

			jquery.node.boundingClientRect(function(res) {
				jquery.bound = res;
				resolve();
			});

			query.exec(); //执行
		});

		return jquery.bound;

	}


	return jquery;
}
