'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// Installs or uninstalls a node module with the given name.
// doInstall: Installs if true, otherwise uninstalls
// name: String or array of strings of module names.
// isGlobal: appends a '-g' if true
// isSaved: appends a '--save' if true
// isDev: appends a '--save-dev' instead of '--save' if true
const nodeTask = (doInstall, name, isGlobal, isSave, isDev) => {
    let moduleNames = name.constructor === String ? name : name.join(' ');
    execSync(`npm ${doInstall ? '' : 'un'}install ${moduleNames}${isGlobal ? ' -g' : ''}${isSave ? isDev ? ' --save-dev' : ' --save' : ''}`, { stdio:[0,1,2]} );
}

// Synchronously execute commands in command line.
const commandTask = executionText => {
    execSync(executionText, { stdio:[0,1,2]} );
}

// Renames all file extensions recursively
// from: List of strings or string containing extensions without the dot
// to: String extension to rename these files to
// dir: Directory to start recursive renaming
// avoid: List of string file names to avoid renaming
const renameExtensions = (from, to, dir, avoid = []) => {

    // List of recursively found files
    let fileList = [];

    // Array of extensions to rename
    const fromArr = from.constructor === String ? [ from ] : from;

    // Finding function, outputs into fileList
    const find = (fromArr, to, dir, fileList) => {
        let files = fs.readdirSync(dir);
        files.forEach(file => {
            if (avoid.includes(file)) {
                // DO NOTHING
            } else if (fs.statSync(path.join(dir, file)).isDirectory()) {
                fileList = find(fromArr, to, path.join(dir, file), fileList);
            } else {
                const matches = (file, ext) => file.split('.').length > 0 && file.split('.')[1] == ext
                const shouldRename = fromArr.reduce((rename, ext) => rename || matches(file, ext), false)
                if (shouldRename) {
                    let name = file.split('.')[0].replace(/\s/g, '_') + `.${to}`;
                    let src = path.join(dir, file);
                    let newSrc = path.join(dir, name);
                    fileList.push({
                        oldSrc: src,
                        newSrc: newSrc
                    });
                }
            }

        });
        return fileList;
    }

    fileList = find(fromArr, to, dir, fileList);

    fileList.forEach(f => {
        fs.renameSync(f.oldSrc, f.newSrc); 
    });

};

module.exports = {
    nodeTask,
    commandTask,
    renameExtensions
}