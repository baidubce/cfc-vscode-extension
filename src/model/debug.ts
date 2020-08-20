import * as vscode from "vscode";
import { isNodejs, isPython, isJava } from '../model/functionSpec';
import { getLogger } from '../logger/logger';

export const EXTENSION_PYTHON = 'ms-python.python';
export const EXTENSION_JAVA = 'vscjava.vscode-java-debug';

export function getRuntimeDebugger(runtime: string, codeDir: string): RuntimeDebugger {
  if (isNodejs(runtime)) {
    return new NodejsDebugger(codeDir);
  } else if (isPython(runtime)) {
    return new PythonDebugger(codeDir);
  } else if (isJava(runtime)) {
    return new JavaDebugger(codeDir);
  } else {
    throw new Error(`${runtime} runtime Local Debug is not supported yet`);
  }
}

export interface RuntimeDebugger {
  config: BsamDebugConfiguration;
  validateDependentExtension(): void;
}

export interface BsamDebugConfiguration extends vscode.DebugConfiguration {
  port: number
}

export interface PythonDebugConfiguration extends BsamDebugConfiguration {
  host: string;
  pathMappings: { localRoot: string, remoteRoot: string }[];
}

export class PythonDebugger implements RuntimeDebugger {
  constructor(codeDir: string) {
    this.config = <PythonDebugConfiguration>{
      name: 'python debug',
      request: 'attach',
      type: 'python',
      host: 'localhost',
      pathMappings: [{ 'localRoot': codeDir, 'remoteRoot': '/var/task' }],
      port: 5678,
    };
  }

  public async validateDependentExtension() {
    await doValidate('python', EXTENSION_PYTHON);
  }

  public config: BsamDebugConfiguration;
}

export interface NodejsDebugConfiguration extends BsamDebugConfiguration {
  address: string;
  localRoot: string;
  remoteRoot: string;
  protocol: string;
  stopOnEntry: false;
}

export class NodejsDebugger implements RuntimeDebugger {
  constructor(codeDir: string) {
    this.config = <NodejsDebugConfiguration>{
      name: 'node debug',
      request: 'attach',
      type: 'node',
      address: 'localhost',
      stopOnEntry: false,
      port: 5858,
      localRoot: codeDir,
      remoteRoot: '/var/task',
      protocol: "inspector",
    };
  }

  public validateDependentExtension() { }

  public config: BsamDebugConfiguration;
}

export interface JavaDebugConfiguration extends BsamDebugConfiguration {
  type: string,
  name: string,
  request: string,
  hostName: string,
}

export class JavaDebugger implements RuntimeDebugger {
  constructor(codeDir: string) {
    this.config = <JavaDebugConfiguration>{
      name: 'java debug',
      type: 'java',
      request: 'attach',
      hostName: 'localhost',
      port: 8890
    };
  }

  public async validateDependentExtension() {
    await doValidate('java', EXTENSION_JAVA);
  }

  public config: BsamDebugConfiguration;
}

async function doValidate(runtime: string, extensionName: string) {
  const extension = vscode.extensions.getExtension(extensionName);
  if (!extension) {
    throw new Error(`Cannot debug ${runtime} function, please install ${extensionName} extension first.`);
  }

  if (!extension.isActive) {
    getLogger().info(`CFC extension is activating the ${extensionName} extension for debug`);
    await extension.activate();
  }
}