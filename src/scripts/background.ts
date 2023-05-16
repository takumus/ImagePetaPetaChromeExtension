import { Messages } from "@/backgroundMessages";
import { sendToApp } from "@/scripts/sendToApp";

let order: { urls: string[]; referrer: string } | undefined;
const messageFunctions: Messages = {
  async orderSave(urls, referrer) {
    order = {
      urls,
      referrer,
    };
  },
};
async function inject(tabId: number) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["./scripts/client.mjs"],
    });
  } catch {
    //
  }
}
chrome.tabs.onActivated.addListener((info) => {
  inject(info.tabId);
});
chrome.tabs.onUpdated.addListener((tabId) => {
  inject(tabId);
});
chrome.runtime.onMessage.addListener((request, _, response) => {
  console.log(`type: ${request.type}, args:`, request.args);
  (messageFunctions as any)[request.type](...request.args).then((res: any) => {
    console.log(`res:`, res);
    response(res);
  });
  return true;
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save") {
    if (order === undefined) {
      return;
    }
    const { urls, referrer } = order;
    order = undefined;
    try {
      const result = await sendToApp("importFiles", [
        [
          ...urls.map(
            (url: string) =>
              ({
                type: "url",
                referrer: referrer,
                url,
              } as const)
          ),
        ],
      ]);
      console.log("imported:", result);
    } catch {
      //
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save",
      title: "画像を保存",
      contexts: ["all"],
    });
  });
});
async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
