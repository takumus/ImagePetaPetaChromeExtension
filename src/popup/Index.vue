<template>
  <e-root>
    <img :src="icon" />
    <label>
      <VCheckbox v-model:value="enabled" />
    </label>
  </e-root>
</template>
<script setup lang="ts">
import VCheckbox from "imagepetapeta-beta/src/renderer/components/commons/utils/checkbox/VCheckbox.vue";
import { onMounted, ref, watch } from "vue";

import { icon } from "@/icon";
import { sendToBackground } from "@/sendToBackground";

const enabled = ref(false);
onMounted(async () => {
  enabled.value = await sendToBackground("getRightClickEnable");
});
watch(enabled, (value) => {
  sendToBackground("setRightClickEnable", value);
});
</script>
<style lang="scss">
*,
*:before,
*:after {
  box-sizing: border-box;
}
body,
html {
  margin: 0px;
  background-color: var(--color-0);
  padding: 0px;
  min-width: 100px;
  color: var(--color-font);
  font-size: 12px;
  line-height: 12px;
  font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo,
    sans-serif;
  user-select: none;
}
label {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--size-1);
}
e-root {
  display: flex;
  flex-direction: column;
  padding: 8px;
  button {
    width: 128px;
    height: 64px;
  }
}
</style>
<style lang="scss">
@import "imagepetapeta-beta/src/renderer/styles/index.scss";
</style>
