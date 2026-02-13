import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  splitting: false,
  treeshake: true,
  outExtension({ format }) {
    if (format === "esm") return { js: ".mjs" };
    if (format === "cjs") return { js: ".cjs" };
    return { js: ".js" };
  },
  external: ["thai-address-universal"],
  // UMD is handled by a separate build step below
  esbuildOptions(options) {
    options.banner = {
      js: "/* thai-address-universal-autocomplete v1.0.0 | ISC License */",
    };
  },
  onSuccess: async () => {
    // Build UMD bundle using esbuild directly
    const { build } = await import("esbuild");
    await build({
      entryPoints: ["src/index.ts"],
      bundle: true,
      format: "iife",
      globalName: "ThaiAddressAutocomplete",
      outfile: "dist/index.umd.js",
      sourcemap: true,
      minify: true,
      external: ["thai-address-universal"],
      target: "es2020",
      banner: {
        js: "/* thai-address-autocomplete v1.0.0 | MIT License */",
      },
    });
    console.log("UMD bundle built successfully");
  },
});
