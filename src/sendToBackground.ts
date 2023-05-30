import { BackgroundMessages } from "@/backgroundMessages";

export function sendToBackground<U extends keyof BackgroundMessages>(
  type: U,
  ...args: Parameters<BackgroundMessages[U]>
): ReturnType<BackgroundMessages[U]> {
  return new Promise((res, rej) => {
    try {
      chrome.runtime.sendMessage(
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
