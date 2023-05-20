// import { icon } from "@/scripts/icon";
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
      clickedElement = document.elementFromPoint(
        event.clientX,
        event.clientY
      ) as HTMLElement | null;
      if (clickedElement == null) {
        return;
      }
      const clicledElementRect = clickedElement.getBoundingClientRect();
      overlay.show(clicledElementRect);
      const allElements = Array.from(document.querySelectorAll("*")).filter(
        (element) => {
          if (element instanceof HTMLElement) {
            const rect = element.getBoundingClientRect();
            if (
              rect.left < event.clientX &&
              rect.right > event.clientX &&
              rect.top < event.clientY &&
              rect.bottom > event.clientY
            ) {
              return true;
            }
          }
          return false;
        }
      ) as HTMLElement[];
      allElements.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        const diffA =
          Math.abs(clicledElementRect.left - rectA.left) +
          Math.abs(clicledElementRect.right - rectA.right) +
          Math.abs(clicledElementRect.top - rectA.top) +
          Math.abs(clicledElementRect.bottom - rectA.bottom);
        const diffB =
          Math.abs(clicledElementRect.left - rectB.left) +
          Math.abs(clicledElementRect.right - rectB.right) +
          Math.abs(clicledElementRect.top - rectB.top) +
          Math.abs(clicledElementRect.bottom - rectB.bottom);
        const img =
          (b instanceof HTMLImageElement ? 1 : -1) -
          (a instanceof HTMLImageElement ? 1 : -1);
        return (diffA > diffB ? 0.1 : -0.1) + img;
      });
      console.log(allElements);
      const elementAlt = clickedElement.getAttribute("alt")?.trim();
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
          [clickedElement, ...allElements].map((element) => {
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
