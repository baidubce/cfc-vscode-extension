import * as vscode from 'vscode';
import { expect } from 'chai';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { BindAccountWizard } from '../../wizard/BindAccountWizard';
import { InputBoxParameters, MultiStepPickParameters } from '../../wizard/multiStepWizard';
import { CreateFunctionWizard, CreateFunctionResult } from '../../wizard/CreateFunctionWizard';

suite('Commands Test Suite', () => {
  test('bind wizard', async () => {
    let wizard = new BindAccountWizard();
    wizard.showInputBox = async (params: InputBoxParameters): Promise<string | undefined> => {
      if (params.options.title === '请输入百度云账号的 AccessKey') {
        return 'mock-ak';
      } else if (params.options.title === '请输入百度云账号的 SecretAccessKey') {
        return 'mock-sk';
      } else {
        return 'mock-alias';
      }
    };

    const res = await wizard.run();    
    expect(res?.accessKey).to.eql('mock-ak');
    expect(res?.secretAccessKey).to.eql('mock-sk');
    expect(res?.accountAlias).to.eql('mock-alias');
  });

  test('create function wizard abnormal', async () => {
    let wizard = new CreateFunctionWizard();
    wizard.showQuickPick = async (picker: MultiStepPickParameters): Promise<vscode.QuickPickItem | undefined> => {
      if (picker.options.title === '请选择函数runtime类型') {
        return {label: 'nodejs12'};
      } else if (picker.options.title === '请选择函数文件路径') {
        return {label: '/mock/path'};
      }
    };

    wizard.showInputBox = async (params: InputBoxParameters): Promise<string | undefined> => {
      return 'mock-function';
    };

    let res : CreateFunctionResult | undefined;
    let catched = false;

    try {
      res = await wizard.run();
    } catch(e) {
      catched = true;
    }
    expect(catched).to.eql(true);
    expect(res).to.eql(undefined);
  });

});
