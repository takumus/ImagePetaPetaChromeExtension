// import { icon } from "@/scripts/icon";
// import { debounce } from "throttle-debounce";
import { getElementsOnPointer } from "@/scripts/client/getElementsOnPointer";
import { getURLsFromElement } from "@/scripts/client/getURLsFromElement";
import { Overlay } from "@/scripts/client/overlay";
import { sendToBackground } from "@/sendToBackground";

(async () => {
  const overlay = new Overlay();
  let clickedElement: HTMLElement | null;
  let enabled = false;
  setInterval(async () => {
    enabled = await sendToBackground("getEnable");
    if (!enabled) {
      overlay.hide();
      clickedElement = null;
    }
  }, 1000);
  setInterval(() => {
    const clicledElementRect = clickedElement?.getBoundingClientRect();
    if (clicledElementRect !== undefined) {
      overlay.show(clicledElementRect, true);
    }
  }, 1000 / 30);
  async function select(x: number, y: number) {
    const elements = getElementsOnPointer({
      x,
      y,
    });
    if (elements === undefined) {
      return;
    }
    clickedElement = elements.element;
    const clicledElementRect = clickedElement?.getBoundingClientRect();
    if (clicledElementRect !== undefined) {
      overlay.show(clicledElementRect, false);
    }
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
    "contextmenu",
    (event) => {
      if (!enabled) {
        return;
      }
      event.preventDefault();
    },
    true
  );
  overlay.saveButton.addEventListener("click", async () => {
    const result = await sendToBackground("save");
    if (result !== undefined) {
      overlay.saved();
    }
  });
  window.addEventListener(
    "mousedown",
    async (event) => {
      if (!enabled) {
        return;
      }
      event.preventDefault();
      if (event.target === overlay.saveButton) {
        return;
      }
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
