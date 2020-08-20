import { expect } from 'chai';
import * as vscode from 'vscode';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { makeFunctionNode } from '../../model/nodes';
import { assembleCmd } from '../../commands/localInvoke';

suite('Commands Test Suite', () => {
  test('assemble cmd', async () => {
    let node = makeFunctionNode('mock-func', {
      Name: 'mock-func',
      Type: 'BCE::Serverless::Function',
      Properties: {
        CodeUri: '',
        Handler: 'index.handler',
        Runtime: 'nodejs12',
        MemorySize: 128,
        Timeout: 3
      }
    }, 'mock-path');

    const cmd = assembleCmd(node, "test_event.json", true, {
        type: 'python',        
        name: 'unit test',        
        request: 'attach',        
        port: 5678,
    });

    expect(cmd).to.eql(['local','invoke','-e','test_event.json', 
      '-t', 'mock-path', 'mock-func', '--debug-port', '5678']);
  });
});
