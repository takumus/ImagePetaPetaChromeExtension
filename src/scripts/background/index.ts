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
  },
  async save() {
    return await save();
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
    response({
      value: res,
    });
  });
  return true;
});
async function save(): Promise<string[] | undefined> {
  if (order === undefined) {
    return undefined;
  }
  const { urls, referrer, additionalData } = order;
  order = undefined;
  try {
    const appInfo = await new Promise<AppInfo>((res, rej) => {
      sendToApp("getAppInfo").then(res).catch(rej);
      setTimeout(rej, 500);
    });
    const version = appInfo.chromeExtensionVersion ?? 0;
    if (version > CHROME_EXTENSION_VERSION) {
      await _alert(
        "拡張機能が古いです。\n拡張機能をアップデートしてください。"
      );
      return undefined;
    } else if (version < CHROME_EXTENSION_VERSION) {
      await _alert("アプリが古いです。\nアプリをアップデートしてください。");
      return undefined;
    }
  } catch {
    await _alert("ImagePetaPetaを起動してください。");
    return undefined;
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
    return result;
  } catch {
    //
  }
  return undefined;
}
async function _alert(message: string) {
  const tabId = (
    await chrome.tabs.query({ currentWindow: true, active: true })
  )[0]?.id;
  if (tabId === undefined) {
    return;
  }
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (message: string) => {
      alert(message);
    },
    args: [message],
  });
}
