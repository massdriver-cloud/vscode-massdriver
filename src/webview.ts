import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getToken } from './settings';
import { getOrgId } from './settings';
import { exec, ChildProcess } from 'child_process';

let massServerProcess: ChildProcess | null = null;

// starts the mass dev server
function startMassServer(callback: () => void) {
	const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

	const token = getToken();
  const orgId = getOrgId();
	const currentDir = path.dirname(editor.document.uri.fsPath);

	if (token) {
		if (orgId) {
			if (fs.existsSync(currentDir + '/massdriver.yaml')) {
				massServerProcess = exec(`export MASSDRIVER_API_KEY=${token} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && mass server -d ./`, (err: Error | null) => {
					if (err) {
						console.error(`exec error: ${err.message}`);
					} else {
						vscode.window.showInformationMessage('Mass Server started successfully');
					}
				});
			} else if (fs.existsSync(currentDir + '/../massdriver.yaml')) {
				massServerProcess = exec(`export MASSDRIVER_API_KEY=${token} && export MASSDRIVER_ORG_ID=${orgId} && cd ${currentDir} && cd .. && mass server -d ./`, (err: Error | null) => {
					if (err) {
						console.error(`exec error: ${err.message}`);
					} else {
						vscode.window.showInformationMessage('Mass Server started successfully');
					}
				});
				callback();
			} else {
				vscode.window.showErrorMessage('massdriver.yaml not found in the current directory');
			}
		} else {
			vscode.window.showErrorMessage('No organization ID found in settings.');
		}
	} else {
		vscode.window.showErrorMessage('No API key found in settings.');
	}
}

// closes the mass dev server
function stopMassServer() {
	if (massServerProcess) {
		massServerProcess.kill();
		massServerProcess = null;
	}
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		enableScripts: true,
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

class openWebview {
	public static currentPanel: openWebview | undefined;
	public static readonly viewType = 'massDevServer';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// use current panel if it exists
		if (openWebview.currentPanel) {
			openWebview.currentPanel._panel.reveal(column);

			startMassServer(() => {
				openWebview.currentPanel?._update();
			});
			return;
		}

		// otherwise, create a new panel
		const panel = vscode.window.createWebviewPanel(
			openWebview.viewType,
			'Mass Dev Server',
			column || vscode.ViewColumn.One,
			getWebviewOptions(extensionUri),
		);

		openWebview.currentPanel = new openWebview(panel, extensionUri);

		startMassServer(() => {
			openWebview.currentPanel?._update();
		});
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		openWebview.currentPanel = new openWebview(panel, extensionUri);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		this._update();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.onDidChangeViewState(() => {
				if (this._panel.visible) {
					this._update();
				}
			},
			null,
			this._disposables
		);

		this._panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		stopMassServer();

		openWebview.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview() {
		const iframeSrc = 'http://127.0.0.1:8080/hello-agent'; // local path to dev server
	
		this._panel.webview.html = `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Mass Server</title>
				<style>
					body {
						background-color: white;
					}
				</style>
			</head>
			<body>
				<iframe src="${iframeSrc}" style="width: 100%; height: 100%; border: none;"></iframe>
			</body>
			</html>
		`;
	}
	
	private _update() {
		this._getHtmlForWebview();
	}
}

export {
	getWebviewOptions,
	openWebview,
};
