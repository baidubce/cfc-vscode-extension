
export interface FunctionSpec {
  Name: string;
  Type: string;
  Properties: {
    CodeUri: string;
    Handler: string;
    Runtime: string;
    MemorySize: number;
    Timeout: number;
    Environment?: object;
  };
}

export function isNodejs(runtime: string) {
  return runtime.indexOf('nodejs') > -1;
}

export function isPython(runtime: string) {
  return runtime.indexOf('python') > -1;
}

export function isJava(runtime: string) {
  return runtime.indexOf('java') > -1;
}

export function isCsharp(runtime: string) {
  return runtime.indexOf('dotnetcore') > -1;
}