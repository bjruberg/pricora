import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import { config } from "node-config-ts";
import commonjs from '@rollup/plugin-commonjs';
import html, { makeHtmlAttributes } from '@rollup/plugin-html';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve';
import visualizer from 'rollup-plugin-visualizer';
import autoprefixer from 'autoprefixer'
import cssimport from 'postcss-import'
import tailwindcss from 'tailwindcss'

const extensions = [ '.js', '.jsx', '.ts', '.tsx' ];

const name = 'RollupTypeScriptBabel';

const isProduction = process.env.NODE_ENV === 'production';

const htmlTemplate = ({ attributes, files, meta, publicPath, title }) => {
	
  const scripts = (files.js || [])
    .map(({ fileName }) => {
      const attrs = makeHtmlAttributes(attributes.script);
      return `<script src="${publicPath}${fileName}"${attrs}></script>`;
    })
    .join("\n");

  const links = (files.css || []).map(({ fileName }) => {
      return `<link href="${publicPath}${fileName}" rel="stylesheet">`;
    })
    .join("\n");

  const metas = meta
    .map((input) => {
      const attrs = makeHtmlAttributes(input);
      return `<meta${attrs}>`;
    })
    .join("\n");

  return `
<!doctype html>
<html${makeHtmlAttributes(attributes.html)}>
	<head>
		${scripts}
		<link rel="preload" href="i18n/${config.language}.json" as="fetch" >
    ${metas}
    <title>${title}</title>
    ${links}
  </head>
  <body>
    
  </body>
</html>`;
}

export default (CLIArgs) => {
	const bundle = {
		cache: true,
		input: './client/src/app.tsx',

		// Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
		// https://rollupjs.org/guide/en/#external
		external: [],

		plugins: [
			// Allows node_modules resolution
			resolve({ extensions }),

			// Allow bundling cjs modules. Rollup doesn't understand cjs
			commonjs(),

			// Compile TypeScript/JavaScript files
			babel({
				extensions,
				babelHelpers: 'bundled',
				include: [ 'client/src/**/*' ]
			}),

      // Create an index.html file in dist
			html({ title: "Pricora", publicPath: config.server.hostname + "/", attributes: { 
					html: {
						lang: config.language,
					},
				},
				template: htmlTemplate
			}),
      
      // Preliminary attemt to reach compatiblity with react libs
      alias({
        entries: [
          { find: 'react', replacement: 'preact/compat' },
          { find: 'react-dom', replacement: 'preact/compat' }
        ]
			}),
			
			postcss({
				plugins: [cssimport, tailwindcss, autoprefixer]
			}),
			
			injectProcessEnv({ 
				NODE_ENV: process.env.NODE_ENV,
				hostname: config.server.hostname,
				language: config.language,
			 }),
			 
			 isProduction ? undefined : visualizer()
		],

		output: [
			{
				file: 'client/dist/bundle.esm.js',
				format: 'es',
				globals: {}
			}
		],

		watch: {
			buildDelay: 2000
		}
	};

	return bundle;
};
