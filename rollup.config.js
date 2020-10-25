import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import { config } from "node-config-ts";
import commonjs from '@rollup/plugin-commonjs';
import html, { makeHtmlAttributes } from '@rollup/plugin-html';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import postcss from 'rollup-plugin-postcss';
import url from '@rollup/plugin-url';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

import visualizer from 'rollup-plugin-visualizer';
import cssnano from "cssnano"
import autoprefixer from 'autoprefixer'
import cssimport from 'postcss-import'
import tailwindcss from 'tailwindcss'

import path from "path";

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

			postcss({
				extract: true,
				extract: path.resolve('client/dist/styles.css'),
				plugins: [cssimport, tailwindcss].concat(isProduction ? [cssnano({ preset: "default"}), autoprefixer] : [])
			}), 

      // Create an index.html file in dist
			html({ title: config.frontend.pageTitle, fileName: "nocache.html", publicPath: config.frontend.hostname + "/", attributes: { 
					html: {
						lang: config.frontend.language,
					},
				},
				meta: [{ charset: 'utf-8' }, { name: "viewport", content: "width=device-width,initial-scale=1,minimum-scale=1.0,maximum-scale=1.0"}],
				template: htmlTemplate
			}),
      
      // Preliminary attemt to reach compatiblity with react libs
      alias({
        entries: [
          { find: 'react', replacement: 'preact/compat' },
          { find: 'react-dom', replacement: 'preact/compat' }
        ]
			}),
			
			injectProcessEnv({ 
				NODE_ENV: process.env.NODE_ENV,
				...config.frontend,
			 }),

			 isProduction ? terser() : undefined,

			 url({ limit: 300, destDir: "client/dist/assets", fileName:"[name][extname]", publicPath: config.frontend.hostname + "/assets/" }), 
			 
			 // visualizer()
		],

		output: [
			{
				entryFileNames: isProduction ? "[name]-[hash].js" : "[name].js",
				dir: 'client/dist/',
				format: 'es',
				globals: {},
				minifyInternalExports: isProduction,
			}
		],

		manualChunks(id) {
			if (id.includes('node_modules')) {
				// Return the directory name following the last `node_modules`.
				// Usually this is the package, but it could also be the scope.
				const dirs = id.split(path.sep);
				return dirs[dirs.lastIndexOf('node_modules') + 1];
			}
		},

		watch: {
			buildDelay: 500,
			exclude: ['node_modules/**']
		}
	};

	return bundle;
};
