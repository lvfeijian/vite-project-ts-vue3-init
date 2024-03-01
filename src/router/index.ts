import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import userStore from "@/store/modules/user";
const store = userStore();
// https://router.vuejs.org/zh/guide/advanced/lazy-loading.html
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Index",
    component: () => import('../views/index.vue')
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach(async (_to, _from, next) => {
  // if (to.name === "Login" || to.name === "404") {
  //   return next();
  // }
  // if (store.token) {
  //   next();
  // } else {
  //   next("/login");
  // }
  next();
});

router.afterEach((_to) => {
});
export default router;
