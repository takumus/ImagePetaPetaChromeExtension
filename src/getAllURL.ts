import { getData } from "@/content/imageParser";
import { MessagesToContent } from "@/messages";
import { sendToBackground } from "@/sendToBackground";

console.log("impt allimage injected:", location.href);
const messageFunctions: MessagesToContent = {
  openMenu: async () => {
    //
  },
  requestImageURLs: async () => {
    sendToBackground(
      "addImageURLs",
      Array.from(
        new Set(
          getData()
            .map((d) => d.urls)
            .reduce<string[]>((p, c) => [...p, ...c], []),
        ),
      ),
      location.href,
    );
  },
};
chrome.runtime.onMessage.addListener((request, _, response) => {
  (messageFunctions as any)[request.type](...request.args).then((res: any) => {
    response({
      value: res,
    });
  });
  return true;
});
