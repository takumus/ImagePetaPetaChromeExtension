import App from "./Index.vue";
import {
  applyStyle,
  defaultStyles,
} from "imagepetapeta-beta/src/renderer/styles/styles";
import { createApp } from "vue";

applyStyle(defaultStyles.dark);
createApp(App).mount("#app");
