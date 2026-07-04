import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import unocss from "@unocss/astro";

export default defineConfig({
  base: "/",
  integrations: [
    unocss({ injectReset: false }),
    starlight({
      title: "SpyWeb Docs",
      favicon: "/favicon.png",
      customCss: ["./src/styles/main.scss"],
      components: {
        Header: "./src/components/Header.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/spyweb-app/spyweb",
        },
      ],
      sidebar: [
        { label: "Home", link: "/" },
        { label: "Getting Started", link: "/getting-started" },
        { label: "File Structure", link: "/file-structure" },
        {
          label: "Job Configuration",
          items: [{ autogenerate: { directory: "job-configuration" } }],
        },
        { label: "Sandboxing & Security", link: "/security" },
        {
          label: "Hook Reference",
          items: [{ autogenerate: { directory: "hook-reference" } }],
        },
        {
          label: "Lua Globals",
          items: [{ autogenerate: { directory: "lua-globals" } }],
        },
        {
          label: "CLI & Operations",
          link: "/cli-and-operations",
        },
        {
          label: "Browser Automation",
          items: [{ autogenerate: { directory: "browser-automation" } }],
        },
        { label: "Lua Testing", link: "/testing" },
        {
          label: "Examples",
          items: [{ autogenerate: { directory: "examples" } }],
        },
        {
          label: "REST API & Custom Server",
          items: [{ autogenerate: { directory: "api-and-server" } }],
        },
      ],
    }),
  ],
});
