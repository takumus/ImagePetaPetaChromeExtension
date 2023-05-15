<template>
  <e-root> hello </e-root>
  <button @click="enable">ENABLE</button>
</template>
<script setup lang="ts">
const a = 1;
function enable() {
  chrome.runtime.sendMessage({
    type: "enable",
  });
}
</script>
