import * as vscode from 'vscode';
import * as debug from '../model/debug';
import { LocalFunctionNodeProvider } from '../tree/localFunctionNode';
import { FunctionNode } from '../model/nodes';
import { isNodejs, isPython, isJava } from '../model/functionSpec';
import { getLogger } from '../logger/logger';

const NopeRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));

interface GetRangeFunc {
  (document: vscode.TextDocument, handler: string): vscode.Range;
}

interface MakeCodeLensParams {
  functionNode: FunctionNode,
  document: vscode.TextDocument
}

export class CfcCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CodeLens[]> {
    const funcNode = LocalFunctionNodeProvider.WorkspaceFunctions.get(document.uri.fsPath);

    if (!funcNode) {
      return;
    }

    return makeCodeLens(<MakeCodeLensParams>{
      functionNode: funcNode,
      document: document,
    });
  }
}

function makeCodeLens(params: MakeCodeLensParams): vscode.CodeLens[] {
  const range = getHandlerRange(params.document, params.functionNode.config.Properties.Runtime, params.functionNode.config.Properties.Handler);
  if (range === NopeRange) {
    return [];
  }

  const invokeCommand: vscode.Command = {
    title: 'Local Invoke',
    command: 'extension.localInvoke',
    arguments: [params.functionNode],
  };

  const debugCommand: vscode.Command = {
    title: 'Local Debug',
    command: 'extension.localDebug',
    arguments: [params.functionNode],
  };

  return [new vscode.CodeLens(range, invokeCommand), new vscode.CodeLens(range, debugCommand)];
}

function getHandlerRange(document: vscode.TextDocument, runtime: string, handler: string) {
  let getRangeFunc: GetRangeFunc;

  if (isNodejs(runtime)) {
    getRangeFunc = commonGetHandlerFunc;
  } else if (isPython(runtime)) {
    getRangeFunc = pythonGetHandlerFunc;
  } else if (isJava(runtime)) {
    getRangeFunc = javaGetHandlerFunc;
  } else {
    getRangeFunc = nopeGetHandlerFunc;
  }

  return getRangeFunc(document, handler);
}

function commonGetHandlerFunc(document: vscode.TextDocument, handler: string): vscode.Range {
  const ret = handler.split('.');
  if (ret.length !== 2) {
    return NopeRange;
  }

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.text.indexOf(ret[1]) !== -1) {
      return new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 0));
    }
  }

  return NopeRange;
}

function pythonGetHandlerFunc(document: vscode.TextDocument, handler: string): vscode.Range {
  if (!debugWorked('python', debug.EXTENSION_PYTHON)) {
    return NopeRange;
  }

  return commonGetHandlerFunc(document, handler);
}

function javaGetHandlerFunc(document: vscode.TextDocument, handler: string): vscode.Range {
  if (!debugWorked('java', debug.EXTENSION_JAVA)) {
    return NopeRange;
  }

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.text.indexOf('void handler') !== -1) {
      return new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 0));
    }
  }

  return NopeRange;
}

function nopeGetHandlerFunc(document: vscode.TextDocument, handler: string): vscode.Range {
  return NopeRange;
}

function debugWorked(runtime: string, extensionName: string) {
  const extension = vscode.extensions.getExtension(extensionName);
  if (!extension) {
    return false;
  }

  if (!extension.isActive) {
    extension.activate().then(() => {
      getLogger().info(`${runtime} codeLens provider is activating the ${extensionName} extension`);
    });
  }
  return true;
}
