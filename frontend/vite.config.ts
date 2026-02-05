import { defineConfig } from "vite";
import { isAbsolute, resolve } from "node:path";

const defaultOutDir = resolve(__dirname, "viewer");
const envOutDir = process.env.VITE_BUILD_OUTDIR;
const outDir = envOutDir
  ? isAbsolute(envOutDir)
    ? envOutDir
    : resolve(__dirname, envOutDir)
  : defaultOutDir;

export default defineConfig({
  envDir: resolve(__dirname, ".."),
  base: "./",
  build: {
    outDir,
    emptyOutDir: true,
  },
});
