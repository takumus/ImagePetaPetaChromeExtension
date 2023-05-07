import { post } from "./post";

chrome.runtime.onMessage.addListener((request, _, response) => {
  console.log(request);
  post("importFiles", [
    [
      ...request.urls.map(
        (url: string) =>
          ({
            type: "url",
            referrer: request.referrer,
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
      files: ["./js/client.mjs"],
    });
    // console.log(chrome.devtools.inspectedWindow);
    // chrome.devtools.network.onRequestFinished.addListener((request) => {
    //   console.log(request);
    // });
  }
});
