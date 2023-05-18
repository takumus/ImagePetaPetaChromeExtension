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
        res
      );
    } catch (err) {
      // rej(err);
    }
  }) as any;
}
