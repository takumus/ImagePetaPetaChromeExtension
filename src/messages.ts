import { ImportFileAdditionalData } from "imagepetapeta-beta/src/commons/datas/importFileGroup";

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
}
export interface MessagesToContent {
  openMenu: () => Promise<void>;
}
