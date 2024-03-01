import Axios from "axios"; // 引入axios
import { SUCCESS_CODE } from "./constants";
import router from "@/router";
import type {AxiosResponse} from 'axios'
console.log(import.meta.env.VUE_APP_API_URL);

export const axios = Axios.create({
  baseURL: import.meta.env.VUE_APP_API_URL,
  timeout: 10000
});

// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

import userStore from "@/store/modules/user";
import { ElMessage } from "element-plus";
const store = userStore();

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    const token = store.token;
    token && (config.headers.Authorization = `Bearer ${token}`);
    return config;
  },
  (error) => {
    return console.error(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    
    const { code, message } = response.data;

    if (SUCCESS_CODE.has(code)) return formatResponse(response);
    if (code === undefined) return response;

    ElMessage.error(message);
    return Promise.reject(response);
  },
  (error) => {
    const { response } = error;
    const message = response?.data?.message || response?.data?.error || "网络错误，请稍后重试！";

    ElMessage.error(message);
    // jwt过期
    if (response?.data?.status === 401) {
      router.replace("/login");
    }
    // if (response?.data.status === 403) {
    // }
    return Promise.reject(error);
  }
);

/**
 * 格式化响应结果
 * @param {*} response
 * @returns
 */

async function formatResponse(response: AxiosResponse<any, any>) {
  
  // let { code, message, data } = response.data;
  
  // response.data = data;
  // response.code = code;
  // response.message = message;
  return Promise.resolve(response.data);
}
