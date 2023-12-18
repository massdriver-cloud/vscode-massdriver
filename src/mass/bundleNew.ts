import * as vscode from 'vscode';
import * as path from 'path';
import { getToken } from '../settings';
import { newBundleInfo } from '../inputs/bundleNew';
import { exec } from 'child_process';

async function bundleNew () {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const token = getToken();
  const currentDir = path.dirname(editor.document.uri.fsPath);
  // More JavaScript syntax, this is called "descuturing assignment"
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
  const {
    bundleName,
    bundleDescription,
    bundleTemplate,
    connectionList,
    bundleOutputDirectory,
  } = await newBundleInfo();

  if (token) {
    exec(`export MASSDRIVER_API_KEY=${token} && cd ${currentDir} && mass bundle new -n "${bundleName}" -d "${bundleDescription}" -t ${bundleTemplate} -c "${connectionList}" -o "./${bundleOutputDirectory}"`, (err: Error | null) => {
      if (err) {
        console.error(`exec error: ${err}`);
      } else {
        vscode.window.showInformationMessage('Bundle created successfully');
      }
    });
  }
}

export { 
  bundleNew,
};