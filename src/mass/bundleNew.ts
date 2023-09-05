import * as vscode from 'vscode';
import * as path from 'path';
import { getApiKey } from '../settings';
import { newBundleInfo } from '../inputs/bundleNew';

async function bundleNew () {
  let editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const apiKey = getApiKey();
  var currentDir = path.dirname(editor.document.uri.fsPath);
  const { exec } = require('child_process');
  // More JavaScript syntax, this is called "descuturing assignment"
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  const {
    bundleName,
    bundleDescription,
    bundleTemplate,
    connectionList,
    bundleOutputDirectory,
  } = await newBundleInfo();

  if (apiKey) {
    exec(`export MASSDRIVER_API_KEY=${apiKey} && cd ${currentDir} && mass bundle new -n "${bundleName}" -d "${bundleDescription}" -t ${bundleTemplate} -c "${connectionList}" -o "./${bundleOutputDirectory}"`, (err: any, stdout: any, stderr: any) => {
      if (err) {
        console.error(`exec error: ${err}`);
      } else {
        vscode.window.showInformationMessage('Bundle created successfully');
      }
    });
  } else {
  }
};

export { 
  bundleNew,
};