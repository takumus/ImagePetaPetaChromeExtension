export function getElementsOnPointer(pointer: { x: number; y: number }) {
  const pointerElement = document.elementFromPoint(
    pointer.x,
    pointer.y
  ) as HTMLElement | null;
  if (pointerElement == null) {
    return undefined;
  }
  const pointerElementRect = pointerElement.getBoundingClientRect();
  const allElements = Array.from(document.querySelectorAll("*")).filter(
    (element) => {
      if (element instanceof HTMLElement) {
        const rect = element.getBoundingClientRect();
        if (
          rect.left < pointer.x &&
          rect.right > pointer.x &&
          rect.top < pointer.y &&
          rect.bottom > pointer.y
        ) {
          return true;
        }
      }
      return false;
    }
  ) as HTMLElement[];
  allElements.sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    const diffA =
      Math.abs(pointerElementRect.left - rectA.left) +
      Math.abs(pointerElementRect.right - rectA.right) +
      Math.abs(pointerElementRect.top - rectA.top) +
      Math.abs(pointerElementRect.bottom - rectA.bottom);
    const diffB =
      Math.abs(pointerElementRect.left - rectB.left) +
      Math.abs(pointerElementRect.right - rectB.right) +
      Math.abs(pointerElementRect.top - rectB.top) +
      Math.abs(pointerElementRect.bottom - rectB.bottom);
    const img =
      (b instanceof HTMLImageElement ? 1 : -1) -
      (a instanceof HTMLImageElement ? 1 : -1);
    return (diffA > diffB ? 0.1 : -0.1) + img;
  });
  return {
    rect: pointerElement,
    element: pointerElement,
    elements: allElements,
  };
}
