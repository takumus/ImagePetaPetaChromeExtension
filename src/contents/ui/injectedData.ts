import { InjectionKey, readonly, ref } from "vue";

import { InjectedData } from "@/@types/injectedData";
import { sendToBackground } from "@/sendToBackground";

export async function createInjectedDataStore(injectData: InjectedData) {
  return injectData;
}
export type InjectedDataStore = Awaited<ReturnType<typeof createInjectedDataStore>>;
export const injectedDataStoreKey: InjectionKey<InjectedDataStore> = Symbol("InjectedDataStore");
