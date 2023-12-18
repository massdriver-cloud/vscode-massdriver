import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';

function clean () {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const currentDir = path.dirname(editor.document.uri.fsPath);

  if (fs.existsSync(currentDir + '/massdriver.yaml')) {
    exec(`cd ${currentDir} && rm -rf schema-*.json src/*_variables.tf.json src/.terraform*`, (err: Error | null) => {
      if (err) {
        console.error(`exec error: ${err}`);
      } else {
        vscode.window.showInformationMessage('Bundle cleaned of temporary files.');
      }
    });
  } else if (fs.existsSync(currentDir + '/../massdriver.yaml')) {
    exec(`cd ${currentDir} && rm -rf ../schema-*.json *_variables.tf.json .terraform*`, (err: Error | null) => {
      if (err) {
        console.error(`exec error: ${err}`);
      } else {
        vscode.window.showInformationMessage('Bundle cleaned of temporary files.');
      }
    });
  } else {
    vscode.window.showErrorMessage('massdriver.yaml not found in current directory');
  }
}

export { 
  clean,
};