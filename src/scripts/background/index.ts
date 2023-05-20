import { Messages } from "@/backgroundMessages";
import { sendToApp } from "@/commons/sendToApp";
import {
  ImportFileAdditionalData,
  ImportFileGroup,
} from "imagepetapeta-beta/src/commons/datas/importFileGroup";

let order:
  | {
      urls: string[];
      referrer: string;
      additionalData?: ImportFileAdditionalData;
    }
  | undefined;
let enabled = false;
const messageFunctions: Messages = {
  async orderSave(urls, referrer, additionalData) {
    order = {
      urls,
      referrer,
      additionalData,
    };
  },
  async setEnable(value) {
    enabled = value;
    chrome.contextMenus.removeAll(() => {
      if (value) {
        chrome.contextMenus.create({
          id: "save",
          title: "画像を保存",
          contexts: ["all"],
        });
      }
    });
  },
  async getEnable() {
    return enabled;
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
    const { urls, referrer, additionalData } = order;
    order = undefined;
    try {
      await new Promise((res, rej) => {
        sendToApp("getAppInfo").then(res);
        setTimeout(rej, 1000);
      });
    } catch {
      if (tab?.id) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            alert("ImagePetaPetaを起動してください。");
          },
        });
      }
    }
    try {
      const result = await sendToApp("importFiles", [
        [
          ...urls.map(
            (url: string) =>
              ({
                type: "url",
                referrer: referrer,
                url,
                additionalData,
              } as ImportFileGroup[number])
          ),
        ],
      ]);
      console.log("imported:", result);
    } catch {
      //
    }
  }
});

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.removeAll(() => {
//     chrome.contextMenus.create({
//       id: "save",
//       title: "画像を保存",
//       contexts: ["all"],
//     });
//   });
// });
