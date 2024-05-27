import { pinterest } from "@/content/drivers/pinterest";
import { twitter } from "@/content/drivers/twitter";

// export const urlDrivers = [pinterest, twitter];
export function transFormURLs(urls: string[]) {
  return [pinterest, twitter].reduce<string[]>((urls, driver) => driver(urls), urls);
}
