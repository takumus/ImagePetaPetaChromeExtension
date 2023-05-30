import { sendToApp } from "@/commons/sendToApp";
import { MessagesToBackground } from "@/messages";
import { _alert } from "@/scripts/background/alert";
import { checkApp } from "@/scripts/background/checkApp";
import { getCurrentTab } from "@/scripts/background/getCurrentTab";
import { sendToContent } from "@/sendToContent";
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
const messageFunctions: MessagesToBackground = {
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
    if (!(await checkApp())) {
      return undefined;
    }
    if (order === undefined) {
      return undefined;
    }
    const { urls, referrer, additionalData } = order;
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
                additionalData,
              } as ImportFileGroup[number])
          ),
        ],
      ]);
      return result;
    } catch {
      //
    }
    return undefined;
  },
  async getEnable() {
    return enabled;
  },
  async capture(url, rect) {
    if (!(await checkApp())) {
      return undefined;
    }
    const tab = await getCurrentTab();
    if (tab === undefined) {
      return;
    }
    let imageDataURL = await chrome.tabs.captureVisibleTab(tab.windowId, {
      quality: 100,
      format: "png",
    });
    if (rect !== undefined) {
      const imageBitmap = await createImageBitmap(
        await fetch(imageDataURL).then((r) => r.blob())
      );
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
        canvas
          .convertToBlob({ quality: 100 })
          .then(reader.readAsDataURL.bind(reader));
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
chrome.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "openMenu":
      const tabId = (await getCurrentTab())?.id;
      if (tabId === undefined) {
        return;
      }
      sendToContent(tabId, "openMenu");
      break;
  }
});
