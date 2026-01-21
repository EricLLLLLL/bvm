import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'BVM',
			description: 'The native, zero-dependency version manager for Bun.',
			social: [
				{ label: 'GitHub', href: 'https://github.com/EricLLLLLL/bvm', icon: 'github' },
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						// Each item here is a folder or file in src/content/docs
						{ label: 'Getting Started', link: '/guides/getting-started/' },
					],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
				},
			],
			customCss: [
				// Relative path to your custom CSS file
				'./src/styles/custom.css',
			],
		}),
	],
});