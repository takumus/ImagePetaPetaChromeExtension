// import { icon } from "@/scripts/icon";
import { ContentMessages } from "@/contentMessages";
import { getElementsOnPointer } from "@/scripts/client/getElementsOnPointer";
import { getURLsFromElement } from "@/scripts/client/getURLsFromElement";
import { Overlay } from "@/scripts/client/overlay";
import { sendToBackground } from "@/sendToBackground";
import { throttle } from "throttle-debounce";

(async () => {
  const overlay = new Overlay();
  const currentMousePosition = { x: 0, y: 0 };
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
      overlay.show(clicledElementRect);
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
    overlay.setStatus("ready");
    clickedElement = elements.element;
    const clicledElementRect = clickedElement?.getBoundingClientRect();
    overlay.show(clicledElementRect, { x, y });
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
  overlay.saveButton.addEventListener("click", async () => {
    overlay.setStatus("saving");
    const result = await sendToBackground("save");
    if (result) {
      overlay.setStatus("saved");
    } else {
      overlay.setStatus("failed");
    }
  });
  overlay.captureButton.addEventListener("click", async () => {
    overlay.setStatus("saving");
    const domRect = clickedElement?.getBoundingClientRect();
    overlay.hide();
    clickedElement = null;
    await new Promise((res) => {
      setTimeout(res, 100);
    });
    const result = await sendToBackground(
      "capture",
      domRect
        ? {
            width: domRect.width / window.innerWidth,
            height: domRect.height / window.innerHeight,
            x: domRect.x / window.innerWidth,
            y: domRect.y / window.innerHeight,
          }
        : undefined
    );
    if (result) {
      overlay.setStatus("saved");
    } else {
      overlay.setStatus("failed");
    }
  });
  overlay.cancelButton.addEventListener("click", async () => {
    overlay.hide();
    clickedElement = null;
  });
  const click = throttle(100, (event: PointerEvent | MouseEvent) => {
    if (!enabled) {
      return;
    }
    if (event.target === overlay.root) {
      event.preventDefault();
      return;
    }
    if (event.button !== 2) {
      overlay.hide();
      clickedElement = null;
      return;
    }
    event.preventDefault();
    select(event.clientX, event.clientY);
  });
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
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (!enabled) {
        return;
      }
      if (event.target === overlay.root) {
        event.preventDefault();
        return;
      }
      if (event.button !== 2) {
        overlay.hide();
        clickedElement = null;
        return;
      }
      event.preventDefault();
      select(event.clientX, event.clientY);
    },
    true
  );
  window.addEventListener("mousemove", (event) => {
    if (!enabled) {
      return;
    }
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;
  });
  const messageFunctions: ContentMessages = {
    openMenu: async () => {
      if (!enabled) {
        return;
      }
      select(currentMousePosition.x, currentMousePosition.y);
    },
  };
  chrome.runtime.onMessage.addListener((request, _, response) => {
    (messageFunctions as any)
      [request.type](...request.args)
      .then((res: any) => {
        response({
          value: res,
        });
      });
    return true;
  });
})();
