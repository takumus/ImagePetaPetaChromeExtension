<template>
  <e-window-root v-show="show">
    <e-menu
      ref="menu"
      :style="{
        left: menuPosition.x + 'px',
        top: menuPosition.y + 'px',
      }">
      <e-icon>
        <img :src="icon" />
        <e-label>ImagePetaPeta</e-label>
      </e-icon>
      <e-buttons>
        <e-button
          class="save"
          v-for="url in urls"
          @click="save(url)"
          :class="{
            [savedURLs[url]]: true,
          }">
          <e-size>
            {{ imgInfo[url]?.type }}({{ imgInfo[url]?.width }}x{{ imgInfo[url]?.height }})
          </e-size>
          <img
            :src="url"
            v-show="imgInfo[url]?.loaded"
            @load="setImageInfo($event.target as HTMLImageElement)" />
        </e-button>
      </e-buttons>
    </e-menu>
    <e-boxes>
      <e-box
        v-for="ipr in currentImageParseResult"
        :style="{
          top: ipr.rect.y + 'px',
          left: ipr.rect.x + 'px',
          width: ipr.rect.width + 'px',
          height: ipr.rect.height + 'px',
        }"></e-box>
    </e-boxes>
    <e-background ref="background"></e-background>
  </e-window-root>
</template>
<script setup lang="ts">
import { urlDrivers } from "./drivers";
import { inject, onMounted, ref } from "vue";

import { getImageExtension } from "@/scripts/content/getImageExtension";
import { getData, ImageParserResult } from "@/scripts/content/imageParser";
import { injectedDataStoreKey } from "@/scripts/content/injectedData";
import { icon, subIcon } from "@/scripts/icon";

import { MessagesToContent } from "@/messages";
import { sendToBackground } from "@/sendToBackground";

type ImageInfo = { width: number; height: number; loaded: boolean; type: string };
type SaveState = "saving" | "saved" | "failed";
const urls = ref<string[]>([]);
const imgInfo = ref<{ [url: string]: ImageInfo | undefined }>({});
const show = ref(false);
const background = ref<HTMLElement>();
const menu = ref<HTMLElement>();
const menuPosition = ref({ x: 0, y: 0 });
const menuTargetPosition = ref({ x: 0, y: 0 });
const mousePosition = ref({ x: 0, y: 0 });
const injectedData = inject(injectedDataStoreKey);
const savedURLs = ref<{ [url: string]: SaveState }>({});
if (injectedData === undefined) {
  throw "impt inject error";
}
let currentImageParseResult = ref<ImageParserResult[]>([]);
function setImageInfo(element: HTMLImageElement) {
  if (imgInfo.value[element.src] !== undefined) {
    imgInfo.value[element.src] = {
      ...imgInfo.value[element.src],
      width: element.naturalWidth,
      height: element.naturalHeight,
      loaded: true,
      type: getImageExtension(element.src) ?? "unknown",
    };
  }
}
async function save(url: string) {
  let urls = [url];
  await sendToBackground("orderSave", urls, window.location.origin, window.navigator.userAgent, {
    name: document.title,
    note: location.href,
  });
  const result = await sendToBackground("save");
  if (result !== undefined && result.length > 0) {
    savedURLs.value[url] = "saved";
  }
}
async function select(x: number, y: number) {
  menuTargetPosition.value = { x, y };
  currentImageParseResult.value = getData({ x, y }).map((d) => {
    d.urls = urlDrivers.reduce<string[]>((urls, driver) => driver(urls), d.urls);
    return d;
  });
  urls.value = Array.from(
    new Set(currentImageParseResult.value.reduce<string[]>((p, c) => [...c.urls, ...p], [])),
  );
  imgInfo.value = urls.value.reduce<{ [url: string]: ImageInfo }>((p, c) => {
    return {
      [c]: imgInfo.value[c] ?? { width: 0, height: 0, loaded: false, type: "unknown" },
      ...p,
    };
  }, {});
  console.log(currentImageParseResult.value);
  if (currentImageParseResult.value.length === 0) {
    hide();
    return;
  }
  show.value = true;
  updateBoxes();
  updateMenuPosition();
}
function updateBoxes(updateRect = false) {
  if (updateRect) {
    currentImageParseResult.value.forEach((r) => {
      r.rect = r.element.getBoundingClientRect();
    });
  }
}
function updateMenuPosition(optionalRect?: DOMRect) {
  if (show.value && menu.value) {
    const rect = optionalRect ?? menu.value.getBoundingClientRect();
    let { x, y } = menuTargetPosition.value;
    if (window.innerWidth < rect.width + menuTargetPosition.value.x) {
      x = menuTargetPosition.value.x - rect.width;
    }
    if (window.innerHeight < rect.height + menuTargetPosition.value.y) {
      y = menuTargetPosition.value.y - rect.height;
    }
    menuPosition.value = { x, y };
  }
}
function hide() {
  show.value = false;
  savedURLs.value = {};
}
onMounted(() => {
  let enabledRightClick = false;
  const ub = () => {
    updateBoxes(true);
    updateMenuPosition();
    requestAnimationFrame(ub);
  };
  ub();
  if (menu.value) {
    new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) {
        updateMenuPosition(rect);
      }
    }).observe(menu.value);
  }
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
  background.value?.addEventListener("click", hide);
  window.document.addEventListener("mousemove", (event) => {
    mousePosition.value.x = event.clientX;
    mousePosition.value.y = event.clientY;
  });
  const messageFunctions: MessagesToContent = {
    openMenu: async () => {
      select(mousePosition.value.x, mousePosition.value.y);
    },
  };
  if (injectedData.id === "dev") {
    (window.document.querySelector("#img1") as HTMLImageElement).src = icon;
    (window.document.querySelector("#img2") as HTMLImageElement).src = icon;
    (window.document.querySelector("#img3") as HTMLImageElement).style.backgroundImage =
      `url(${subIcon})`;
    window.document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      messageFunctions.openMenu();
    });
  } else {
    setInterval(async () => {
      enabledRightClick = await sendToBackground("getRightClickEnable");
    }, 100);
    chrome.runtime.onMessage.addListener((request, _, response) => {
      (messageFunctions as any)[request.type](...request.args).then((res: any) => {
        response({
          value: res,
        });
      });
      return true;
    });
  }
});
</script>
<style lang="scss">
*,
*:before,
*:after {
  all: initial;
  box-sizing: border-box;
  font-size: 16px;
  line-height: 16px;
  font-family: "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo,
    sans-serif;
  user-select: none;
}
*::-webkit-scrollbar {
  width: var(--px-2);
}
*::-webkit-scrollbar-thumb {
  border-radius: var(--rounded);
  background-color: var(--color-border);
  min-height: var(--px-3);
}
e-window-root {
  display: block;
  position: absolute !important;
  top: 0px !important;
  left: 0px !important;
  background-color: unset !important;
  width: 0px !important;
  height: 0px !important;
  > e-boxes > e-box {
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
  > e-background {
    position: fixed;
    top: 0px;
    left: 0px;
    z-index: 2147483645;
    background-color: var(--color-overlay);
    width: 100%;
    height: 100%;
  }
  > e-menu {
    display: flex;
    position: fixed;
    flex-direction: column;
    align-items: center;
    gap: var(--px-2);
    opacity: 0.95;
    z-index: 2147483647;
    box-shadow: var(--shadow-floating);
    border-radius: var(--rounded);
    background-color: var(--color-0-floating);
    padding: var(--px-2);
    width: 40%;
    max-height: 50%;
    overflow: hidden;
    pointer-events: auto;
    > e-icon {
      display: flex;
      flex-direction: row;
      justify-content: left;
      align-items: center;
      gap: var(--px-2);
      width: 100%;
      height: 32px;
      > e-label {
        color: var(--color-font);
      }
      > img {
        display: block;
        height: 100%;
      }
    }
    > e-buttons {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: var(--px-2);
      padding-right: var(--px-2);
      width: 100%;
      overflow: hidden;
      overflow-y: auto;
      pointer-events: auto !important;
      > e-button {
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
  }
}
</style>
<style lang="scss">
@import "imagepetapeta-beta/src/renderer/styles/index.scss";
</style>
