import { sendToBackground } from "@/sendToBackground";
import { getURLFromHTML } from "imagepetapeta-beta/src/renderer/utils/getURLFromHTML";

(async () => {
  if ((window as any)["imagepetapeta-extension"] === true) {
    return;
  }
  function getURLFromStyle(style: CSSStyleDeclaration) {
    const regexp = /url\(['"]?((?:\S*?\(\S*?\))*\S*?)['"]?\)/g;
    return Array.from(
      new Set([
        ...[...style.backgroundImage.matchAll(regexp)].map((v) => v[1]),
        ...[...style.background.matchAll(regexp)].map((v) => v[1]),
      ])
    );
  }

  (window as any)["imagepetapeta-extension"] = true;
  // const footer = document.createElement("div");
  // footer.style.position = "fixed";
  // footer.style.width = "100%";
  // footer.style.zIndex = "9999";
  // footer.style.bottom = "0px";
  // footer.style.color = "#ffffff";
  // footer.style.padding = "16px";
  // footer.style.backgroundColor = "rgba(0,0,0,0.5)";
  // footer.style.pointerEvents = "none";
  // footer.innerHTML = "ImagePetaPeta Enabled";
  // document.body.appendChild(footer);
  window.addEventListener("contextmenu", (event) => {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement | null;
    if (element == null) {
      return;
    }
    const elementAlt = element.getAttribute("alt")?.trim();
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
    const urls = Array.from(
      new Set([
        ...[getURLFromHTML(element.outerHTML)],
        ...getURLFromStyle(window.getComputedStyle(element)),
      ])
    ).filter((url) => url !== undefined) as string[];
    sendToBackground(
      "orderSave",
      urls.map((url) => new URL(url, location.href).href),
      window.location.origin,
      {
        name,
        note: location.href,
      }
    ).then(() => {
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
  });
})();
