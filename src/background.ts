import { post } from "./post";

chrome.runtime.onMessage.addListener((request, _, response) => {
  console.log(request);
  (async () => {
    if (request.type === "enable") {
      console.log("enable");
      const tab = await getCurrentTab();
      chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ["./js/client.mjs"],
      });
    } else if (request.type === "save") {
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
    }
  })();
  return true;
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
