import * as vscode from 'vscode';
import { exec, ExecOptions } from 'child_process';

const extensionData = vscode.extensions.getExtension('massdriver.tools');
const extensionVersion = extensionData ? extensionData.packageJSON.version : 'unknown';

type ExecOutput = [stdout: string, stderr: string];

const asyncExec = async (commandToExecute: string, options: ExecOptions = {}): Promise<ExecOutput> => {
    const defaultOptions: ExecOptions = { maxBuffer: 1024 * 1000 };
    return new Promise((resolve, reject) => {
        exec(commandToExecute, { ...defaultOptions, ...options }, (error, stdout, stderr) => {
            if (error) { return reject(error); }
            resolve([stdout, stderr]);
        });
    });
};

export {
    extensionVersion,
    asyncExec,
};