#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
server_dir="${project_root}/dist/server"
client_dir="${project_root}/dist/client"
pages_dir="${project_root}/dist/pages"

[[ -f "${server_dir}/index.js" ]] || {
  echo "Missing Cloudflare Worker entry: dist/server/index.js" >&2
  exit 66
}
[[ -f "${server_dir}/__vite_rsc_assets_manifest.js" ]] || {
  echo "Missing RSC assets manifest." >&2
  exit 66
}
[[ -d "${server_dir}/ssr" && -d "${client_dir}" ]] || {
  echo "Missing Vinext server or client build output." >&2
  exit 66
}

rm -rf "${pages_dir}"
mkdir -p "${pages_dir}"

cp -R "${client_dir}/." "${pages_dir}/"
cp "${server_dir}/index.js" "${pages_dir}/_worker.js"
cp \
  "${server_dir}/__vite_rsc_assets_manifest.js" \
  "${pages_dir}/__vite_rsc_assets_manifest.js"
cp -R "${server_dir}/ssr" "${pages_dir}/ssr"

# Pages advanced mode names the entry file _worker.js, while Vinext's generated
# SSR module refers back to the original Worker filename.
node --input-type=module - "${pages_dir}/ssr/index.js" <<'NODE'
import { readFile, writeFile } from "node:fs/promises";

const file = process.argv[2];
const source = await readFile(file, "utf8");
const original = 'import("../index.js")';
if (!source.includes(original)) {
  throw new Error("Could not find the Vinext Worker back-reference.");
}
await writeFile(file, source.replaceAll(original, 'import("../_worker.js")'));
NODE

# Vinext writes a temporary Worker deploy redirect during its build. Pages uses
# the checked-in wrangler.jsonc instead.
rm -f "${project_root}/.wrangler/deploy/config.json"

echo "Prepared Cloudflare Pages output: dist/pages"
