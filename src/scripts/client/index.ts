// import { icon } from "@/scripts/icon";
import { getElementsOnPointer } from "@/scripts/client/getElementsOnPointer";
import { getURLsFromElement } from "@/scripts/client/getURLsFromElement";
import { Overlay } from "@/scripts/client/overlay";
import { sendToBackground } from "@/sendToBackground";

(async () => {
  if ((window as any)["imagepetapeta-extension"] === true) {
    return;
  }
  (window as any)["imagepetapeta-extension"] = true;
  const overlay = new Overlay();
  let clickedElement: HTMLElement | null;
  setInterval(async () => {
    if (!(await sendToBackground("getEnable"))) {
      overlay.hide();
      clickedElement = null;
    }
  }, 1000);
  setInterval(() => {
    const clicledElementRect = clickedElement?.getBoundingClientRect();
    if (clicledElementRect !== undefined) {
      overlay.show(clicledElementRect);
    }
  }, 1000 / 30);
  window.addEventListener(
    "mousedown",
    async (event) => {
      if (event.button !== 2) {
        overlay.hide();
        clickedElement = null;
        return;
      }
      if (!(await sendToBackground("getEnable"))) {
        return;
      }
      const elements = getElementsOnPointer({
        x: event.clientX,
        y: event.clientY,
      });
      if (elements === undefined) {
        return;
      }
      clickedElement = elements.element;
      console.log(elements);
      const elementAlt = elements.element.getAttribute("alt")?.trim();
      const pageTitle = document.title.trim();
      const name = (() => {
        if (elementAlt !== "") {
          return elementAlt;
        }
        if (pageTitle !== "") {
          return pageTitle;
        }
        return "download";
      })();
      let urls: string[] = [];
      Array.from(
        new Set(
          [clickedElement, ...elements.elements].map((element) => {
            return getURLsFromElement(element);
          })
        )
      ).forEach((u) => {
        u.forEach((url) => {
          if (url !== undefined) {
            urls.push(url);
          }
        });
      });
      urls = Array.from(new Set(urls)).map(
        (url) => new URL(url, location.href).href
      );
      console.log(urls);
      if (urls.length < 1) {
        alert("画像が見つかりません");
        return;
      }
      sendToBackground("orderSave", urls, window.location.origin, {
        name,
        note: location.href,
      }).then(() => {
        // if (ids === undefined) {
        //   alert("保存失敗");
        //   return;
        // }
        // console.log(ids);
        // if (ids.length > 0) {
        //   element.setAttribute("data-imagepetapeta-saved", "true");
        //   element.style.filter = "invert(100%)";
        // }
      });
    },
    true
  );
})();
