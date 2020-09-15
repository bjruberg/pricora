import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import autoprefixer from 'autoprefixer'
import cssimport from 'postcss-import'
import tailwindcss from 'tailwindcss'

const extensions = [ '.js', '.jsx', '.ts', '.tsx' ];

const name = 'RollupTypeScriptBabel';

const isProduction = process.env.NODE_ENV === 'production';

export default (CLIArgs) => {
	const bundle = {
		cache: true,
		input: './client/src/index.tsx',

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

			// Serve bundled files
			!isProduction ? serve({ contentBase: [ './client/dist' ] }) : null,

      // Create an index.html file in dist
      html(),
      
      // Preliminary attemt to reach compatiblity with react libs
      alias({
        entries: [
          { find: 'react', replacement: 'preact/compat' },
          { find: 'react-dom', replacement: 'preact/compat' }
        ]
			}),
			
			postcss({
				plugins: [autoprefixer, cssimport, tailwindcss]
			})	
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
