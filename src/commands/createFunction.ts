import * as vscode from 'vscode';
import { runBsamCmd } from '../cli/cmd';
import { CreateFunctionWizard } from '../wizard/CreateFunctionWizard';

export async function createFunction() {
  try {

    const wizard = new CreateFunctionWizard();
    const config = await wizard.run();
    if (!config) {
      return;
    }

    const subCmd = ['init', '-r', config.runtime, '-o', config.location, '-n', config.name];
    await runBsamCmd(subCmd);
    await vscode.commands.executeCommand('extension.refreshLocal');
  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  }
}
