<template>
  <div>
    <div v-for="item in index">{{ item }}</div>
    <div class="a center">123</div>
    <a href="">link</a>
  </div>
</template>
<script setup lang='ts'>
import { ref } from 'vue'
const index = ref<number[]>([1,2,3])

</script>


<style lang="scss" scoped>
.a{
  width: 500px;
  @include textstyle(20px)
}
</style>