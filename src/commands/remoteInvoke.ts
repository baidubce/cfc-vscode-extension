import * as vscode from 'vscode';
import * as fs from 'fs';

import { RemoteFunctionNode } from '../model/nodes';
import { EventTemplates } from '../model/eventTemplate';
import { getEventFilePath } from '../commands/createEvent';
import { getOutputChannel } from '../logger/channel';
import { getCfcClient } from '../utils/client';
import { getLogger } from '../logger/logger';

export async function remoteInvoke(node: RemoteFunctionNode) {
  try {
    const eventFile = await getEventFile(node);
    if (!eventFile) {
      return;
    }

    const event = fs.readFileSync(eventFile).toString();
    const client = await getCfcClient();

    const res = await client.invocations(node.fc.FunctionBrn, event, { logToBody: true, logType: 'Tail' });
    getLogger().info(res.body.LogResult);
    getLogger().info(res.body.Payload);

    getOutputChannel().show();
  } catch (e) {
    getLogger().error(e);
    vscode.window.showErrorMessage('invoke remote function error: ' + e.message);
  }
}

export function getEventFile(node: RemoteFunctionNode) {
  const events = new EventTemplates();
  events.addDialogOption('dialog', '');

  return getEventFilePath(events);
}
