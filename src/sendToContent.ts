import { ContentMessages } from "@/contentMessages";

export function sendToContent<U extends keyof ContentMessages>(
  tabId: number,
  type: U,
  ...args: Parameters<ContentMessages[U]>
): ReturnType<ContentMessages[U]> {
  return new Promise((res, rej) => {
    try {
      chrome.tabs.sendMessage(
        tabId,
        {
          type,
          args,
        },
        (data) => {
          res(data.value);
        }
      );
    } catch (err) {
      // rej(err);
    }
  }) as any;
}
