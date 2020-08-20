import * as vscode from 'vscode';
import { LocalFunctionNodeProvider } from './tree/localFunctionNode';
import { RemoteFunctionNodeProvider } from './tree/remoteFunctionNode';
import { gotoFunctionCode } from './commands/gotoFunction';
import { addEvent } from './commands/createEvent';
import { detectCli, OnExtensionActive, OnExtensionCommand } from './commands/detectCli';
import { localInvokeFunc } from './commands/localInvoke';
import { localDebugFunc } from './commands/localDebug';
import { createFunction } from './commands/createFunction';
import { gotoTemplate } from './commands/gotoTemplate';
import { bindAccount } from './commands/bindAccount';
import { CfcCodeLensProvider } from './codelens/provider';
import { switchRegion } from './commands/switchRegion';
import { deployFunction } from './commands/deployFunction';
import { localInstallAndBuild } from './commands/localInstall';
import { activeLogger } from './logger/logger';
import { remoteInvoke } from './commands/remoteInvoke';
import { download } from './commands/download';
import { switchAccount } from './commands/switchAccount';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const provider = new LocalFunctionNodeProvider(vscode.workspace.rootPath || "");
	vscode.window.registerTreeDataProvider(
		"localFunctions", provider
	);

	const remoteFunctionprovider = new RemoteFunctionNodeProvider(vscode.workspace.rootPath || "");
	vscode.window.registerTreeDataProvider(
		"remoteFunctions", remoteFunctionprovider
	);

	vscode.languages.registerCodeLensProvider(['javascript', 'java', 'python'], new CfcCodeLensProvider());

	vscode.commands.registerCommand('extension.refreshLocal', () => provider.refresh());
	vscode.commands.registerCommand('extension.gotoFunction', gotoFunctionCode);
	vscode.commands.registerCommand('extension.addEvent', addEvent);
	vscode.commands.registerCommand('extension.detectCli', () => detectCli(OnExtensionCommand));
	vscode.commands.registerCommand('extension.localInvoke', localInvokeFunc);
	vscode.commands.registerCommand('extension.localDebug', localDebugFunc);
	vscode.commands.registerCommand('extension.createFunction', createFunction);
	vscode.commands.registerCommand('extension.gotoTemplate', gotoTemplate);
	vscode.commands.registerCommand('extension.bindAccount', bindAccount);
	vscode.commands.registerCommand('extension.switchRegion', switchRegion);
	vscode.commands.registerCommand('extension.switchAccount', switchAccount);
	vscode.commands.registerCommand('extension.deployFunction', deployFunction);
	vscode.commands.registerCommand('extension.localInstallAndBuild', localInstallAndBuild);
	vscode.commands.registerCommand('extension.remoteInvoke', remoteInvoke);
	vscode.commands.registerCommand('extension.refreshRemote', () => remoteFunctionprovider.refresh());
	vscode.commands.registerCommand('extension.download', download);

	activeLogger(context);

	// pop-up bsam installation prompt
	detectCli(OnExtensionActive);
}

// this method is called when your extension is deactivated
export function deactivate() { }
