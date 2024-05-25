import { ImageParserResult } from "@/scripts/client/imageParser";
import injectHTMLString from "@/scripts/client/ui/uiTemplate.html?raw";

// import { icon } from "@/scripts/icon";

export class UI {
  public root: HTMLElement;
  private style: HTMLStyleElement;
  private menu: HTMLElement;
  private rects: HTMLElement;
  public shadowRoot: ShadowRoot;
  public buttons: HTMLElement;
  public saveButtonTemplate: HTMLElement;
  public rectTemplate: HTMLElement;
  constructor() {
    const injectHTML = new DOMParser().parseFromString(injectHTMLString, "text/html");
    this.style = injectHTML.head.querySelector("style")!;
    this.menu = injectHTML.body.querySelector("#menu")!;
    this.buttons = injectHTML.body.querySelector("#buttons")!;
    this.saveButtonTemplate = this.buttons.querySelector("#save-button")!;
    this.rects = injectHTML.body.querySelector("#rects")!;
    this.rectTemplate = this.rects.querySelector("#rect")!;
    // remove templates
    injectHTML.querySelectorAll(".template").forEach((e) => e.remove());
    // init root
    this.root = document.createElement("div");
    this.shadowRoot = this.root.attachShadow({ mode: "closed" });
    this.shadowRoot.append(this.style, ...Array.from(injectHTML.body.children));
    document.body.append(this.root);
    this.hide();
  }
  clone(element: HTMLElement) {
    return element.cloneNode(true) as HTMLElement;
  }
  removeOverlays() {
    this.rects.innerHTML = "";
    this.buttons.innerHTML = "";
  }
  show(results: ImageParserResult[], mouse?: { x: number; y: number }) {
    this.removeOverlays();
    setStyle(this.root, { display: "block" }, "important");
    this.buttons.scrollTo(0, 0);
    const urls: string[] = [];
    results.forEach((result, i) => {
      const rect = this.clone(this.rectTemplate);
      setStyle(rect, {
        left: result.rect.x + "px",
        top: result.rect.y + "px",
        width: result.rect.width + "px",
        height: result.rect.height + "px",
      });
      this.rects.append(rect);
      urls.push(...result.urls);
    });
    Array.from(new Set(urls)).forEach((url) => {
      const saveButton = this.clone(this.saveButtonTemplate);
      const img = saveButton.querySelector("img")!;
      const size = saveButton.querySelector(".size")!;
      img.src = url;
      size.innerHTML = "???x???";
      img.onload = () => {
        size.innerHTML = `${img.naturalWidth}x${img.naturalHeight}`;
      };
      saveButton.classList.add("button", "save");
      saveButton.addEventListener("click", () => {
        this.onSave(url);
      });
      this.buttons.append(saveButton);
    });
    if (mouse !== undefined) {
      setStyle(this.menu, {
        left: mouse.x + "px",
        top: mouse.y + "px",
      });
    }
    // console.log(results, urls);
  }
  hide() {
    this.removeOverlays();
    setStyle(this.root, { display: "none" }, "important");
  }
  onSave(_url: string) {}
  setStatus(status: "ready" | "saving" | "saved" | "failed") {
    // if (status === "ready") {
    //   this.saveButton.innerHTML = "Save";
    //   this.saveButton.classList.remove("disabled");
    // } else if (status === "saving") {
    //   this.saveButton.innerHTML = "Saving...";
    //   this.saveButton.classList.add("disabled");
    // } else if (status === "saved") {
    //   this.saveButton.innerHTML = "Complete";
    //   this.saveButton.classList.add("disabled");
    // } else if (status === "failed") {
    //   this.saveButton.innerHTML = "Failed";
    //   this.saveButton.classList.add("disabled");
    // }
  }
}
function setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>, proprity?: string) {
  Object.keys(styles).forEach((key) => {
    element.style.setProperty(
      key.replace(/[A-Z]+(?![a-z])|[A-Z]/g, (c, ofs) => (ofs ? "-" : "") + c.toLowerCase()),
      (styles as any)[key],
      proprity,
    );
  });
}
