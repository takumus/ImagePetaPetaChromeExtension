export function clientScript() {
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
    const elements = Array.from(document.querySelectorAll("*")).filter(
      (element) => {
        const rect = element.getBoundingClientRect();
        if (
          rect.left < event.clientX &&
          rect.right > event.clientX &&
          rect.top < event.clientY &&
          rect.bottom > event.clientY
        ) {
          if (!(element instanceof HTMLImageElement)) {
            return;
          }
          if (element.src !== undefined || element.srcset !== undefined) {
            return true;
          }
        }
        return false;
      }
    );
    const element = (elements[
      elements.indexOf(document.elementFromPoint(event.clientX, event.clientY)!)
    ] ?? elements[0]) as HTMLElement;
    console.log(element);
    chrome.runtime.sendMessage(
      {
        type: "save",
        html: element.outerHTML,
      },
      (res) => {
        if (res === undefined) {
          alert("タイムアウト");
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
