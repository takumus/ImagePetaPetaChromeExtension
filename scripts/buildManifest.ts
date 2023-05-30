import { manifest } from "../src/manifest";
import { writeFileSync } from "fs";
import { resolve } from "path";

console.log("export manifest.json");
writeFileSync(
  resolve("./dist/manifest.json"),
  JSON.stringify(manifest, undefined, 2)
);
