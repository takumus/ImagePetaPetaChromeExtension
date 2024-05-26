<template>
  <e-boxes-root>
    <e-box
      v-for="ipr in imageParserResult"
      :style="{
        top: ipr.rect.y + 'px',
        left: ipr.rect.x + 'px',
        width: ipr.rect.width + 'px',
        height: ipr.rect.height + 'px',
      }"></e-box>
  </e-boxes-root>
</template>
<script setup lang="ts">
import { ImageParserResult } from "@/scripts/content/imageParser";

defineProps<{
  imageParserResult: ImageParserResult[];
}>();
</script>
<style lang="scss">
e-boxes-root > e-box {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 2147483646;
  margin: 0px;
  box-shadow:
    0px 0px 0px 2px #cccccc,
    0px 0px 0px 2px #cccccc inset,
    0px 0px 4px 3px rgba(0, 0, 0, 0.4),
    0px 0px 4px 3px rgba(0, 0, 0, 0.4) inset;
  border: solid 2px #333333;
  border-radius: var(--rounded);
  padding: 0px;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
