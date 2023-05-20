// import { icon } from "@/scripts/icon";
// import { debounce } from "throttle-debounce";
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
  async function select(x: number, y: number) {
    if (!(await sendToBackground("getEnable"))) {
      return;
    }
    const elements = getElementsOnPointer({
      x,
      y,
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
    await sendToBackground("orderSave", urls, window.location.origin, {
      name,
      note: location.href,
    });
  }
  window.addEventListener(
    "mousedown",
    (event) => {
      if (event.button !== 2) {
        overlay.hide();
        clickedElement = null;
        return;
      }
      select(event.clientX, event.clientY);
    },
    true
  );
})();
