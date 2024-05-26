<template>
  <e-boxes-root>
    <VBox v-for="ipr in imageParserResult" :rect="ipr.rect" />
  </e-boxes-root>
</template>
<script setup lang="ts">
import VBox from "@/content/components/VBox.vue";
import { ImageParserResult } from "@/content/imageParser";

defineProps<{
  imageParserResult: ImageParserResult[];
}>();
</script>
<style lang="scss">
e-boxes-root {
  display: block;
}
</style>
