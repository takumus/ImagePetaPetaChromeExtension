export class Overlay {
  public shadowRoot: HTMLElement;
  private root: HTMLElement;
  private overlay: HTMLElement;
  public saveButton: HTMLDivElement;
  constructor() {
    this.shadowRoot = document.createElement("div");
    const shadowRoot = this.shadowRoot.attachShadow({ mode: "closed" });
    shadowRoot.innerHTML = `
    <style>
      * {
        all: initial;
        box-sizing: border-box;
        font-family: "Helvetica Neue",Helvetica,Arial,YuGothic,"Yu Gothic",游ゴシック体,游ゴシック,"ヒラギノ角ゴ ProN W3","Hiragino Kaku Gothic ProN","ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro",メイリオ,Meiryo,"MS ゴシック","MS Gothic",sans-serif;
      }
      .button {
        background-color: #ffffff;
      }
      .button:hover {
        background-color: #eeeeee;
      }
    </style>
    `;
    this.root = document.createElement("div");
    this.overlay = document.createElement("div");
    this.saveButton = document.createElement("div");
    this.saveButton.className = "button";
    setStyle(this.root, {
      position: "fixed",
      zIndex: "2147483647",
      pointerEvents: "none",
    });
    setStyle(this.overlay, {
      position: "absolute",
      top: "0px",
      left: "0px",
      width: "100%",
      height: "100%",
      borderRadius: "8px",
      border: `solid 4px #333333`,
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      margin: "0px",
      padding: "0px",
      boxShadow: `
      0px 0px 0px 3px #ffffff,
      0px 0px 0px 3px #ffffff inset,
      0px 0px 4px 3px rgba(0, 0, 0, 0.4),
      0px 0px 4px 3px rgba(0, 0, 0, 0.4) inset`,
      pointerEvents: "none",
    });
    setStyle(this.saveButton, {
      boxShadow: `0px 0px 4px 0px rgba(0, 0, 0, 0.4)`,
      position: "absolute",
      top: "0px",
      left: "0px",
      borderRadius: "8px",
      padding: "4px",
      fontSize: "18px",
      color: "#333333",
      fontWeight: "bold",
      transform: "translateX(-50%) translateY(-50%)",
      userSelect: "none",
      pointerEvents: "auto",
    });
    document.body.appendChild(this.shadowRoot);
    shadowRoot.appendChild(this.root);
    this.root.appendChild(this.overlay);
    this.root.appendChild(this.saveButton);
    this.hide();
  }
  show(rect: { x: number; y: number; width: number; height: number }) {
    setStyle(this.root, {
      display: "block",
      left: rect.x + "px",
      top: rect.y + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    });
    setStyle(this.saveButton, {
      left: rect.width / 2 + "px",
      top: rect.height / 2 + "px",
    });
  }
  hide() {
    this.root.style.setProperty("display", "none", "important");
  }
  setStatus(status: "ready" | "saving" | "saved" | "failed") {
    if (status === "ready") {
      this.saveButton.innerHTML = "Save";
      setStyle(this.saveButton, { cursor: "pointer" });
    } else if (status === "saving") {
      this.saveButton.innerHTML = "Saving...";
      setStyle(this.saveButton, { cursor: "unset" });
    } else if (status === "saved") {
      this.saveButton.innerHTML = "Complete";
      setStyle(this.saveButton, { cursor: "unset" });
    } else if (status === "failed") {
      this.saveButton.innerHTML = "Failed";
      setStyle(this.saveButton, { cursor: "unset" });
    }
  }
}
function setStyle(element: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.keys(styles).forEach((key) => {
    element.style.setProperty(
      key.replace(
        /[A-Z]+(?![a-z])|[A-Z]/g,
        (c, ofs) => (ofs ? "-" : "") + c.toLowerCase()
      ),
      (styles as any)[key]
    );
  });
}
