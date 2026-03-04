<script setup lang="ts">
import PreviewWrapper from './components/preview/PreviewWrapper.vue';
</script>

<template>
  <div style="background: #f0f0f0; height: 100vh; overflow: auto; padding: 20px; display: flex; justify-content: center;">
    <PreviewWrapper />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
