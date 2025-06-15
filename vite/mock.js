/* eslint-disable */

import * as http from 'http'
import * as os from 'os'
import api from "../src/service/api";
import {handleRequest} from "./server";


/**
 * 获取所有局域网IP地址
 */
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const host of interfaces[name]) {
            if (host.family === 'IPv4') {
                addresses.push(host.address);
            }
        }
    }
    return addresses;
}

/**
 * mock列表
 */
const mocks = [
    {
        api: api.category,
        data: {
            list: [
                {id: 1, name: '推荐'},
                {id: 2, name: '活动'},
                {id: 3, name: '离谱'},
                {id: 4, name: '情侣'}
            ]
        }
    },
    /* 商品接口 */
    {
        api: api.goods_cat,
        data: {
            list: [
                {
                    id: 1,
                    name: '家居用品',
                    items: [
                        {
                            id: 101,
                            name: '抱枕',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        },
                        {
                            id: 102,
                            name: '床品',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp'
                        },
                        {
                            id: 103,
                            name: '装饰画',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        },
                        {
                            id: 104,
                            name: '抱枕',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp'
                        },
                        {
                            id: 105,
                            name: '床品',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        },
                        {
                            id: 106,
                            name: '装饰画',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        }
                    ]
                },
                {
                    id: 2,
                    name: '日常用品',
                    items: [
                        {
                            id: 201,
                            name: '马克杯',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        },
                        {
                            id: 202,
                            name: '餐具',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        },
                        {
                            id: 203,
                            name: '便签本',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        }
                    ]
                },
                {
                    id: 3,
                    name: '办公出行',
                    items: [
                        {
                            id: 301,
                            name: '工牌',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        },
                        {
                            id: 302,
                            name: '手机壳',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp'
                        },
                        {
                            id: 303,
                            name: '钥匙扣',
                            image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp'
                        }
                    ]
                }
            ]
        }
    },
    /* 商品列表接口 */
    /* 商品列表接口 */
    {
        api: api.list,
        data: {
            list: [
                {
                    id: 1,
                    name: '男士平角内裤（多区域设计）',
                    image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp',
                    price: 45.55
                },
                {
                    id: 2,
                    name: '吉他拨片（6片装）',
                    image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp',
                    price: 25.99
                },
                {
                    id: 3,
                    name: '情侣马克杯套装',
                    image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp',
                    price: 69.90
                },
                {
                    id: 4,
                    name: '创意抱枕',
                    image: 'https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp',
                    price: 39.90
                }
            ]
        }
    },
    /* 商品列表接口 */
    {
        api: api.goods,
        data: {
            list: [
                {
                    id: 1,
                    name: "暖暖抱枕",
                    image: "https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp",
                    price: 99
                },
                {
                    id: 2,
                    name: "温馨床品套装温馨床品套装温馨床品套装",
                    image: "https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp",
                    price: 299
                },
                {
                    id: 3,
                    name: "创意装饰画创意装饰画创意装饰画",
                    image: "https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp",
                    price: 199
                },
                {
                    id: 4,
                    name: "个性马克杯个性马克杯个性马克杯",
                    image: "https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp",
                    price: 59
                },
                {
                    id: 5,
                    name: "精美餐具套装精美餐具套装精美餐具套装",
                    image: "https://nicen.cn/wp-content/uploads/replace/2025/03/21/9b23241cf5fb2dd30d362177ababafa3.webp",
                    price: 399
                },
                {
                    id: 6,
                    name: "便携便签本便携便签本便携便签本",
                    image: "https://nicen.cn/wp-content/uploads/replace/2025/03/21/34921890c413b043b7d5ab915fa69400.webp",
                    price: 29
                }
            ]
        }
    },

    /* 用户接口 */
    {
        api: api.login,
        data: {
            user: {
                token: "ejdsdd",
                nickname: "造物主55597"
            }
        }
    },
    {
        api: api.profile,
        data: {
            user: {
                id: 55597,
                nickname: "造物主55597",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
            }
        }
    },
    {
        api: api.works,
        data: {
            list: [
                {
                    id: 1,
                    name: "我的作品1",
                    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38",
                    createTime: "2024-01-20 12:00:00"
                }
            ]
        }
    }
]


/**
 * 启动mock服务器
 */
export default function () {
    /* http服务器 */
    const server = http.createServer(handleRequest(mocks));
    const port = 5723;

    /* 监听端口 */
    server.listen(port, '0.0.0.0', () => {

        console.log('Mock服务已启动，可通过以下地址访问：');

        /* 输出所有局域网地址 */
        const localIPs = getLocalIPs();

        localIPs.forEach(ip => {
            console.log(`局域网地址：http://${ip}:${port}`);
        });
    });
}

