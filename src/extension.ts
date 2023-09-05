import * as vscode from 'vscode';
import { extensionVersion } from './utils';
import { ensureTerminalExists, selectTerminal } from './terminal';
import { bundleBuild } from './mass/bundleBuild';
import { clean } from './mass/clean';
import { bundleNew } from './mass/bundleNew';
import { bundlePublish } from './mass/bundlePublish';
import { imagePush } from './mass/imagePush';
import { initStatusBarItem } from './interface';

function activate(context: vscode.ExtensionContext) {

	console.log('Massdriver extension activated!', { extensionVersion, vscodeVersion: vscode.version });

	// This should be initializing the status bar item upon load, but it's not working
	initStatusBarItem('mass.openCommandPalette');

	const disposables = [
		vscode.commands.registerCommand('mass.bundleBuild', bundleBuild),
		vscode.commands.registerCommand('mass.bundleNew', bundleNew),
		vscode.commands.registerCommand('mass.bundlePublish', bundlePublish),
		vscode.commands.registerCommand('mass.clean', clean),
		vscode.commands.registerCommand('mass.imagePush', imagePush),
	];
	context.subscriptions.push(...disposables);

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