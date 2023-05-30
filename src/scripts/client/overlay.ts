import { icon } from "@/scripts/icon";

export class Overlay {
  public root: HTMLElement;
  private overlay: HTMLElement;
  private menu: HTMLElement;
  private menuIcon: HTMLImageElement;
  public saveButton: HTMLDivElement;
  public captureButton: HTMLDivElement;
  public cancelButton: HTMLDivElement;
  constructor() {
    this.root = document.createElement("div");
    this.menu = document.createElement("div");
    this.overlay = document.createElement("div");
    this.menuIcon = document.createElement("img");
    this.saveButton = document.createElement("div");
    this.captureButton = document.createElement("div");
    this.cancelButton = document.createElement("div");
    const shadowRoot = this.root.attachShadow({ mode: "closed" });
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
    .overlay {
      position: fixed;
      z-index: 2147483647;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      border: solid 4px #333333;
      background-color: rgba(255, 255, 255, 0.4);
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
      overflow: hidden;
      position: fixed;
      z-index: 2147483647;
      transform: translateX(-50%) translateY(-50%);
      display: flex;
      flex-direction: column;
      min-width: 128px;
      pointer-events: auto;
      align-items: center;
    }
    .menu img {
      width: 32px;
    }
    .button {
      cursor: pointer;
      padding: 4px;
      padding-left: 8px;
      font-size: 18px;
      color: #333333;
      font-weight: bold;
      pointer-events: auto;
      width: 100%;
    }
    .button:hover {
      background-color: #eeeeee;
    }
    .button.disabled {
      cursor: unset
    }
    `;
    this.saveButton.className =
      this.cancelButton.className =
      this.captureButton.className =
        "button";
    this.menu.className = "menu";
    this.overlay.className = "overlay";
    this.cancelButton.innerHTML = "Cancel";
    this.captureButton.innerHTML = "Capture";
    this.menuIcon.src = icon;
    setStyle(style, { display: "none" }, "important");
    document.body.appendChild(this.root);
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(this.overlay);
    shadowRoot.appendChild(this.menu);
    this.menu.appendChild(this.menuIcon);
    this.menu.appendChild(this.saveButton);
    this.menu.appendChild(this.captureButton);
    this.menu.appendChild(this.cancelButton);
    this.hide();
  }
  show(
    rect: { x: number; y: number; width: number; height: number },
    mouse?: { x: number; y: number }
  ) {
    setStyle(this.root, { display: "block" }, "important");
    setStyle(this.overlay, {
      left: rect.x + "px",
      top: rect.y + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    });
    if (mouse !== undefined) {
      setStyle(this.menu, {
        left: mouse.x + "px",
        top: mouse.y + "px",
      });
    }
  }
  hide() {
    setStyle(this.root, { display: "none" }, "important");
  }
  setStatus(status: "ready" | "saving" | "saved" | "failed") {
    if (status === "ready") {
      this.saveButton.innerHTML = "Save";
      this.saveButton.classList.remove("disabled");
    } else if (status === "saving") {
      this.saveButton.innerHTML = "Saving...";
      this.saveButton.classList.add("disabled");
    } else if (status === "saved") {
      this.saveButton.innerHTML = "Complete";
      this.saveButton.classList.add("disabled");
    } else if (status === "failed") {
      this.saveButton.innerHTML = "Failed";
      this.saveButton.classList.add("disabled");
    }
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
