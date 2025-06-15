import {defineConfig} from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import * as path from "path";
import start_______mockServer from './vite/mock';

/* 启动mock服务 */
start_______mockServer();

/* 判断环境 */
const dev = process.env.NODE_ENV === 'development';

/* vite配置 */
export default defineConfig({
    plugins: [
        uni()
    ],
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: !dev,
            },
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `  
                     @import "@/theme/common.scss";
                 `
            }
        }
    },
    server: {
        hmr: {
            path: "/ws"
        }
    },
    resolve: {
        alias: {
            // eslint-disable-next-line no-undef
            '@': path.join(__dirname, 'src')
        }
    }
})
