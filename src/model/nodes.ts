import * as vscode from 'vscode';
import * as path from 'path';
import { FunctionSpec, isNodejs, isJava, isPython } from '../model/functionSpec';
import { Function } from '@baiducloud/sdk';

export class BaseNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }
}

export class FunctionNode extends BaseNode {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly config: FunctionSpec,
    public readonly yamlPath: string
  ) {
    super(label, collapsibleState);
    this.config = config;
    this.config.Name = label;
    this.yamlPath = yamlPath;
  }

  public getAbsDir() {
    return path.join(path.dirname(this.yamlPath), this.config.Properties.CodeUri);
  }

  // TODO: 配置函数图标
}

export class RemoteFunctionNode extends BaseNode {
  constructor(
    public readonly fc: Function,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(fc.FunctionName, collapsibleState);
    this.fc = fc;
  }
}

export function makeFunctionNode(
  name: string,
  config: FunctionSpec,
  yamlPath: string
): FunctionNode {
  const node = new FunctionNode(name, vscode.TreeItemCollapsibleState.None, config, yamlPath);
  if (canDebug(config.Properties.Runtime)) {
    node.contextValue = "DebugNode";
  } else {
    node.contextValue = "UnDebugNode";
  }
  return node;
}

// 云端函数还需要所有的配置吧
export function makeRemoteFunctionNode(
  fc: Function
): RemoteFunctionNode {
  const node = new RemoteFunctionNode(fc, vscode.TreeItemCollapsibleState.None);
  node.contextValue = "RemoteFunctionNode";
  return node;
}

function canDebug(runtime: string): boolean {
  if (isNodejs(runtime) || isJava(runtime) || isPython(runtime)) {
    return true;
  }
  return false;
}