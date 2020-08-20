import * as vscode from 'vscode';
import { runBsamCmd } from '../cli/cmd';
import { FunctionNode } from '../model/nodes';
import { getOutputChannel } from '../logger/channel';


export async function localInstallAndBuild(node: FunctionNode) {
  try {
    const subCmd = ['local', 'install', '-t', node.yamlPath];
    getOutputChannel().show();

    await runBsamCmd(subCmd);
  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  }
}