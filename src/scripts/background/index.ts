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
    let imageDataURL = await chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      {
        quality: 100,
        format: "png",
      }
    );
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
chrome.runtime.onMessage.addListener((request, sender, response) => {
  // console.log(request, sender);
  (messageFunctions as any)
    [request.type](sender, ...request.args)
    .then((res: any) => {
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
  }
});
