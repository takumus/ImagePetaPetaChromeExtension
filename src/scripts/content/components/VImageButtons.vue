<template>
  <e-image-buttons-root>
    <e-image-button
      class="save"
      v-for="url in urls"
      @click="emit('save', url)"
      :class="{
        [imgInfo[url]?.saveState!]: true,
      }">
      <e-size>
        {{ imgInfo[url]?.type }}({{ imgInfo[url]?.width }}x{{ imgInfo[url]?.height }})
      </e-size>
      <img
        :src="url"
        v-show="imgInfo[url]?.loaded"
        @load="setImageInfo($event.target as HTMLImageElement)" />
    </e-image-button>
  </e-image-buttons-root>
</template>
<script setup lang="ts">
import { ImageInfo, ImageInfoSaveState } from "@/scripts/content/components/imageInfo";
import { getImageExtension } from "@/scripts/content/getImageExtension";
import { ImageParserResult } from "@/scripts/content/imageParser";

const props = defineProps<{
  urls: string[];
  imgInfo: { [url: string]: ImageInfo | undefined };
}>();
const emit = defineEmits<{
  (e: "save", url: string): void;
  (e: "updateLoadedImageInfo", element: HTMLImageElement): void;
}>();
function setImageInfo(element: HTMLImageElement) {
  const info = props.imgInfo[element.src];
  if (info !== undefined) {
    Object.assign<ImageInfo, Partial<ImageInfo>>(info, {
      width: element.naturalWidth,
      height: element.naturalHeight,
      loaded: true,
      type: getImageExtension(element.src) ?? "unknown",
    });
  }
}
</script>
<style lang="scss">
e-image-buttons-root {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--px-2);
  padding-right: var(--px-2);
  width: 100%;
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  pointer-events: auto !important;
  > e-image-button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: var(--px-1);
    cursor: pointer;
    border-radius: var(--rounded);
    padding: var(--px-2);
    width: 100%;
    max-height: 300px;
    font-weight: bold;
    > e-size {
      color: var(--color-font);
    }
    &:hover {
      background-color: var(--color-2);
    }
    &:active {
      background-color: var(--color-accent-1);
    }
    &.saved {
      opacity: 0.5;
    }
    &.save {
      > img {
        display: block;
        border-radius: var(--rounded);
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAADNJREFUOI1jvHz58n8GPEBHRwefNAMTXlkiwKgBg8EAxv///+NNB1euXKGtC0YNGAwGAAAfVwqTIQ+HUgAAAABJRU5ErkJggg==);
        max-width: 100%;
        height: auto;
        overflow: hidden;
        pointer-events: none;
      }
    }
  }
}
</style>
