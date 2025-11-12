import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    plugins: [],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
    build: {
        outDir: "dist-server", // Output to dist-server directory
        sourcemap: false,
        emptyOutDir: true,
        lib: {
            entry: {
                index: path.resolve(__dirname, "src/index.ts"),
            },
            formats: ["es"], // Use ES modules instead of CommonJS
            fileName: (format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
            external: [
                // Only externalize Node.js built-ins - everything else gets bundled
                /^node:/,
            ],
            output: {
                format: "es", // Ensure ES module output
                inlineDynamicImports: true,
            },
        },
        target: `node${process.versions.node.split(".")[0]}`,
        ssr: true,
        minify: true, // Keep unminified for easier debugging
    },
});
