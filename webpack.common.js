import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import { fileURLToPath } from 'url';
import path from 'path';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function configure(params) {
    return {
        target: 'web',
        entry: {
            app: ['./src/index.tsx'],
        },
        output: {
            path: params.buildDir,
            filename: '[name].js',
            chunkFilename: 'static/js/[name].[contenthash].js',
            assetModuleFilename: 'static/assets/[name].[contenthash].[ext]',
            webassemblyModuleFilename: 'static/wasm/[hash].wasm',
            clean: true,
            publicPath: '/umbraperf/',
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.wasm', '.mjs'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: params.tsLoaderOptions,
                },
                {
                    test: /\.css$/,
                    use: [
                        params.extractCss ? MiniCssExtractPlugin.loader : 'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    compileType: 'module',
                                    mode: 'local',
                                    auto: true,
                                    exportGlobals: true,
                                    localIdentName: params.cssIdentifier,
                                    localIdentContext: path.resolve(__dirname, 'src'),
                                },
                            },
                        },
                    ],
                },
                {
                    test: /.*umbra_profiler\.wasm$/,
                    type: 'webassembly/async',
                },
                {
                    test: /\.(png|jpe?g|gif|svg|ico)$/i,
                    loader: 'file-loader',
                    options: {
                        name: 'static/img/[name].[contenthash].[ext]',
                    },
                },
                {
                    test: /\.(ttf|eot|woff|woff2)$/,
                    loader: 'file-loader',
                    options: {
                        name: 'static/fonts/[name].[contenthash].[ext]',
                    },
                },
                {
                    test: /\.js$/,
                    enforce: 'pre',
                    use: [
                        {
                            loader: 'source-map-loader',
                            options: {
                                filterSourceMappingUrl: (url, resourcePath) => {
                                    if (/\.worker\.js$/i.test(resourcePath)) {
                                        return 'skip';
                                    }

                                    return true;
                                },
                            },
                        },
                    ],
                },
                {
                    test: /site\.webmanifest$/i,
                    loader: 'file-loader',
                    options: {
                        name: 'static/[name].[contenthash].[ext]',
                    },
                },
                {
                    test: /browserconfig\.xml$/i,
                    loader: 'file-loader',
                    options: {
                        name: 'static/[name].[contenthash].[ext]',
                    },
                },
                {
                    test: /\.m?js/,
                    resolve: {
                        fullySpecified: false
                    }
                },
            ],
        },
        optimization: {
            chunkIds: 'deterministic',
            moduleIds: 'deterministic',
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                    },
                    default: {
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: './static/index.html',
                filename: './index.html',
                favicon: './favicon.ico',
            }),
            new MiniCssExtractPlugin({
                filename: './static/css/[id].[contenthash].css',
                chunkFilename: './static/css/[id].[contenthash].css',
            }),
            new MonacoWebpackPlugin()
        ],
        experiments: {
            asyncWebAssembly: true,
        },
    };
}
