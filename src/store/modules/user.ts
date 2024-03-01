import { defineStore } from "pinia";
import type { State } from "./type";
const userStore = defineStore("user", {
  state: (): State => {
    return {
      token: ""
    };
  },
  getters: {
    // doubleCount: (state) => {
    //   return state.count * 2
    // }
  },
  actions: {
    // increment() {
    //   this.count++
    // },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        paths: ["token"],
        storage: localStorage
      }
    ]
  }
});
export default userStore;
