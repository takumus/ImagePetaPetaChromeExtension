export const manifest: chrome.runtime.Manifest = {
  name: "ImagePetaPeta",
  action: {
    default_title: "ImagePetaPeta",
    default_icon: "icon48.png",
    default_popup: "popup/index.html",
  },
  manifest_version: 3,
  version: "1.0.0",
  description: "ImagePetaPeta",
  permissions: ["tabs", "scripting", "contextMenus"],
  host_permissions: ["<all_urls>"],
  background: {
    service_worker: "scripts/background.mjs",
    type: "module",
  },
  icons: {
    "16": "icon16.png",
    "32": "icon32.png",
    "48": "icon48.png",
    "128": "icon128.png",
  },
  commands: {
    openMenu: {
      suggested_key: {
        default: "Alt+S",
        mac: "Shift+Command+S",
      },
      description: "Open Menu",
    },
  },
};
