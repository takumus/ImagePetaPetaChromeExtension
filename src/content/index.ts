import { applyStyle, defaultStyles } from "imagepetapeta-beta/src/renderer/styles/styles";
import { createApp } from "vue";

import App from "@/content/components/VIndex.vue";
import { createInjectedDataStore, injectedDataStoreKey } from "@/content/injectedData";

applyStyle(defaultStyles.dark);
(async () => {
  const app = createApp(App);
  const injectedDataStore = await createInjectedDataStore();
  app.provide(injectedDataStoreKey, injectedDataStore);
  app.mount(injectedDataStore.domApp);
})();
