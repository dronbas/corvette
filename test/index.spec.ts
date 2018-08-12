import { testEngine } from './testEngine';

describe('E2E tests', async () => {
  before(async () => {
    testEngine();
  });
  it('mocha hack', () => {});
});
