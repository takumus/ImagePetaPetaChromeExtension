import { ImportFileAdditionalData } from "imagepetapeta-beta/src/commons/datas/importFileGroup";
import { PageDownloaderData } from "imagepetapeta-beta/src/commons/datas/pageDownloaderData";

export interface MessagesToBackground {
  orderSave: (
    urls: string[],
    referrer: string,
    ua: string,
    additional?: ImportFileAdditionalData,
  ) => Promise<void>;
  capture: (
    url: string,
    rect?: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) => Promise<string[] | undefined>;
  save: () => Promise<string[] | undefined>;
  setRightClickEnable: (value: boolean) => Promise<void>;
  getRightClickEnable: () => Promise<boolean>;
  getInjectId: () => Promise<string>;
  clearImageURLs: () => Promise<void>;
  addImageURLs: (urls: PageDownloaderData) => Promise<void>;
  saveAll: () => Promise<void>;
}
export interface MessagesToContent {
  openMenu: () => Promise<void>;
  requestImageURLs: () => Promise<void>;
}
