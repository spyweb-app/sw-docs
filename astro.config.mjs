import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import unocss from '@unocss/astro';

export default defineConfig({
  integrations: [
    unocss({ injectReset: false }),
    starlight({
      title: 'SpyWeb Docs',
      favicon: '/favicon.png',
      components: {
        Header: './src/components/Header.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/anomalyco/spyweb' },
      ],
      sidebar: [
        { label: 'Home', link: '/' },
        {
          label: 'CLI & Operations',
          items: [
            { autogenerate: { directory: 'cli-and-operations' } },
          ],
        },
        {
          label: 'Job Configuration',
          items: [
            { autogenerate: { directory: 'job-configuration' } },
          ],
        },
        {
          label: 'Lua Scripting',
          items: [
            { autogenerate: { directory: 'lua-scripting' } },
          ],
        },
        {
          label: 'Hook Reference',
          items: [
            { autogenerate: { directory: 'hook-reference' } },
          ],
        },
        {
          label: 'Advanced Features',
          items: [
            { autogenerate: { directory: 'advanced-features' } },
          ],
        },
        {
          label: 'Lua Globals',
          items: [
            { autogenerate: { directory: 'lua-globals' } },
          ],
        },
      ],
    }),
  ],
});
