import { IpcFunctions } from "imagepetapeta-beta/src/commons/ipc/ipcFunctions";

import { APP_HOST } from "@/deines";

export async function sendToApp<U extends keyof IpcFunctions>(
  event: U,
  ...args: Parameters<IpcFunctions[U]>
): Promise<Awaited<ReturnType<IpcFunctions[U]>>> {
  const response = await fetch(APP_HOST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event,
      args,
    }),
  });
  return response.json();
}
