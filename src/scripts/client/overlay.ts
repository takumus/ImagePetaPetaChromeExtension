import injectHTMLString from "@/scripts/client/inject.html?raw";
import { Result } from "@/scripts/client/result";

// import { icon } from "@/scripts/icon";

export class Overlay {
  public root: HTMLElement;
  private rectElements: HTMLElement[] = [];
  private style: HTMLStyleElement;
  private menu: HTMLElement;
  private rects: HTMLElement;
  public saveButtons: HTMLElement[] = [];
  public shadowRoot: ShadowRoot;
  public buttons: HTMLElement;
  public saveButtonBase: HTMLElement;
  constructor() {
    const injectHTML = new DOMParser().parseFromString(injectHTMLString, "text/html");
    this.style = injectHTML.head.querySelector("style")!;
    this.menu = injectHTML.body.querySelector("#menu")!;
    this.buttons = injectHTML.body.querySelector("#buttons")!;
    this.saveButtonBase = this.buttons.querySelector("#save-button")!;
    this.rects = injectHTML.body.querySelector("#rects")!;
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
    this.rectElements.forEach((overlay) => {
      overlay.remove();
    });
    this.saveButtons.forEach((b) => {
      b.remove();
    });
  }
  show(results: Result[], mouse?: { x: number; y: number }) {
    this.removeOverlays();
    setStyle(this.root, { display: "block" }, "important");
    this.buttons.scrollTo(0, 0);
    const urls: string[] = [];
    results.forEach((result, i) => {
      const overlay = document.createElement("div");
      overlay.className = "rect";
      setStyle(overlay, {
        left: result.rect.x + "px",
        top: result.rect.y + "px",
        width: result.rect.width + "px",
        height: result.rect.height + "px",
      });
      this.rectElements.push(overlay);
      this.rects.appendChild(overlay);
      urls.push(...result.urls);
    });
    Array.from(new Set(urls)).forEach((url) => {
      const saveButton = this.clone(this.saveButtonBase);
      console.log(saveButton);
      const img = saveButton.querySelector("img")!;
      const size = saveButton.querySelector(".size")!;
      img.src = url;
      size.innerHTML = "???x???";
      img.onload = () => {
        console.log(img.naturalWidth, img.naturalHeight);
        size.innerHTML = `${img.naturalWidth}x${img.naturalHeight}`;
      };
      saveButton.classList.add("button", "save");
      saveButton.appendChild(size);
      saveButton.appendChild(img);
      saveButton.addEventListener("click", () => {
        this.onSave(url);
      });
      this.saveButtons.push(saveButton);
      this.buttons.appendChild(saveButton);
    });
    if (mouse !== undefined) {
      setStyle(this.menu, {
        left: mouse.x + "px",
        top: mouse.y + "px",
      });
    }
  }
  hide() {
    this.removeOverlays();
    setStyle(this.root, { display: "none" }, "important");
  }
  onSave(url: string) {}
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
