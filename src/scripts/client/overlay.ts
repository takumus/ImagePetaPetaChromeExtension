export class Overlay {
  private overlay: HTMLElement;
  public saveButton: HTMLDivElement;
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
    this.saveButton = document.createElement("div");
    this.saveButton.style.position = "fixed";
    this.saveButton.style.borderRadius = "6px";
    this.saveButton.style.padding = "4px";
    this.saveButton.style.backgroundColor = "#ffffff";
    this.saveButton.style.zIndex = "2147483647";
    this.saveButton.style.transform = "translateX(-50%) translateY(-50%)";
    this.saveButton.style.boxSizing = "border-box";
    this.saveButton.style.userSelect = "none";
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.saveButton);
    this.hide();
  }
  show(
    rect: { x: number; y: number; width: number; height: number },
    update: boolean
  ) {
    if (!update) {
      this.saveButton.innerHTML = "Save";
      this.saveButton.style.cursor = "pointer";
      this.saveButton.style.display = this.overlay.style.display = "block";
    }
    this.overlay.style.left = rect.x + "px";
    this.overlay.style.top = rect.y + "px";
    this.overlay.style.width = rect.width + "px";
    this.overlay.style.height = rect.height + "px";
    this.saveButton.style.left = rect.x + rect.width / 2 + "px";
    this.saveButton.style.top = rect.y + rect.height / 2 + "px";
  }
  hide() {
    this.saveButton.style.display = this.overlay.style.display = "none";
  }
  saved() {
    this.saveButton.style.cursor = "unset";
    this.saveButton.innerHTML = "Complete!";
  }
}
