import * as vscode from 'vscode';
import * as debug from '../model/debug';
import * as tcpPortUsed from 'tcp-port-used';
import { FunctionNode } from '../model/nodes';
import { getOutputChannel } from '../logger/channel';
import { getEventFile, assembleCmd } from '../commands/localInvoke';
import { runBsamCmd } from '../cli/cmd';
import { getLogger } from '../logger/logger';

export async function localDebugFunc(node: FunctionNode) {
  try {
    const runtimeDebugger = debug.getRuntimeDebugger(node.config.Properties.Runtime, node.getAbsDir());
    if (await tcpPortUsed.check(runtimeDebugger.config.port)) {
      throw new Error(`Debug port ${runtimeDebugger.config.port} is already being used`);
    }

    await runtimeDebugger.validateDependentExtension();
    const event = await getEventFile(node);
    if (!event) {
      return;
    }

    const cmd = assembleCmd(node, event, true, runtimeDebugger.config);
    runBsamCmd(cmd).then(
      (res) => {
        getLogger().info(`Debug function ${node.config.Name} done`);
      }
    ).catch(
      (err) => {
        getLogger().info(err.message);
      }
    );

    await waitForDebugPort(runtimeDebugger.config.port);
    await startDebug(runtimeDebugger.config);

    getOutputChannel().show();
  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  }
}

// the first debug may take a long time to pull docker image, wait for at most 10 mins here.
async function waitForDebugPort(port: number) {
  try {
    await tcpPortUsed.waitUntilUsed(port, 100, 10 * 60 * 1000);
  } catch {
    getOutputChannel().appendLine(`wait for debug port ${port} timeout after 10 minutes`);
  }
}

async function startDebug(config: debug.BsamDebugConfiguration) {
  let attached: boolean | undefined;

  await waitForFirstTry();

  for (let i = 0; i < 3; i++) {
    attached = await vscode.debug.startDebugging(undefined, config);
    if (attached === true) {
      break;
    }
    await waitForRetry();
  }

  if (attached === true) {
    getOutputChannel().appendLine('Debugger attached');
  } else {
    getOutputChannel().appendLine('Unable to attach debugger');
    throw new Error('Unable to attach debugger');
  }
}

async function waitForFirstTry() {
  await waitForRetry();
}

async function waitForRetry() {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 200);
  });
}