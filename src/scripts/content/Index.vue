<template>
  <e-root v-if="show">
    <div class="menu" id="menu" style="left: 50%; top: 50%">
      <div class="buttons" id="buttons">
        <div class="template button save" v-for="url in urls" @click="save(url)">
          <div class="size">{{ imgInfo[url]?.width }}x{{ imgInfo[url]?.height }}</div>
          <img
            :src="url"
            v-show="imgInfo[url]?.loaded"
            @load="
              (t) => {
                const img = t.target as HTMLImageElement;
                setSize(url, { width: img.naturalWidth, height: img.naturalHeight, loaded: true });
              }
            " />
        </div>
      </div>
    </div>
    <div class="boxes" id="boxes">
      <div
        v-for="ipr in currentImageParseResult"
        class="template box"
        id="box"
        :style="{
          top: ipr.rect.y + 'px',
          left: ipr.rect.x + 'px',
          width: ipr.rect.width + 'px',
          height: ipr.rect.height + 'px',
        }"></div>
    </div>
    <div class="background" id="background"></div>
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
  currentImageParseResult.value = getData({ x, y }).map((d) => {
    d.urls = urlDrivers.reduce<string[]>((urls, driver) => driver(urls), d.urls);
    return d;
  });
  urls.value = Array.from(
    new Set(currentImageParseResult.value.reduce<string[]>((p, c) => [...c.urls, ...p], [])),
  );
  imgInfo.value = urls.value.reduce<{ [url: string]: ImageInfo }>((p, c) => {
    return {
      [c]: { width: 0, height: 0, loaded: false },
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
  const currentMousePosition = { x: 0, y: 0 };
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
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;
  });
  const messageFunctions: MessagesToContent = {
    openMenu: async () => {
      select(currentMousePosition.x, currentMousePosition.y);
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
.boxes > .box {
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
.background {
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 2147483645;
  background-color: rgba(0, 0, 0, 0.7);
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.menu {
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
}
.menu > .buttons {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
  padding-right: 8px;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  pointer-events: auto !important;
}
.menu > .buttons > .button {
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
}
.menu > .buttons > .button:hover {
  background-color: #dedede;
}
.menu > .buttons > .button.save > img {
  display: block;
  border-radius: 4px;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAADNJREFUOI1jvHz58n8GPEBHRwefNAMTXlkiwKgBg8EAxv///+NNB1euXKGtC0YNGAwGAAAfVwqTIQ+HUgAAAABJRU5ErkJggg==);
  max-width: 100%;
  height: auto;
  overflow: hidden;
  pointer-events: none;
}
</style>
<style lang="scss">
@import "imagepetapeta-beta/src/renderer/styles/index.scss";
</style>
