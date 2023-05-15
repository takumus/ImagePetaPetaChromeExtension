import { IpcFunctions } from "imagepetapeta-beta/src/commons/ipc/ipcFunctions";

export async function post<U extends keyof IpcFunctions>(
  event: U,
  ...args: Parameters<IpcFunctions[U]>
): Promise<Awaited<ReturnType<IpcFunctions[U]>>> {
  const response = await fetch("http://localhost:51915/", {
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
