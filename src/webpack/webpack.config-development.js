const path = require('path');
const webpack = require('webpack');

const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyAssets = require('./CopyAssets');


const PROJECT_ROOT_PATH = path.resolve(__dirname, '../../');
const ASSET_PATH = 'assets';

const PACKAGE_NAMES='deskpro+apps react';
const artifactName = (baseName) => PACKAGE_NAMES.replace(/\+/, '').split(' ').concat([baseName]).join('-');

const copyWebpackPlugin = CopyAssets.copyWebpackPlugin(null);
const extractCssPlugin = new ExtractTextPlugin({ filename: '[name].css', publicPath: `/${ASSET_PATH}/`, allChunks: true });

const configParts = [];
configParts.push({
    devServer: {
        contentBase: path.resolve(PROJECT_ROOT_PATH, 'target'),
        clientLogLevel: 'warning',
        hot: true,
        historyApiFallback: true,
        port: 31080,
        publicPath: `/${ASSET_PATH}/`,
        watchContentBase: true
    },
    devtool: 'eval-source-map',
    entry: {
        main: [
            `webpack-dev-server/client?http://localhost:31080`,
            path.resolve(PROJECT_ROOT_PATH, 'src/webpack/entrypoint.js')
        ],
        vendor: ['react', 'react-dom', 'semantic-ui-react']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(PROJECT_ROOT_PATH, 'src/main/javascript'),
                ]
            },
            {
                test: /\.css$/,
                use: extractCssPlugin.extract({ use: ['style-loader', 'css-loader'] })
            },
            {
                include: [ path.resolve(PROJECT_ROOT_PATH, 'src/main/sass') ],
                loader: extractCssPlugin.extract({ use: ['css-loader', 'sass-loader'] }),
                test: /\.scss$/
            },
            { test: require.resolve('react'), loader: 'expose-loader?React' },
            { test: require.resolve('react-dom'), loader: 'expose-loader?ReactDOM' },
            { test: /\.(html?|css)$/, loader: 'raw-loader' }
        ],
        noParse: [
            path.resolve(PROJECT_ROOT_PATH, 'node_modules/xcomponent/dist/xcomponent.js'),
            path.resolve(PROJECT_ROOT_PATH, 'node_modules/post-robot/dist/post-robot.js')
        ]
    },
    output: {
        chunkFilename: `${ASSET_PATH}/[name].js`,
        filename: '[name].js',
        path: path.resolve(PROJECT_ROOT_PATH, 'target'),
        publicPath: `/${ASSET_PATH}/`
    },
    plugins: [
        extractCssPlugin,

        new webpack.DefinePlugin({ DEVELOPMENT: true }),

        new webpack.NamedModulesPlugin(),
        new WebpackChunkHash(),
        new webpack.optimize.CommonsChunkPlugin({ name: ['vendor'], minChunks: Infinity }),
        new ChunkManifestPlugin({ filename: 'chunk-manifest.json', manifestVariable: 'webpackManifest' }),
        //new webpack.optimize.CommonsChunkPlugin({ name: ['vendor', 'manifest'], minChunks: Infinity }),
        //new ChunkManifestPlugin({ filename: artifactName('manifest.json'), manifestVariable: 'DeskproAppsReactManifest' }),

        copyWebpackPlugin,

        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        extensions: ['*', '.js', '.jsx', '.scss', '.css']
    },
    // stats: 'minimal',
    node: { fs: 'empty' },
    bail: true
});

module.exports = Object.assign.apply(Object, configParts);
