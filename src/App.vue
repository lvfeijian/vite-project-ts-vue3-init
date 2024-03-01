<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import userStore from "@/store/modules/user";
const store = userStore();
console.log('token',store.token);

</script>

<style scoped lang="scss"></style>
