import * as spawn from 'cross-spawn';

export async function invokeCliQuiet(location: string, args: string[]): Promise<InvokeCliResult> {
  let result = new InvokeCliResult();

  return new Promise<InvokeCliResult>((resolve, reject) => {
    const child = spawn(location, args);

    child.stdout?.on('data', (data) => {
      result.processStdout(`${data}`);
    });

    child.stderr?.on('data', (data) => {
      result.processStderr(`${data}`);
    });

    child.on('close', (code) => {
      resolve(result);
    });

    child.on('error', (error) => {
      result.recordError(error);
    });
  });
}

export class InvokeCliResult {
  private code: number;
  private error: Error | undefined;
  private cmdStdout: string[];
  private cmdStderr: string[];

  constructor() {
    this.code = 0;
    this.cmdStdout = new Array<string>(0);
    this.cmdStderr = new Array<string>(0);
  }

  throwIfFail() {
    if (this.error !== undefined && this.error instanceof Error) {
      throw this.error;
    }
    if (this.code !== 0 || this.error !== undefined) {
      throw new Error('BSAM CLI process failed.');
    }
  };

  processStdout(data: string) {
    this.cmdStdout.push(data);
  }

  processStderr(data: string) {
    this.cmdStderr.push(data);
  }

  recordExitCode(code: number) {
    this.code = code;
  }

  recordError(err: Error) {
    this.error = err;
  }

  exitCode() {
    return this.code;
  }

  stdout() {
    return this.cmdStdout;
  }

  stderr() {
    return this.cmdStderr;
  }
}