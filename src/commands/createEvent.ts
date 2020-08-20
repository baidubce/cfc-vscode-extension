import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { FunctionNode } from '../model/nodes';
import { EventTemplates } from '../model/eventTemplate';

export async function addEvent(node: FunctionNode) {
  try {
    const eventTps = new EventTemplates();

    const srcEventPath = await getEventFilePath(eventTps);
    if (!srcEventPath) {
      return;
    }

    const eventFileName = await geteventName();
    if (!eventFileName) {
      return;
    }

    const targetEventDir = path.join(path.dirname(node.yamlPath), 'events');
    try {
      const stat = fs.statSync(targetEventDir);
      if (!stat.isDirectory()) {
        vscode.window.showErrorMessage('cannot create folder ' + targetEventDir);
        return;
      }
    } catch{
      fs.mkdirSync(targetEventDir);
    }

    const targetEventPath = path.join(targetEventDir, eventFileName);
    fs.copyFileSync(srcEventPath, targetEventPath);

    vscode.window.showTextDocument(vscode.Uri.file(targetEventPath));
  } catch (e) {
    vscode.window.showErrorMessage(e.message);
  }
}

export async function getEventFilePath(eventTps: EventTemplates): Promise<string | undefined> {
  const eventKey = await vscode.window.showQuickPick(eventTps.getTemplateEventList(), { placeHolder: "请选择触发器类型", canPickMany: false });
  const event = eventTps.getTemplateEvent(<string>eventKey);

  if (!event) {
    return undefined;
  }

  if (event.openDialog()) {
    // use custom event to invoke remote function
    return await chooseEventFromFs();
  }

  if (!event.hasSubEvent()) {
    return event.filePath();
  }

  const subEventKey = await vscode.window.showQuickPick(event.subEventKeys(), { placeHolder: "请选择测试事件模板" });
  if (!subEventKey) {
    return undefined;
  }

  return event.filePathWithSubEvent(subEventKey);
}

async function geteventName() {
  let eventName = await vscode.window.showInputBox();
  if (eventName && !eventName.endsWith('.json')) {
    eventName += '.json';
  }
  return eventName;
}

async function chooseEventFromFs() {
  const workspace = vscode.workspace.workspaceFolders;
  const selectedPath = await vscode.window.showOpenDialog({
    canSelectFolders: false,
    canSelectFiles: true,
    canSelectMany: false,
    defaultUri: workspace ? workspace[0].uri : undefined || vscode.Uri.file(os.homedir()),
    openLabel: '选择',
  });

  if (!selectedPath) {
    return;
  }

  return selectedPath[0].fsPath;
}