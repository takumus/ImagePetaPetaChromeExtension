import { InjectionKey, readonly, ref } from "vue";

import { InjectedData } from "@/@types/injectedData";
import { sendToBackground } from "@/sendToBackground";

export async function createInjectedDataStore() {
  const id = await (async () => {
    try {
      return await sendToBackground("getInjectId");
    } catch {
      const id: InjectedData = {
        domApp: document.querySelector("#app")!,
        domRoot: document.querySelector("#app")?.parentElement!,
        id: "dev",
      };
      id.domApp.style.position = "fixed";
      id.domApp.style.width = "100%";
      id.domApp.style.height = "100%";
      (window as any)["dev"] = id;
      return "dev";
    }
  })();
  const data = (window as any)[id] as InjectedData;
  console.log("impt: injectId=", id);
  console.log("impt: injectData=", data);
  return data;
}
export type InjectedDataStore = Awaited<ReturnType<typeof createInjectedDataStore>>;
export const injectedDataStoreKey: InjectionKey<InjectedDataStore> = Symbol("InjectedDataStore");
