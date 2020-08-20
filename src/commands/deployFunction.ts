import * as vscode from 'vscode';
import * as path from 'path';
import { FunctionNode } from '../model/nodes';
import { getOutputChannel } from '../logger/channel';
import { runBsamCmd } from '../cli/cmd';

export async function deployFunction(node: FunctionNode) {
  const cwd = process.cwd();
  try {
    process.chdir(path.dirname(node.yamlPath));
    getOutputChannel().show();
    await runBsamCmd(['package']);

    let deployCmd = ['deploy'];
    const endpoint = vscode.workspace.getConfiguration().get<string>('cfc.extension.deployEndpoint');
    if (endpoint !== undefined && endpoint.length > 0) {
      deployCmd = deployCmd.concat(['-e', endpoint]);
    }

    await runBsamCmd(deployCmd);
    vscode.commands.executeCommand('extension.refreshRemote');
  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  } finally {
    process.chdir(cwd);
  }
}