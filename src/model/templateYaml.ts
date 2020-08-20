import { FunctionSpec } from './functionSpec';
import { Function } from '@baiducloud/sdk';

export class TemplateYaml {
  constructor(fc: Function) {
    this.BCETemplateFormatVersion = '2010-09-09';
    this.Transform = 'BCE::Serverless-2018-08-30';
    this.Description = 'Template for ' + fc.FunctionName;

    this.Resources = {};
  }

  public makeFunctionYamlSpec(fc: Function) {
    return <FunctionSpec>{
      Type: 'BCE::Serverless::Function',
      Properties: {
        CodeUri: 'hello_world/',
        Handler: fc.Handler,
        Runtime: fc.Runtime,
        Timeout: fc.Timeout,
        MemorySize: fc.MemorySize,
        Environment: fc.Environment,
      }
    };
  }

  public BCETemplateFormatVersion: string;
  public Transform: string;
  public Description: string;
  public Resources: {};
}

