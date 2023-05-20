import { getURLFromHTML } from "imagepetapeta-beta/src/renderer/utils/getURLFromHTML";

export function getURLsFromElement(element: HTMLElement) {
  return [
    ...(getURLFromHTML(element.outerHTML) ?? []),
    ...getURLFromStyle(window.getComputedStyle(element)),
  ];
}
function getURLFromStyle(style: CSSStyleDeclaration) {
  const regexp = /url\(['"]?((?:\S*?\(\S*?\))*\S*?)['"]?\)/g;
  return Array.from(
    new Set([
      ...[...style.backgroundImage.matchAll(regexp)].map((v) => v[1]),
      ...[...style.background.matchAll(regexp)].map((v) => v[1]),
    ])
  );
}
