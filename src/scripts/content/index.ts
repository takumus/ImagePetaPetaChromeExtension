import { applyStyle, defaultStyles } from "imagepetapeta-beta/src/renderer/styles/styles";
import { createApp } from "vue";

import { createInjectedDataStore, injectedDataStoreKey } from "@/scripts/content/injectedData";

import App from "@/src/scripts/content/components/Index.vue";

applyStyle(defaultStyles.dark);
(async () => {
  const app = createApp(App);
  const injectedDataStore = await createInjectedDataStore();
  app.provide(injectedDataStoreKey, injectedDataStore);
  app.mount(injectedDataStore.domApp);
})();
