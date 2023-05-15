import { Messages } from "@/backgroundMessages";
import { sendToApp } from "@/scripts/sendToApp";

const messageFunctions: Messages = {
  async enable() {
    const tab = await getCurrentTab();
    chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      files: ["./scripts/client.mjs"],
    });
  },
  async save(urls, referrer) {
    try {
      const result = await sendToApp("importFiles", [
        [
          ...urls.map(
            (url: string) =>
              ({
                type: "url",
                referrer: referrer,
                url,
              } as const)
          ),
        ],
      ]);
      return result;
    } catch {
      return [];
    }
  },
};

chrome.runtime.onMessage.addListener((request, _, response) => {
  console.log(`type: ${request.type}, args: ${request.args}`);
  (messageFunctions as any)[request.type](...request.args).then((res: any) => {
    console.log(`res: ${res}`);
    response(res);
  });
  return true;
});

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
