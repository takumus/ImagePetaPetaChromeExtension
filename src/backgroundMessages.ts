import { ImportFileAdditionalData } from "imagepetapeta-beta/src/commons/datas/importFileGroup";

export interface Messages {
  orderSave: (
    urls: string[],
    referrer: string,
    additional?: ImportFileAdditionalData
  ) => Promise<void>;
  save: () => Promise<string[] | undefined>;
  setEnable: (value: boolean) => Promise<void>;
  getEnable: () => Promise<boolean>;
}
