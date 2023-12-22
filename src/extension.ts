import * as vscode from 'vscode';
import { extensionVersion } from './utils';
import { ensureTerminalExists, selectTerminal } from './terminal';
import { bundleBuild } from './mass/bundleBuild';
import { clean } from './mass/clean';
import { bundleNew } from './mass/bundleNew';
import { bundlePublish } from './mass/bundlePublish';
import { imagePush } from './mass/imagePush';
import { initStatusBarItem } from './interface';
import { openWebview, getWebviewOptions } from './webview';


function activate(context: vscode.ExtensionContext) {
  console.log('Massdriver extension activated!', { extensionVersion, vscodeVersion: vscode.version });

  // Initialize the status bar item upon load
  initStatusBarItem('mass.openCommandPalette');

  // Register the other extension commands
  const disposables = [
    vscode.commands.registerCommand('mass.bundleBuild', bundleBuild),
    vscode.commands.registerCommand('mass.bundleNew', bundleNew),
    vscode.commands.registerCommand('mass.bundlePublish', bundlePublish),
    vscode.commands.registerCommand('mass.clean', clean),
    vscode.commands.registerCommand('mass.imagePush', imagePush),
    vscode.commands.registerCommand('mass.devServer', () => {
      openWebview.createOrShow(context.extensionUri);
    }),
  ];
  context.subscriptions.push(...disposables);

  if (vscode.window.registerWebviewPanelSerializer) {
    vscode.window.registerWebviewPanelSerializer(openWebview.viewType, {
      async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: vscode.WebviewPanelOnDidChangeViewStateEvent) {
        console.log(`Got state: ${state}`);
        // Reset the webview options so we use the latest URI for `localResourceRoots`.
        webviewPanel.webview.options = getWebviewOptions(context.extensionUri);
        openWebview.revive(webviewPanel, context.extensionUri);
      },
    });
  }

  // Creates the custom on-click command for the status bar item
  const onClickCommand = 'mass.openCommandPalette';
  context.subscriptions.push(vscode.commands.registerCommand(onClickCommand, () => {
    vscode.commands.executeCommand('workbench.action.quickOpen', '>Massdriver');
  }));

  // The status bar item will open settings when clicked
  const openExtensionSettings = 'mass.openExtensionSettings';
  context.subscriptions.push(vscode.commands.registerCommand(openExtensionSettings, () => {
    vscode.commands.executeCommand('workbench.action.openSettings', 'massdriver');
  }));

  // Updates the status bar item during certain events
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem),
    vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem),
  );
  updateStatusBarItem();

  context.subscriptions.push(vscode.commands.registerCommand('mass.dispose', () => {
    if (ensureTerminalExists()) {
      selectTerminal().then(terminal => {
        if (terminal) {
          terminal.dispose();
        }
      });
    }
  }));
}

function deactivate () {
}

function updateStatusBarItem(): void {
}

export {
	activate,
	deactivate,
};