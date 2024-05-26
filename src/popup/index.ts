import { applyStyle, defaultStyles } from "imagepetapeta-beta/src/renderer/styles/styles";
import { createApp } from "vue";

import App from "@/popup/VIndex.vue";

applyStyle(defaultStyles.dark);
createApp(App).mount("#app");
