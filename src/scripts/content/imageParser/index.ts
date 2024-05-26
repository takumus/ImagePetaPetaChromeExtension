import { getURLsFromElement } from "@/scripts/content/imageParser/getURLsFromElement";

export interface ImageParserResult {
  element: HTMLElement;
  rect: DOMRect;
  urls: string[];
  depth: number;
}

export function getData(pointer: { x: number; y: number }) {
  const elements = Array.from(document.querySelectorAll("*")) as HTMLElement[];
  function getDepth(element: HTMLElement) {
    let parent: HTMLElement | null = element.parentElement;
    let depth = 0;
    while (parent !== null) {
      parent = parent?.parentElement;
      depth++;
    }
    return depth;
  }
  const results: ImageParserResult[] = elements
    .map((element) => ({
      element,
      rect: element.getBoundingClientRect(),
      urls: getURLsFromElement(element),
      depth: getDepth(element),
    }))
    .filter((res) => {
      const rect = res.rect;
      const isInRect =
        rect.left < pointer.x &&
        rect.right > pointer.x &&
        rect.top < pointer.y &&
        rect.bottom > pointer.y;
      const hasURL = res.urls.length > 0;
      return isInRect && hasURL;
    })
    .sort((a, b) => b.depth - a.depth);
  return results;
}
