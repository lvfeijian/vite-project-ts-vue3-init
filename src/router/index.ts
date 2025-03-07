import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
// import userStore from "@/store/modules/user";
// const store = userStore();
// https://router.vuejs.org/zh/guide/advanced/lazy-loading.html
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Index",
    component: () => import("../views/index.vue")
  },
  {
    path: "/gltf",
    name: "Gltf",
    component: () => import("../views/loadingGltf.vue")
  },
  {
    path: "/modifyGltfPosition",
    name: "modifyGltfPosition",
    component: () => import("../views/modifyGltfPosition.vue")
  },
  {
    path: "/pointCloudAndBIm",
    name: "pointCloudAndBIm",
    component: () => import("../views/pointCloudAndBIm.vue")
  },
  {
    path: "/loading3dTiles",
    name: "loading3dTiles",
    component: () => import("../views/loading3dTiles.vue")
  },
  {
    path: "/translationController",
    name: "translationController",
    component: () => import("../views/translationController.vue")
  },
  {
    path: "/demo",
    name: "demo",
    component: () => import("../views/demo.vue")
  },
  {
    path: "/bimHideSelect",
    name: "bimHideSelect",
    component: () => import("../views/bimHideSelect.vue")
  },
  {
    path: "/bim",
    name: "bim",
    component: () => import("../views/bim/index.vue")
  },
  {
    path: "/clipModel",
    name: "clipModel",
    component: () => import("../views/bim/clipModel.vue")
  },
  {
    path: "/test",
    name: "test",
    component: () => import("../views/test.vue")
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes
});
router.beforeEach(async (_to, _from, next) => {
  next();
});

router.afterEach((_to) => {});
export default router;
