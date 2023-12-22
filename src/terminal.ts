import * as vscode from 'vscode';

console.log("Terminals:");

vscode.window.onDidOpenTerminal(() => {
	console.log("Terminal");
});

vscode.window.onDidOpenTerminal((terminal: vscode.Terminal) => {
	vscode.window.showInformationMessage(`onDidOpenTerminal, name: ${terminal.name}`);
});

async function selectTerminal() {
	interface TerminalQuickPickItem extends vscode.QuickPickItem {
		terminal: vscode.Terminal;
	}
	const terminals = vscode.window.terminals;
	const items: TerminalQuickPickItem[] = terminals.map(t => {
		return {
			label: t.name,
			terminal: t
		};
	});
	const item = await vscode.window.showQuickPick(items);
	return item ? item.terminal : undefined;
}

function ensureTerminalExists(): boolean {
	if (!vscode.window.terminals || vscode.window.terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}

export {
  selectTerminal,
	ensureTerminalExists,
};