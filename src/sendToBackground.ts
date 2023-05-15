import { Messages } from "@/backgroundMessages";

export function sendToBackground<U extends keyof Messages>(
  type: U,
  ...args: Parameters<Messages[U]>
): ReturnType<Messages[U]> {
  return new Promise((res) => {
    chrome.runtime.sendMessage(
      {
        type,
        args,
      },
      res
    );
  }) as any;
}
