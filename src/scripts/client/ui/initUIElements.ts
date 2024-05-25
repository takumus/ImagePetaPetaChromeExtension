import injectHTMLString from "@/scripts/client/ui/uiTemplate.html?raw";

export function initUIElements() {
  const injectHTML = new DOMParser().parseFromString(injectHTMLString, "text/html");
  const style = injectHTML.head.querySelector("style") as HTMLElement;
  const menu = injectHTML.body.querySelector("#menu") as HTMLElement;
  const buttons = injectHTML.body.querySelector("#menu > #buttons") as HTMLElement;
  const boxes = injectHTML.body.querySelector("#boxes") as HTMLElement;
  const saveButtonTemplate = template(
    injectHTML.body.querySelector("#menu > #buttons > #save-button")!,
  );
  const boxTemplate = template(injectHTML.body.querySelector("#boxes > #box")!);
  // remove templates
  injectHTML.querySelectorAll(".template").forEach((e) => e.remove());
  // init root
  const root = document.createElement("div");
  const rootShadow = root.attachShadow({ mode: "closed" });
  rootShadow.append(style, ...Array.from(injectHTML.body.children));
  return {
    root,
    rootShadow,
    menu,
    buttons,
    boxes,
    saveButtonTemplate,
    boxTemplate,
  };
}
function template(element: HTMLElement) {
  return () => element.cloneNode(true) as HTMLElement;
}
export type Template = ReturnType<typeof template>;
