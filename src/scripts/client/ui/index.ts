import { ImageParserResult } from "@/scripts/client/imageParser";
import injectHTMLString from "@/scripts/client/ui/uiTemplate.html?raw";

// import { icon } from "@/scripts/icon";
function template(element: HTMLElement) {
  return () => element.cloneNode(true) as HTMLElement;
}
type Template = ReturnType<typeof template>;
export class UI {
  public readonly root: HTMLElement;
  private menu: HTMLElement;
  private rects: HTMLElement;
  private buttons: HTMLElement;
  private saveButtonTemplate: Template;
  private rectTemplate: Template;
  constructor() {
    const injectHTML = new DOMParser().parseFromString(injectHTMLString, "text/html");
    const style = injectHTML.head.querySelector("style")!;
    this.menu = injectHTML.body.querySelector("#menu")!;
    this.buttons = injectHTML.body.querySelector("#menu > #buttons")!;
    this.saveButtonTemplate = template(
      this.buttons.querySelector("#menu > #buttons > #save-button")!,
    );
    this.rects = injectHTML.body.querySelector("#rects")!;
    this.rectTemplate = template(this.rects.querySelector("#rects > #rect")!);
    // remove templates
    injectHTML.querySelectorAll(".template").forEach((e) => e.remove());
    // init root
    this.root = document.createElement("div");
    this.root
      .attachShadow({ mode: "closed" })
      .append(style, ...Array.from(injectHTML.body.children));
    document.body.append(this.root);
    this.hide();
  }
  reset() {
    this.rects.innerHTML = "";
    this.buttons.innerHTML = "";
  }
  show(results: ImageParserResult[], mouse?: { x: number; y: number }) {
    this.reset();
    setStyle(this.root, { display: "block" }, "important");
    this.buttons.scrollTo(0, 0);
    const urls: string[] = [];
    results.forEach((result, i) => {
      const rect = this.rectTemplate();
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
      const saveButton = this.saveButtonTemplate();
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
  }
  hide() {
    this.reset();
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
