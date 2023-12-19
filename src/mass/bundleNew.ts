import * as vscode from 'vscode';
import * as path from 'path';
import { getToken } from '../settings';
import { getOrgId } from '../settings';
import { newBundleInfo } from '../inputs/bundleNew';
import { exec } from 'child_process';

async function bundleNew () {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const token = getToken();
  const orgId = getOrgId();
  const currentDir = path.dirname(editor.document.uri.fsPath);

  const {
    bundleName,
    bundleDescription,
    bundleTemplate,
    connectionList,
    bundleOutputDirectory,
  } = await newBundleInfo();

  if (token) {
    if (orgId) {
      exec(`export MASSDRIVER_API_KEY=${token} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && mass bundle new -n "${bundleName}" -d "${bundleDescription}" -t ${bundleTemplate} -c "${connectionList}" -o "./${bundleOutputDirectory}"`, (err: Error | null) => {
        if (err) {
          console.error(`exec error: ${err}`);
        } else {
          vscode.window.showInformationMessage('Bundle created successfully');
        }
      });
    } else {
      vscode.window.showErrorMessage('No organization ID found in settings.');
    }
  } else {
    vscode.window.showErrorMessage('No API key found in settings.');
  }
}

export { 
  bundleNew,
};