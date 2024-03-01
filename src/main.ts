import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import "@/assets/css/reset.scss"; // 普通的scss文件
const app = createApp(App);
app.use(router);
app.mount("#app");
