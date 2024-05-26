<template>
  <e-root v-if="show">
    <t-menu
      :style="{
        left: menuPosition.x + 'px',
        top: menuPosition.y + 'px',
      }">
      <t-buttons>
        <t-button class="save" v-for="url in urls" @click="save(url)">
          <t-size>{{ imgInfo[url]?.width }}x{{ imgInfo[url]?.height }}</t-size>
          <img
            :src="url"
            v-show="imgInfo[url]?.loaded"
            @load="
              (t) => {
                const img = t.target as HTMLImageElement;
                setSize(url, { width: img.naturalWidth, height: img.naturalHeight, loaded: true });
              }
            " />
        </t-button>
      </t-buttons>
    </t-menu>
    <t-boxes>
      <t-box
        v-for="ipr in currentImageParseResult"
        :style="{
          top: ipr.rect.y + 'px',
          left: ipr.rect.x + 'px',
          width: ipr.rect.width + 'px',
          height: ipr.rect.height + 'px',
        }"></t-box>
    </t-boxes>
    <t-background></t-background>
  </e-root>
</template>
<script setup lang="ts">
import { urlDrivers } from "./drivers";
import { onMounted, ref } from "vue";

import { getData, ImageParserResult } from "@/scripts/content/imageParser";
import { icon } from "@/scripts/icon";

import { MessagesToContent } from "@/messages";
import { sendToBackground } from "@/sendToBackground";

type ImageInfo = { width: number; height: number; loaded: boolean };
const urls = ref<string[]>([]);
const imgInfo = ref<{ [url: string]: ImageInfo | undefined }>({});
const show = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const mousePosition = ref({ x: 0, y: 0 });
let currentImageParseResult = ref<ImageParserResult[]>([]);
async function save(url: string) {
  let urls = [url];
  console.log(urls);
  await sendToBackground("orderSave", urls, window.location.origin, window.navigator.userAgent, {
    name: document.title,
    note: location.href,
  });
  const result = await sendToBackground("save");
  console.log(result);
}
function setSize(url: string, info: ImageInfo) {
  if (imgInfo.value[url]) {
    imgInfo.value[url] = info;
  }
}
async function select(x: number, y: number) {
  menuPosition.value = { x, y };
  currentImageParseResult.value = getData({ x, y }).map((d) => {
    d.urls = urlDrivers.reduce<string[]>((urls, driver) => driver(urls), d.urls);
    return d;
  });
  urls.value = Array.from(
    new Set(currentImageParseResult.value.reduce<string[]>((p, c) => [...c.urls, ...p], [])),
  );
  imgInfo.value = urls.value.reduce<{ [url: string]: ImageInfo }>((p, c) => {
    return {
      [c]: imgInfo.value[c] ?? { width: 0, height: 0, loaded: false },
      ...p,
    };
  }, {});
  console.log(currentImageParseResult);
  show.value = true;
  updateBoxes();
}
function updateBoxes(updateRect = false) {
  if (updateRect) {
    currentImageParseResult.value.forEach((r) => {
      r.rect = r.element.getBoundingClientRect();
    });
  }
}
onMounted(() => {
  let enabledRightClick = false;
  const ub = () => {
    updateBoxes(true);
    requestAnimationFrame(ub);
  };
  ub();
  setInterval(async () => (enabledRightClick = await sendToBackground("getRightClickEnable")), 100);
  // overlay.captureButton.addEventListener("click", async () => {
  //   overlay.setStatus("saving");
  //   const domRect = clickedElement?.rect;
  //   overlay.hide();
  //   clickedElement = undefined;
  //   await new Promise((res) => {
  //     setTimeout(res, 1000 / 30);
  //   });
  //   const rect = (() => {
  //     if (domRect === undefined) {
  //       return undefined;
  //     }
  //     const normalizedRect = {
  //       width: domRect.width / window.innerWidth,
  //       height: domRect.height / window.innerHeight,
  //       x: domRect.x / window.innerWidth,
  //       y: domRect.y / window.innerHeight,
  //     };
  //     const x = Math.max(Math.min(normalizedRect.x, 1), 0);
  //     const y = Math.max(Math.min(normalizedRect.y, 1), 0);
  //     const width = Math.max(
  //       Math.min(
  //         normalizedRect.width - (normalizedRect.x < 0 ? -normalizedRect.x : 0),
  //         1 - x
  //       ),
  //       0
  //     );
  //     const height = Math.max(
  //       Math.min(
  //         normalizedRect.height -
  //           (normalizedRect.y < 0 ? -normalizedRect.y : 0),
  //         1 - y
  //       ),
  //       0
  //     );
  //     return {
  //       x,
  //       y,
  //       width,
  //       height,
  //     };
  //   })();
  //   const result = await sendToBackground("capture", location.href, rect);
  //   if (result) {
  //     overlay.setStatus("saved");
  //   } else {
  //     overlay.setStatus("failed");
  //   }
  // });
  window.document.addEventListener(
    "contextmenu",
    (event) => {
      if (!enabledRightClick) {
        return;
      }
      event.preventDefault();
      select(event.clientX, event.clientY);
    },
    true,
  );
  window.document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target === (window as any)["impt-ui-element-root"]) {
        event.preventDefault();
        return;
      }
      show.value = false;
    },
    true,
  );
  window.document.addEventListener("mousemove", (event) => {
    mousePosition.value.x = event.clientX;
    mousePosition.value.y = event.clientY;
  });
  const messageFunctions: MessagesToContent = {
    openMenu: async () => {
      select(mousePosition.value.x, mousePosition.value.y);
    },
  };
  chrome.runtime.onMessage.addListener((request, _, response) => {
    (messageFunctions as any)[request.type](...request.args).then((res: any) => {
      response({
        value: res,
      });
    });
    return true;
  });
});
</script>
<style lang="scss">
*,
*:before,
*:after {
  all: initial;
  box-sizing: border-box;
  font-family: "Helvetica Neue", Helvetica, Arial, YuGothic, "Yu Gothic", 游ゴシック体, 游ゴシック,
    "ヒラギノ角ゴ ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ Pro W3",
    "Hiragino Kaku Gothic Pro", メイリオ, Meiryo, "MS ゴシック", "MS Gothic", sans-serif;
}
t-boxes > t-box {
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
  border-radius: 8px;
  padding: 0px;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
t-background {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 2147483645;
  background-color: rgba(0, 0, 0, 0.7);
  width: 100%;
  height: 100%;
  pointer-events: none;
}
t-menu {
  display: flex;
  position: fixed;
  flex-direction: column;
  align-items: center;
  z-index: 2147483647;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  background-color: #ffffff;
  padding: 8px;
  min-width: 20%;
  max-width: 30%;
  max-height: 50%;
  pointer-events: auto;
  > t-buttons {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    padding-right: 8px;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    pointer-events: auto !important;
    > t-button {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      border-radius: 4px;
      padding: 8px;
      width: 100%;
      max-height: 300px;
      color: #333333;
      font-weight: bold;
      font-size: 18px;
      &:hover {
        background-color: #dedede;
      }
      &.save {
        > img {
          display: block;
          border-radius: 4px;
          background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAADNJREFUOI1jvHz58n8GPEBHRwefNAMTXlkiwKgBg8EAxv///+NNB1euXKGtC0YNGAwGAAAfVwqTIQ+HUgAAAABJRU5ErkJggg==);
          max-width: 100%;
          height: auto;
          overflow: hidden;
          pointer-events: none;
        }
      }
    }
  }
}
</style>
<style lang="scss">
@import "imagepetapeta-beta/src/renderer/styles/index.scss";
</style>
