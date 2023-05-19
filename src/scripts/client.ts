// import { icon } from "@/scripts/icon";
import { sendToBackground } from "@/sendToBackground";
import { getURLFromHTML } from "imagepetapeta-beta/src/renderer/utils/getURLFromHTML";

(async () => {
  if ((window as any)["imagepetapeta-extension"] === true) {
    return;
  }
  (window as any)["imagepetapeta-extension"] = true;
  function createOverlay() {
    const margin = 5;
    const overlay = document.createElement("div");
    // const img = document.createElement("img");
    // img.src = icon;
    // overlay.appendChild(img);
    overlay.style.position = "fixed";
    overlay.style.borderRadius = "6px";
    overlay.style.border = `solid ${margin}px #ffffff`;
    overlay.style.zIndex = "2147483647";
    overlay.style.margin = "0px";
    overlay.style.padding = "0px";
    overlay.style.pointerEvents = "none";
    overlay.style.boxShadow = `0px 0px 3px 3px rgba(0, 0, 0, 0.4), 0px 0px 3px 3px rgba(0, 0, 0, 0.4) inset`;
    document.body.appendChild(overlay);
    return {
      show(x: number, y: number, width: number, height: number) {
        overlay.style.left = x - margin + "px";
        overlay.style.top = y - margin + "px";
        overlay.style.width = width + "px";
        overlay.style.height = height + "px";
        overlay.style.display = "block";
      },
      hide() {
        overlay.style.display = "none";
      },
    };
  }
  const overlay = createOverlay();
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
      overlay.show(
        clicledElementRect.x,
        clicledElementRect.y,
        clicledElementRect.width,
        clicledElementRect.height
      );
    }
  }, 100);
  function getURLFromStyle(style: CSSStyleDeclaration) {
    const regexp = /url\(['"]?((?:\S*?\(\S*?\))*\S*?)['"]?\)/g;
    return Array.from(
      new Set([
        ...[...style.backgroundImage.matchAll(regexp)].map((v) => v[1]),
        ...[...style.background.matchAll(regexp)].map((v) => v[1]),
      ])
    );
  }
  function getURLsFromElement(element: HTMLElement) {
    return [
      getURLFromHTML(element.outerHTML),
      ...getURLFromStyle(window.getComputedStyle(element)),
    ];
  }
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
      overlay.show(
        clicledElementRect.x,
        clicledElementRect.y,
        clicledElementRect.width,
        clicledElementRect.height
      );
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
