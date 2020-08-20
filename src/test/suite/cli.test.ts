import * as assert from 'assert';
import { expect } from 'chai';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { invokeCli, ResultProcessor } from '../../cli/childProcessor';
import { invokeCliQuiet, InvokeCliResult } from '../../cli/childProcessorQuiet';
import { generateLocator } from '../../cli/locator';

suite('Cli Test Suite', () => {
  test('run normal', async () => {
    const res = await invokeCli('echo', ['running a test']);
    assert.equal(res instanceof ResultProcessor, true);
    assert.equal(res.exitCode(), 0);
  });

  test('command not exist', async () => {
    const res = await invokeCli('commandNotExist', []);
    assert.notEqual(res.exitCode(), 0);    

    try {
      res.throwIfFail();
      assert.equal(0, 1, "cli didn't throw exception");
    } catch {
    }
  });

  test('run quietly normal', async () => {
    const res = await invokeCliQuiet('echo', ['running a test']);
    assert.equal(res instanceof InvokeCliResult, true);
    assert.equal(res.exitCode(), 0);
    assert.equal(res.stdout()[0].search('running a test'), 0);
  });

  test('run quietly abnormal', async () => {
    const res = await invokeCliQuiet('commandNotExist', []);

    try {
      res.throwIfFail();
      assert.equal(0, 1, "cli didn't throw exception");
    } catch {
    }
  });

  test('generate bsam locator', () => {
    const locator = generateLocator();
    expect(locator).to.respondTo('candidatePaths');
  });

});
