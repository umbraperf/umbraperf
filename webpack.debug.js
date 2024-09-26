import { configure } from './webpack.common.js';
import { fileURLToPath } from 'url';
import path from 'path';
import WasmPackPlugin from '@wasm-tool/wasm-pack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const base = configure({
    buildDir: path.resolve(__dirname, './build/debug'),
    tsLoaderOptions: {
        compilerOptions: {
            configFile: './tsconfig.json',
        },
    },
    cssIdentifier: '[local]_[hash:base64]',
});

export default {
    ...base,
    output: {
        ...base.output,
    },
    mode: 'development',
    watchOptions: {
        ignored: ['node_modules/**', 'dist/**'],
    },
    performance: {
        hints: false,
    },
    devServer: {
        historyApiFallback: true,
        compress: true,
        port: 9002,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
    },
    plugins: [
        ...base.plugins,
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, 'crate'),
            args: '--log-level info',
            outDir: path.resolve(__dirname, 'crate', 'pkg'),
            outName: 'shell',
            forceMode: 'development',
        }),
    ],
};
