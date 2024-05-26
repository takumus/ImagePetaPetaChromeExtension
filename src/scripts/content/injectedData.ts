import { InjectionKey, readonly, ref } from "vue";

import { InjectedData } from "@/@types/injectedData";
import { sendToBackground } from "@/sendToBackground";

export async function createInjectedDataStore() {
  const id = await sendToBackground("getInjectId");
  const data = (window as any)[id] as InjectedData;
  console.log("impt: injectId=", id);
  console.log("impt: injectData=", data);
  return data;
}
export type InjectedDataStore = Awaited<ReturnType<typeof createInjectedDataStore>>;
export const injectedDataStoreKey: InjectionKey<InjectedDataStore> = Symbol("InjectedDataStore");
