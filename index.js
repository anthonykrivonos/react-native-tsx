'use strict';
const path = require('path');
const fs = require('fs');
const minimist = require('minimist')

// Local imports
const { version } = require('./package.json')
const { nodeTask, commandTask, renameExtensions } = require('./utility')

const performTasks = () => {

    // Parse arguments
    const args = minimist(process.argv.slice(2))
  
    // NOTE: 'version' Command
    if (args.version || args.v) {
        console.log(`ℹ️  react-native-tsx v${version}`)
    }
  
    // NOTE: 'help' Command
    else if (args.help || args.h) {
        console.log(`1️⃣  Run \`react-native-tsx\` to convert your project.\n2️⃣  Run \`react-native-tsx --version\` to view the current version.`)
    }

    else {
        // If no arguments are supplied, perform conversion.
        performTSXConversion()
    }

}

const performTSXConversion = () => {

    // Store constant current directory
    const currentDir = process.cwd();

    //
    //  Installation/uninstallation processes
    //

    // Install necessary dev modules
    const installDevModules = [ 'react-native-typescript-transformer', 'typescript', 'tslib', 'ts-jest' ]
    nodeTask(true, installDevModules, false, true, true)

    // Uninstall JavaScript linting modules
    const uninstallLintModules = [ 'babel-eslint', 'eslint', 'eslint-plugin-react' ]
    nodeTask(false, uninstallLintModules, false, true, true)

    // Uninstall prop-types
    const uninstallPropTypes = 'prop-types';
    nodeTask(false, uninstallPropTypes, false, true, false)

    // Install typings
    const installTypings = [ '@types/jest', '@types/react', '@types/react-native', '@types/react-navigation', '@types/react-redux', '@types/react-test-renderer' ]
    nodeTask(true, installTypings, false, true, true)

    // Install typescript and tslint globally
    const installTypescriptAndLint = [ 'typescript', 'tslint' ]
    nodeTask(true, installTypescriptAndLint, true, false, false)

    //
    //  JSON Configuration
    //

    // Change app.json configuration to add TS transformation 
    let app = {};
    const staticExpoVersion = '25.0,0';
    try {
        app = require(currentDir + '/app.json');
    } catch(err) {
        app = { expo: { 'sdkVersion': staticExpoVersion } }
    }
    app.expo = Object.assign(app.expo, {
        'packagerOpts': {
            'sourceExts': ["ts", "tsx"],
            'transformer': 'node_modules/react-native-typescript-transformer/index.js',
        }
    })
    fs.writeFile(currentDir + '/app.json', JSON.stringify(app, null, 2), err => {
        if (err) {
            return console.error(`Could not write to app.json`);
        }
    });


    // Create a tsconfig.json file with default properties
    const tsConfig = {
        'target': 'es2015',
        'module': 'es2015',
        'noEmit': true,
        'sourceMap': true,
        'experimentalDecorators': true,
        'jsx': 'react-native',
        'lib': ['dom', 'es2015', 'es2016'],
        'allowSyntheticDefaultImports': true,
        'moduleResolution': 'node',
        'noEmitHelpers': true,
        'importHelpers': true,
        'strict': true,
        'noImplicitReturns': true,
        'noUnusedLocals': true,
    };
    fs.writeFile(currentDir + '/tsconfig.json', JSON.stringify(tsConfig, null, 2), err => {
        if (err) {
            return console.error(`Could not write to app.json`);
        }
    });
    
    // Automatically create tslint.json file
    try {
        require(currentDir + '/tslint.json');
    } catch(err) {
        commandTask('tslint --init');
    }

    //
    //  TSX File Renaming
    //
    renameExtensions([ 'js', 'jsx' ], 'tsx', currentDir, [ 'node_modules', 'bin' ])

}


module.exports = performTasks