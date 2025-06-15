import url from "url";

/**
 * 参数包装
 * @param req
 * @param res
 */
function wrap(req, res) {

    /* 输出json数据 */
    res.reply = function (code = 1, errMsg, data = []) {

        /* 响应头 */
        this.writeHead(200, {'Content-Type': 'application/json;charset=utf8'});

        /* 输出数据 */
        this.end(JSON.stringify({
            code: code,
            data: data,
            errMsg: errMsg
        }));

    }

    // 返回 Promise 以处理异步操作
    return new Promise((resolve) => {

        const method = req.method.toLowerCase();

        let data = null;

        if (method === 'get') {
            // 解析 URL 查询字符串
            const parsedUrl = url.parse(req.url, true);
            data = parsedUrl.query;
            resolve(data);
        } else if (method === 'post') {
            // 用于存储 POST 数据
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString(); // 将数据转换为字符串
            });

            req.on('end', () => {
                if (req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
                    // 解析 x-www-form-urlencoded 类型的 POST 数据
                    data = querystring.parse(body);
                } else if (req.headers['content-type'].includes('application/json')) {
                    // 解析 JSON 类型的 POST 数据
                    data = JSON.parse(body);
                }

                /* 完毕 */
                resolve(data);

            });

        }


    });
}

/**
 * 处理请求
 */
export function handleRequest(mocks) {

    return async (req, res) => {

        try {

            /* 包装 */
            await wrap(req, res);

            /* 包装请求对象 */
            const parsedUrl = url.parse(req.url, true);
            const path = parsedUrl.pathname; //请求路径

            /* 匹配接口 */
            const match = mocks.find(mock => {
                if (mock.api.indexOf(path) > -1) {
                    res.reply(1, 'ok！', mock.data);
                    return true;
                }
            });

            if (!match) {
                return res.reply(0, "404");
            }
        } catch (e) {
            console.log(e)
        } finally {
            res.end();
        }
    }

}
