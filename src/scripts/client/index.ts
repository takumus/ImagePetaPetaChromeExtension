// import { icon } from "@/scripts/icon";
import { MessagesToContent } from "@/messages";
import { pinterest } from "@/scripts/client/drivers/pinterest";
import { twitter } from "@/scripts/client/drivers/twitter";
import { getElementsOnPointer } from "@/scripts/client/getElementsOnPointer";
import { getURLsFromElement } from "@/scripts/client/getURLsFromElement";
import { Overlay } from "@/scripts/client/overlay";
import { Result } from "@/scripts/client/result";
import { sendToBackground } from "@/sendToBackground";

(async () => {
  const overlay = new Overlay();
  const currentMousePosition = { x: 0, y: 0 };
  let clickedElement: { element: HTMLElement; rect: DOMRect } | undefined;
  let enabledRightClick = false;
  setInterval(async () => {
    enabledRightClick = await sendToBackground("getRightClickEnable");
  }, 200);
  setInterval(() => {
    if (clickedElement !== undefined) {
      clickedElement.rect = clickedElement.element.getBoundingClientRect();
      // overlay.show(clickedElement.rect);
    }
  }, 1000 / 30);
  async function select(x: number, y: number) {
    const _elements = Array.from(
      document.querySelectorAll("*")
    ) as HTMLElement[];
    function getDepth(element: HTMLElement) {
      let parent: HTMLElement | null = element.parentElement;
      let depth = 0;
      while (parent !== null) {
        parent = parent?.parentElement;
        depth++;
      }
      return depth;
    }
    const results: Result[] = _elements
      .map((element) => ({
        element,
        rect: element.getBoundingClientRect(),
        urls: getURLsFromElement(element),
        depth: getDepth(element),
      }))
      .filter((res) => {
        const rect = res.rect;
        const isInRect =
          rect.left < x && rect.right > x && rect.top < y && rect.bottom > y;
        const hasURL = res.urls.length > 0;
        return isInRect && hasURL;
      })
      .sort((a, b) => b.depth - a.depth);
    overlay.show(results, { x, y });
  }
  overlay.onSave = async (url) => {
    let urls = [url];
    urls = pinterest(urls);
    urls = twitter(urls);
    console.log(urls);
    await sendToBackground(
      "orderSave",
      urls,
      window.location.origin,
      window.navigator.userAgent,
      {
        name: document.title,
        note: location.href,
      }
    );
    overlay.setStatus("saving");
    const result = await sendToBackground("save");
    if (result) {
      overlay.setStatus("saved");
    } else {
      overlay.setStatus("failed");
    }
  };
  overlay.captureButton.addEventListener("click", async () => {
    overlay.setStatus("saving");
    const domRect = clickedElement?.rect;
    overlay.hide();
    clickedElement = undefined;
    await new Promise((res) => {
      setTimeout(res, 1000 / 30);
    });
    const rect = (() => {
      if (domRect === undefined) {
        return undefined;
      }
      const normalizedRect = {
        width: domRect.width / window.innerWidth,
        height: domRect.height / window.innerHeight,
        x: domRect.x / window.innerWidth,
        y: domRect.y / window.innerHeight,
      };
      const x = Math.max(Math.min(normalizedRect.x, 1), 0);
      const y = Math.max(Math.min(normalizedRect.y, 1), 0);
      const width = Math.max(
        Math.min(
          normalizedRect.width - (normalizedRect.x < 0 ? -normalizedRect.x : 0),
          1 - x
        ),
        0
      );
      const height = Math.max(
        Math.min(
          normalizedRect.height -
            (normalizedRect.y < 0 ? -normalizedRect.y : 0),
          1 - y
        ),
        0
      );
      return {
        x,
        y,
        width,
        height,
      };
    })();
    const result = await sendToBackground("capture", location.href, rect);
    if (result) {
      overlay.setStatus("saved");
    } else {
      overlay.setStatus("failed");
    }
  });
  overlay.cancelButton.addEventListener("click", async () => {
    overlay.hide();
    clickedElement = undefined;
  });
  window.addEventListener(
    "contextmenu",
    (event) => {
      if (!enabledRightClick) {
        return;
      }
      event.preventDefault();
    },
    true
  );
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target === overlay.root) {
        event.preventDefault();
        return;
      }
      if (!enabledRightClick || event.button !== 2) {
        overlay.hide();
        clickedElement = undefined;
        return;
      }
      event.preventDefault();
      select(event.clientX, event.clientY);
    },
    true
  );
  window.addEventListener("mousemove", (event) => {
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;
  });
  const messageFunctions: MessagesToContent = {
    openMenu: async () => {
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
