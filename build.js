const { build } = require("esbuild");
const fs = require("fs");

const outfile = "./dist/contract.js";

(async () => {
  await build({
    entryPoints: ["src/index.ts"],
    outfile,
    format: "esm",
    bundle: true
  });

  let src = fs.readFileSync(outfile).toString();

  src = src.replace("async function handle", "export async function handle");
  src = src.replace("export {\n  handle\n};\n", "");

  fs.writeFileSync(outfile, src);
})();
