import * as vscode from 'vscode';

console.log("Terminals: " + (<any>vscode.window).terminals.length);

vscode.window.onDidOpenTerminal(terminal => {
  console.log("Terminal opened. Total count: " + (<any>vscode.window).terminals.length);
});

vscode.window.onDidOpenTerminal((terminal: vscode.Terminal) => {
  vscode.window.showInformationMessage(`onDidOpenTerminal, name: ${terminal.name}`);
});

function selectTerminal() {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: t.name,
			terminal: t
		};
	});
	return vscode.window.showQuickPick(items).then(item => {
		return item ? item.terminal : undefined;
	});
}

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
};

export {
  selectTerminal,
	ensureTerminalExists,
};