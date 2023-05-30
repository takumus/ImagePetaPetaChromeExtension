import { manifest } from "./src/manifest";
import { writeFileSync } from "fs";
import { resolve } from "path";

writeFileSync(
  resolve("./dist/manifest.json"),
  JSON.stringify(manifest, undefined, 2)
);
