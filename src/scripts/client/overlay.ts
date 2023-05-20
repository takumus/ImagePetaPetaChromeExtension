export class Overlay {
  private overlay: HTMLElement;
  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.style.position = "fixed";
    this.overlay.style.borderRadius = "6px";
    this.overlay.style.border = `solid 5px #ffffff`;
    this.overlay.style.zIndex = "2147483647";
    this.overlay.style.margin = "0px";
    this.overlay.style.padding = "0px";
    this.overlay.style.pointerEvents = "none";
    this.overlay.style.boxShadow = `
    0px 0px 3px 3px rgba(0, 0, 0, 0.4),
    0px 0px 3px 3px rgba(0, 0, 0, 0.4) inset
    `;
    this.overlay.style.boxSizing = "border-box";
    document.body.appendChild(this.overlay);
    this.hide();
  }
  show(rect: { x: number; y: number; width: number; height: number }) {
    this.overlay.style.left = rect.x + "px";
    this.overlay.style.top = rect.y + "px";
    this.overlay.style.width = rect.width + "px";
    this.overlay.style.height = rect.height + "px";
    this.overlay.style.display = "block";
  }
  hide() {
    this.overlay.style.display = "none";
  }
}
