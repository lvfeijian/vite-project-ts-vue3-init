import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
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
  next();
});

router.afterEach((_to) => {
});
export default router;
