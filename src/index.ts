import { clientScript } from "./clientScript";
import { post } from "./post";
import { getURLFromHTML } from "imagepetapeta-beta/src/renderer/utils/getURLFromHTML";

chrome.runtime.onMessage.addListener((request, _, response) => {
  const url = getURLFromHTML(request.html);
  if (url === undefined && request.styleURLs.length === 0) {
    return false;
  }
  const urls = [...(url !== undefined ? [url] : []), ...request.styleURLs];
  post("importFiles", [
    [
      ...urls.map(
        (url: string) =>
          ({
            type: "url",
            url,
          } as const)
      ),
    ],
  ])
    .then((ids) => {
      console.log(ids);
      response(ids);
    })
    .catch((reason) => {
      response(undefined);
    });
  return true;
});
chrome.action.onClicked.addListener((tab) => {
  if (!tab.url?.includes("chrome://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: clientScript,
    });
  }
});
