import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { join } from "path";
import autoprefixer from "autoprefixer";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const timeStamp = new Date().getTime();
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      "@": join(__dirname, "src")
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
        additionalData:'@use "@/assets/css/style.scss" as *;',
      }
    },
    postcss: {
			plugins: [
				autoprefixer({
					overrideBrowserslist: [
						"Android 4.1",
						"iOS 7.1",
						"Chrome > 31",
						"ff > 31",
						"ie >= 8",
						"last 10 versions", // 所有主流浏览器最近10版本用
					],
          grid: true,
				}),
			],
		},
  },
  // 配置前端服务地址和端口
	server: {
		host: "0.0.0.0", //自定义主机名
		port: 8993, //自定义端口
    proxy: {
			"/api": {
				target: "http://192.168.4.155:8085",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			}
		}
	},
  build: {
    emptyOutDir: true,
		target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
		cssTarget: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    rollupOptions: {
      output: {
        chunkFileNames: `js/[name]-[hash].${timeStamp}.js`,
        entryFileNames: `js/[name]-[hash].${timeStamp}.js`,
        assetFileNames: `[ext]/[name]-[hash].${timeStamp}.[text]`
      }
    }
  },
  envPrefix:"VUE_",//APP_  为自定义开头名
})
