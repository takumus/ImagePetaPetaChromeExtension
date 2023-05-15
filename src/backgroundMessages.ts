export interface Messages {
  enable: () => Promise<void>;
  save: (urls: string[], referrer: string) => Promise<string[]>;
}
