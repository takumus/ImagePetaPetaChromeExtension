import { Messages } from "@/backgroundMessages";

export function sendToBackground<U extends keyof Messages>(
  type: U,
  ...args: Parameters<Messages[U]>
): ReturnType<Messages[U]> {
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
