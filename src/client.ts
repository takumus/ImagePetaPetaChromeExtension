import { getURLFromHTML } from "imagepetapeta-beta/src/renderer/utils/getURLFromHTML";

function clientScript() {
  if ((window as any)["imagepetapeta-extension"] === true) {
    return;
  }
  (window as any)["imagepetapeta-extension"] = true;
  const footer = document.createElement("div");
  footer.style.position = "fixed";
  footer.style.width = "100%";
  footer.style.zIndex = "9999";
  footer.style.bottom = "0px";
  footer.style.color = "#ffffff";
  footer.style.padding = "16px";
  footer.style.backgroundColor = "rgba(0,0,0,0.5)";
  footer.style.pointerEvents = "none";
  footer.innerHTML = "ImagePetaPeta Enabled";
  document.body.appendChild(footer);
  document.body.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    if (event.target?.getAttribute("data-imagepetapeta-saved") === "true") {
      return;
    }
    const element = document.elementFromPoint(
      event.clientX,
      event.clientY
    ) as HTMLElement | null;
    if (element == null) {
      return;
    }
    const urls = Array.from(
      new Set([
        ...[getURLFromHTML(element.outerHTML)],
        ...getURLFromStyle(window.getComputedStyle(element)),
      ])
    ).filter((url) => url !== undefined) as string[];
    chrome.runtime.sendMessage(
      {
        type: "save",
        referrer: window.location.origin,
        urls,
      },
      (res) => {
        if (res === undefined) {
          alert("保存失敗");
          return;
        }
        console.log(res);
        if (res.length > 0) {
          element.setAttribute("data-imagepetapeta-saved", "true");
          element.style.filter = "invert(100%)";
        }
      }
    );
  });
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
clientScript();
