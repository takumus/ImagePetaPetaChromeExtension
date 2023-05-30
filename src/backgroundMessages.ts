import { ImportFileAdditionalData } from "imagepetapeta-beta/src/commons/datas/importFileGroup";

export interface BackgroundMessages {
  orderSave: (
    urls: string[],
    referrer: string,
    additional?: ImportFileAdditionalData
  ) => Promise<void>;
  capture: (rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => Promise<string[] | undefined>;
  save: () => Promise<string[] | undefined>;
  setEnable: (value: boolean) => Promise<void>;
  getEnable: () => Promise<boolean>;
}
