import {
  ImportFileAdditionalData,
  ImportFileGroup,
} from "imagepetapeta-beta/src/commons/datas/importFileGroup";
import { v4 } from "uuid";

import { InjectedData } from "@/@types/injectedData";
import { _alert } from "@/background/alert";
import { checkApp } from "@/background/checkApp";
import { getCurrentTab } from "@/background/getCurrentTab";
import { sendToApp } from "@/commons/sendToApp";
import { MessagesToBackground } from "@/messages";
import { sendToContent } from "@/sendToContent";

let order:
  | {
      urls: string[];
      referrer: string;
      ua: string;
      additionalData?: ImportFileAdditionalData;
    }
  | undefined;
let enabled = false;
type MessagesToBackgroundType = {
  [P in keyof MessagesToBackground]: (
    event: chrome.runtime.MessageSender,
    ...args: Parameters<MessagesToBackground[P]>
  ) => ReturnType<MessagesToBackground[P]>;
};
const injectId = v4();
const messageFunctions: MessagesToBackgroundType = {
  async orderSave(sender, urls, referrer, ua, additionalData) {
    order = {
      urls,
      referrer,
      ua,
      additionalData,
    };
  },
  async setRightClickEnable(sender, value) {
    enabled = value;
  },
  async save() {
    if (!(await checkApp())) {
      return undefined;
    }
    if (order === undefined) {
      return undefined;
    }
    const { urls, referrer, additionalData, ua } = order;
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
                ua,
                additionalData,
              }) as ImportFileGroup[number],
          ),
        ],
      ]);
      return result;
    } catch {
      //
    }
    return undefined;
  },
  async getRightClickEnable() {
    return enabled;
  },
  async capture(sender, url, rect) {
    if (!(await checkApp())) {
      return undefined;
    }
    if (sender.tab === undefined) {
      return;
    }
    let imageDataURL = await chrome.tabs.captureVisibleTab(sender.tab.windowId, {
      quality: 100,
      format: "png",
    });
    if (rect !== undefined) {
      const imageBitmap = await createImageBitmap(await fetch(imageDataURL).then((r) => r.blob()));
      const x = Math.floor(rect.x * imageBitmap.width);
      const y = Math.floor(rect.y * imageBitmap.height);
      const width = Math.floor(rect.width * imageBitmap.width);
      const height = Math.floor(rect.height * imageBitmap.height);
      const canvas = new OffscreenCanvas(width, height);
      canvas.getContext("2d")?.drawImage(imageBitmap, -x, -y);
      imageDataURL = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = async () => {
          res(reader.result as string);
        };
        canvas.convertToBlob({ quality: 100 }).then(reader.readAsDataURL.bind(reader));
      });
    }
    return await sendToApp("importFiles", [
      [
        {
          type: "url",
          url: imageDataURL,
          additionalData: {
            name: "capture",
            note: url,
          },
        },
      ] as ImportFileGroup,
    ]);
  },
  async getInjectId() {
    return injectId;
  },
  async addImageURLs(_event, urls, pageURL) {
    console.log(pageURL, urls);
  },
  async clearImageURLs(event) {
    //
  },
};
async function inject(tabId: number) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (injectId) => {
        if ((window as any)[injectId] !== undefined) {
          return false;
        }
        (window as any)[injectId] = {};
        return true;
      },
      args: [injectId],
    });
    if (!result) {
      return;
    }
    const style = await (await fetch(chrome.runtime.getURL("content/assets/index.css"))).text();
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (injectId: string, styleString: string) => {
        const root = document.createElement("div");
        const rootShadow = root.attachShadow({ mode: "closed" });
        const app = document.createElement("div");
        const style = document.createElement("style");
        style.innerHTML = styleString;
        style.style.display = "none";
        rootShadow.append(style);
        rootShadow.append(app);
        document.body.append(root);
        const injectedData = (window as any)[injectId] as InjectedData;
        injectedData.domApp = app;
        injectedData.domRoot = root;
      },
      args: [injectId, style],
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["./content/assets/index.js"],
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
chrome.runtime.onMessage.addListener((request, sender, response) => {
  // console.log(request, sender);
  (messageFunctions as any)[request.type](sender, ...request.args).then((res: any) => {
    // console.log(`res:`, res);
    response({
      value: res,
    });
  });
  return true;
});
chrome.commands.onCommand.addListener(async (command, tab) => {
  switch (command) {
    case "openMenu":
      if (tab.id !== undefined) {
        sendToContent(tab.id, "openMenu");
      }
      break;
    case "reload":
      chrome.runtime.reload();
      break;
  }
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case "saveImage":
      if (tab?.id !== undefined) {
        sendToContent(tab.id, "openMenu");
      }
      break;
    case "getAllImage":
      if (tab?.id !== undefined) {
        console.log("GAI");
        sendToContent(tab.id, "requestImageURLs");
      }
      break;
  }
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "saveImage",
    contexts: ["all"],
    title: "Save Images",
  });
  chrome.contextMenus.create({
    id: "getAllImage",
    contexts: ["all"],
    title: "Get All Images",
  });
});

// const style = await (
//   await fetch(chrome.runtime.getURL("popup/assets/index-BGiOXsqW.css"))
// ).text();
