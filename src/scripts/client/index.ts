import { urlDrivers } from "@/scripts/client/drivers";
import { getData } from "@/scripts/client/imageParser";
import { UI } from "@/scripts/client/ui";

import { MessagesToContent } from "@/messages";
import { sendToBackground } from "@/sendToBackground";

(async () => {
  const ui = new UI();
  const currentMousePosition = { x: 0, y: 0 };
  async function select(x: number, y: number) {
    ui.show(
      getData({ x, y }).map((d) => {
        d.urls = urlDrivers.reduce<string[]>((urls, driver) => driver(urls), d.urls);
        return d;
      }),
      { x, y },
    );
  }
  ui.onSave = async (url) => {
    let urls = [url];
    console.log(urls);
    await sendToBackground("orderSave", urls, window.location.origin, window.navigator.userAgent, {
      name: document.title,
      note: location.href,
    });
    ui.setStatus("saving");
    const result = await sendToBackground("save");
    if (result) {
      ui.setStatus("saved");
    } else {
      ui.setStatus("failed");
    }
  };
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
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.target === ui.root) {
        event.preventDefault();
        return;
      }
      if (event.button !== 2) {
        ui.hide();
        return;
      }
      event.preventDefault();
      select(event.clientX, event.clientY);
    },
    true,
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
    (messageFunctions as any)[request.type](...request.args).then((res: any) => {
      response({
        value: res,
      });
    });
    return true;
  });
})();
