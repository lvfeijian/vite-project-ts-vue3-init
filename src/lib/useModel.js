import { computed } from "vue";

export function useModel(props,propsName,emit){
  return computed({
    get() {
      return props[propsName];
    },
    set(value) {
      emit("update:"+ propsName, value);
    }
  });
}
