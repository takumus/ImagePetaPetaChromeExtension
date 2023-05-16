<template>
  <e-root>ImagePetaPeta</e-root>
</template>
<script setup lang="ts">
import { sendToBackground } from "@/sendToBackground";
</script>
<style lang="scss">
html,
body,
#app {
  margin: 0px;
  padding: 0px;
}
e-root {
  display: flex;
  padding: 8px;
  button {
    width: 128px;
    height: 64px;
  }
}
</style>
