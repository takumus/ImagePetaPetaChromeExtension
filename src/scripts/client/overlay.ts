import { Result } from "@/scripts/client/result";
import { icon } from "@/scripts/icon";

export class Overlay {
  public root: HTMLElement;
  private overlays: HTMLElement[] = [];
  private menu: HTMLElement;
  private menuIcon: HTMLImageElement;
  public saveButtons: HTMLDivElement[] = [];
  public captureButton: HTMLDivElement;
  public cancelButton: HTMLDivElement;
  public shadowRoot: ShadowRoot;
  constructor() {
    this.root = document.createElement("div");
    this.menu = document.createElement("div");
    // this.overlays = document.createElement("div");
    this.menuIcon = document.createElement("img");
    // this.saveButton = document.createElement("div");
    this.captureButton = document.createElement("div");
    this.cancelButton = document.createElement("div");
    this.shadowRoot = this.root.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.innerHTML = `
    * {
      all: initial;
      box-sizing: border-box;
      font-family: "Helvetica Neue",Helvetica,Arial,YuGothic,"Yu Gothic",游ゴシック体,游ゴシック,"ヒラギノ角ゴ ProN W3","Hiragino Kaku Gothic ProN","ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro",メイリオ,Meiryo,"MS ゴシック","MS Gothic",sans-serif;
      user-select: none;
      pointer-events: none;
    }
    *::-webkit-scrollbar {
      width: 8px;
    }
    *::-webkit-scrollbar-thumb {
      background-color: #999999;
      border-radius: 4px;
      min-height: 16px;
    }
    .overlay {
      position: fixed;
      z-index: 2147483646;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      border: solid 4px #333333;
      margin: 0px;
      padding: 0px;
      box-shadow: 
        0px 0px 0px 3px #ffffff,
        0px 0px 0px 3px #ffffff inset,
        0px 0px 4px 3px rgba(0, 0, 0, 0.4),
        0px 0px 4px 3px rgba(0, 0, 0, 0.4) inset;
    }
    .menu {
      background-color: #ffffff;
      box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.4);
      border-radius: 8px;
      overflow-x: hidden;
      overflow-y:auto;
      max-height: 50%;
      position: fixed;
      z-index: 2147483647;
      transform: translateX(-50%) translateY(-50%);
      display: flex;
      flex-direction: column;
      min-width: 128px;
      pointer-events: auto;
      gap: 8px;
      padding: 8px;
    }
    .menu > img {
      width: 32px;
    }
    .button {
      padding: 8px;
      cursor: pointer;
      font-size: 18px;
      color: #333333;
      font-weight: bold;
      pointer-events: auto;
      height: 200px;
      border-radius: 4px;
    }
    .button.save {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
    .button.save > img {
      display: block;
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
      background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAADNJREFUOI1jvHz58n8GPEBHRwefNAMTXlkiwKgBg8EAxv///+NNB1euXKGtC0YNGAwGAAAfVwqTIQ+HUgAAAABJRU5ErkJggg==);
    }
    .button:hover {
      background-color: #dedede;
    }
    .button.disabled {
      cursor: unset
    }
    `;
    // this.saveButton.className =
    this.cancelButton.className = this.captureButton.className = "button";
    this.menu.className = "menu";
    // this.overlay.className = "overlay";
    this.cancelButton.innerHTML = "Cancel";
    this.captureButton.innerHTML = "Capture";
    this.menuIcon.src = icon;
    setStyle(style, { display: "none" }, "important");
    document.body.appendChild(this.root);
    this.shadowRoot.appendChild(style);
    // shadowRoot.appendChild(this.overlay);
    this.shadowRoot.appendChild(this.menu);
    this.menu.appendChild(this.menuIcon);
    // this.menu.appendChild(this.saveButton);
    // this.menu.appendChild(this.captureButton);
    // this.menu.appendChild(this.cancelButton);
    this.hide();
  }
  removeOverlays() {
    this.overlays.forEach((overlay) => {
      overlay.remove();
    });
    this.saveButtons.forEach((b) => {
      b.remove();
    });
  }
  show(results: Result[], mouse?: { x: number; y: number }) {
    this.removeOverlays();
    setStyle(this.root, { display: "block" }, "important");
    const urls: string[] = [];
    results.forEach((result, i) => {
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      setStyle(overlay, {
        left: result.rect.x + "px",
        top: result.rect.y + "px",
        width: result.rect.width + "px",
        height: result.rect.height + "px",
      });
      this.overlays.push(overlay);
      this.shadowRoot.appendChild(overlay);
      urls.push(...result.urls);
    });
    Array.from(new Set(urls)).forEach((url) => {
      const saveButton = document.createElement("div");
      saveButton.classList.add("button", "save");
      saveButton.innerHTML = `<img src="${url}">`;
      saveButton.addEventListener("click", () => {
        this.onSave(url);
      });
      this.saveButtons.push(saveButton);
      this.menu.appendChild(saveButton);
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
function setStyle(
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
  proprity?: string
) {
  Object.keys(styles).forEach((key) => {
    element.style.setProperty(
      key.replace(
        /[A-Z]+(?![a-z])|[A-Z]/g,
        (c, ofs) => (ofs ? "-" : "") + c.toLowerCase()
      ),
      (styles as any)[key],
      proprity
    );
  });
}
