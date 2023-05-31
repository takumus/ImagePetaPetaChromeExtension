<template>
  <e-root>
    <e-title><img :src="icon" /></e-title>
    <label>
      <VCheckbox v-model:value="enabled" />
    </label>
  </e-root>
</template>
<script setup lang="ts">
import { icon } from "@/scripts/icon";
import { sendToBackground } from "@/sendToBackground";
import VCheckbox from "imagepetapeta-beta/src/renderer/components/commons/utils/checkbox/VCheckbox.vue";
import { onMounted, ref, watch } from "vue";

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
  user-select: none;
  margin: 0px;
  padding: 0px;
  font-size: 12px;
  line-height: 12px;
  font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN",
    "Hiragino Sans", Meiryo, sans-serif;
  background-color: var(--color-0);
  color: var(--color-font);
}
label {
  display: flex;
  align-items: center;
  gap: var(--size-1);
  justify-content: center;
}
e-root {
  display: flex;
  padding: 8px;
  flex-direction: column;
  button {
    width: 128px;
    height: 64px;
  }
}
</style>
<style lang="scss">
@import "imagepetapeta-beta/src/renderer/styles/index.scss";
</style>
