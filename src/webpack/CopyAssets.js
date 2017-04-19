"use strict";

const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const PROJECT_ROOT_PATH = path.resolve(__dirname, '../../');

/**
 * @param {String} destination
 * @return {Function}
 */
function createTransformHtml(destination) {

  const replacements = [
    {
      pattern: '(https?:)?//unpkg.com/react/dist/react.min.js'.replace('.', '\.'),
      replacement: destination == 'dist' ? '//unpkg.com/react@15.5.3/dist/react.min.js' : '../assets/react.js'
    },
    {
      pattern: '(https?:)?//unpkg.com/react-dom/dist/react-dom.min.js'.replace('.', '\.'),
      replacement: destination == 'dist' ? '//unpkg.com/react-dom@15.5.3/dist/react-dom.min.js' : '../assets/react-dom.js'
    },
    {
      pattern: '(https?:)?//unpkg.com/deskproapps-sdk-react/dist/deskproapps-sdk-react.min.js'.replace('.', '\.'),
      replacement: destination == 'dist' ? '../assets/deskproapps-sdk-react.js' : '../assets/deskproapps-sdk-react.js'
    }
  ];

  /**
   * @param {Buffer} content
   * @param {String} path
   * @return {Buffer}
   */
  return function (content, path) {
    let replacedContent = content.toString();
    for (const replacement of replacements) {
      replacedContent = replacedContent.replace(new RegExp(replacement.pattern), replacement.replacement)
    }

    return new Buffer(replacedContent, 'utf8');
  };
}

/**
 * @return {[*,*]}
 */
function getCopyPatterns(destination)
{
  if (-1 === ['dist','target'].indexOf(destination)) {
    throw new Error('destination must one of: dist, target');
  }
  // patterns for copying static files from the app's source
  const patterns = [
    {
      from: path.resolve(PROJECT_ROOT_PATH, 'src', 'main', 'html'),
      to: path.join(PROJECT_ROOT_PATH, destination, 'html'),
      force: true,
      transform: createTransformHtml(destination)
    },
    {
      from: path.resolve(PROJECT_ROOT_PATH, 'src', 'main', 'resources'),
      to: path.join(PROJECT_ROOT_PATH, destination, 'assets'),
      force: true
    }
  ];

  // patterns for copying distribution files for dev
  let patternsForTarget = [];
  if (destination == 'target') {
    patternsForTarget = [
      {
        from: path.resolve(PROJECT_ROOT_PATH, 'node_modules', 'deskproapps-sdk-react', 'dist', 'deskproapps-sdk-react.js'),
        to: path.join(PROJECT_ROOT_PATH, 'target', 'assets', 'deskproapps-sdk-react.js'),
        force: true
      },
      {
        from: path.resolve(PROJECT_ROOT_PATH, 'node_modules', 'react', 'dist', 'react.js'),
        to: path.join(PROJECT_ROOT_PATH, 'target', 'assets', 'react.js'),
        force: true
      },
      {
        from: path.resolve(PROJECT_ROOT_PATH, 'node_modules', 'react-dom', 'dist', 'react-dom.js'),
        to: path.join(PROJECT_ROOT_PATH, 'target', 'assets', 'react-dom.js'),
        force: true
      }
    ];
  }

  return patterns.concat(patternsForTarget);
}


/**
 * @param {Array|String} copyPatterns
 */
function createPlugin(copyPatterns)
{
    let commands;
    if (typeof copyPatterns === 'string') {
      commands = getCopyPatterns(copyPatterns);
    } else if (copyPatterns instanceof Array && copyPatterns.length) {
        commands = copyPatterns;
    } else {
        throw new Error('unexpected argument. Expecting either a destination or an array of copy commands');
    }

    const options = { debug: true, copyUnmodified: true };
    return new CopyWebpackPlugin(commands, options);
}



module.exports = {
    getCopyCommands: getCopyPatterns,
    copyWebpackPlugin: createPlugin
};