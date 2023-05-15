<template>
  <e-root> hello </e-root>
  <button @click="enable">ENABLE</button>
</template>
<script setup lang="ts">
import { sendToBackground } from "../sendToBackground";

const a = 1;
function enable() {
  sendToBackground("enable");
}
</script>
