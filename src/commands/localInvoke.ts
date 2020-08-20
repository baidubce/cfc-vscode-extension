import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FunctionNode } from '../model/nodes';
import { EventTemplates } from '../model/eventTemplate';
import { getEventFilePath } from '../commands/createEvent';
import { runBsamCmd } from '../cli/cmd';
import { getOutputChannel } from '../logger/channel';
import { BsamDebugConfiguration } from '../model/debug';
import { getLogger } from '../logger/logger';

export async function localInvokeFunc(node: FunctionNode) {
  try {
    const event = await getEventFile(node);
    if (!event) {
      return;
    }

    const cmd = assembleCmd(node, event);
    getOutputChannel().show();

    await runBsamCmd(cmd).then(
      (res) => {
        getLogger().info(`Function ${node.config.Name} invoke done.`);
      }
    ).catch(
      (err) => {
        throw err;
      }
    );

  } catch (e) {
    vscode.window.showErrorMessage('Invoke function failed: ' + e.message);
  }
}

export function assembleCmd(node: FunctionNode, event: string, isDebug: boolean = false, config?: BsamDebugConfiguration) {
  let cmd = ['local', 'invoke', '-e', event, '-t', node.yamlPath, node.config.Name];

  const skip = vscode.workspace.getConfiguration().get<boolean>('cfc.extension.skipPullImage');
  if (skip === true) {
    cmd = cmd.concat('--skip-pull-image');
  }

  if (isDebug && config !== undefined) {
    cmd = cmd.concat(['--debug-port', config.port.toString()]);
  }
  return cmd;
}

export function getEventFile(node: FunctionNode) {
  const events = new EventTemplates();

  try {
    // search user customed event
    const customEventsDir = path.join(path.dirname(node.yamlPath), 'events');
    const stat = fs.statSync(customEventsDir);

    if (stat.isDirectory()) {
      const customEvents = fs.readdirSync(customEventsDir);

      customEvents.forEach(e => {
        events.addCustomEvent(e, customEventsDir);
      });
    }
  } catch {
  }

  return getEventFilePath(events);
}
