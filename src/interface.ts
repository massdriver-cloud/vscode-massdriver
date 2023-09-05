import * as vscode from 'vscode';

const statusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);

const initStatusBarItem = (onClickCommand: string): void => {
    statusBarItem.command = onClickCommand;
    statusBarItem.text = `$(rocket) Massdriver`;
	statusBarItem.tooltip = 'Click to open the Massdriver command palette';
	statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.background');
    statusBarItem.show();
};

const setMissingApiStatusBarItem = (openExtensionSettings: string | undefined): void => {
	statusBarItem.command = openExtensionSettings;
	statusBarItem.text = `$(alert) Massdriver: Missing API Key`;
	statusBarItem.tooltip = 'Add your Massdriver API key to the extension settings';
	statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
};

const setMissingOrganizationStatusBarItem = (openExtensionSettings: string | undefined): void => {
	statusBarItem.command = openExtensionSettings;
	statusBarItem.text = `$(alert) Massdriver: Missing Org ID`;
	statusBarItem.tooltip = 'Add your Massdriver organization ID to the extension settings';
	statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
};

export {
	statusBarItem,
	initStatusBarItem,
	setMissingApiStatusBarItem,
	setMissingOrganizationStatusBarItem,
};