import * as vscode from 'vscode';
import { FunctionNode } from '../model/nodes';

export async function gotoTemplate(node: FunctionNode) {
  vscode.window.showTextDocument(vscode.Uri.file(node.yamlPath));
}
