import { Messages } from "@/backgroundMessages";
import { sendToApp } from "@/commons/sendToApp";
import { AppInfo } from "imagepetapeta-beta/src/commons/datas/appInfo";
import {
  ImportFileAdditionalData,
  ImportFileGroup,
} from "imagepetapeta-beta/src/commons/datas/importFileGroup";
import { CHROME_EXTENSION_VERSION } from "imagepetapeta-beta/src/commons/defines";

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
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        if ((window as any)["imagepetapeta-extension"] === true) {
          return false;
        }
        (window as any)["imagepetapeta-extension"] = true;
        return true;
      },
    });
    if (!result) {
      return;
    }
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
  // console.log(`type: ${request.type}, args:`, request.args);
  (messageFunctions as any)[request.type](...request.args).then((res: any) => {
    // console.log(`res:`, res);
    response(res);
  });
  return true;
});
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const tabId = tab?.id;
  if (tabId === undefined) {
    return;
  }
  if (info.menuItemId === "save") {
    if (order === undefined) {
      return;
    }
    const { urls, referrer, additionalData } = order;
    order = undefined;
    try {
      const appInfo = await new Promise<AppInfo>((res, rej) => {
        sendToApp("getAppInfo").then(res).catch(rej);
        setTimeout(rej, 1000);
      });
      const version = appInfo.chromeExtensionVersion ?? 0;
      if (version > CHROME_EXTENSION_VERSION) {
        await _alert(
          "拡張機能が古いです。\n拡張機能をアップデートしてください。",
          tabId
        );
        return;
      } else if (version < CHROME_EXTENSION_VERSION) {
        await _alert(
          "アプリが古いです。\nアプリをアップデートしてください。",
          tabId
        );
        return;
      }
    } catch {
      await _alert("ImagePetaPetaを起動してください。", tabId);
      return;
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
async function _alert(message: string, tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (message: string) => {
      alert(message);
    },
    args: [message],
  });
}
// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.removeAll(() => {
//     chrome.contextMenus.create({
//       id: "save",
//       title: "画像を保存",
//       contexts: ["all"],
//     });
//   });
// });
