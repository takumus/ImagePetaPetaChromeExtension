export interface Messages {
  orderSave: (urls: string[], referrer: string) => Promise<void>;
}
