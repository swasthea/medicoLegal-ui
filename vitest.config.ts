import { defineConfig } from "vitest/config";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@shared": resolve(__dirname, "./src/shared"),
			"@entities": resolve(__dirname, "./src/entities"),
			"@pages": resolve(__dirname, "./src/pages"),
		},
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		globals: true,
		css: false,
	},
});
