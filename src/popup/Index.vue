<template>
  <e-root>
    <e-title>ImagePetaPeta</e-title>
    <label>
      <e-label>有効</e-label>
      <input type="checkbox" v-model="enabled" />
    </label>
  </e-root>
</template>
<script setup lang="ts">
import { sendToBackground } from "@/sendToBackground";
import { onMounted, ref, watch } from "vue";

const enabled = ref(false);
onMounted(async () => {
  enabled.value = await sendToBackground("getEnable");
});
watch(enabled, (value) => {
  sendToBackground("setEnable", value);
});
</script>
<style lang="scss">
html,
body,
#app {
  margin: 0px;
  padding: 0px;
}
label {
  display: flex;
  align-items: center;
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
