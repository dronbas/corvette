import * as http from 'http';
import { expect } from 'chai';
import { actions } from './actions';
import { IAction, IAuthService, IActionConfig } from '../src/interface';
import { Corvette } from '../src/index';
import { makeRequest, IResponse } from './makeRequest';
import { defaultSession, AuthService, defaultAgent } from './AuthServiceMock';

const mapActionsToNames = {};

async function makeTest(action, testData) {
  const actionsHeaders: any = {};
  if (testData.cookie) {
    actionsHeaders.cookie = testData.cookie;
  }
  if (testData.origin) {
    actionsHeaders.origin = testData.origin;
  }
  if (testData.cors) {
    actionsHeaders['access-control-request-method'] = 'GET';
  }
  actionsHeaders['user-agent'] = testData.agent ? testData.agent : defaultAgent;
  const { status, body, headers }: IResponse = await makeRequest(
    action.getMethod(),
    testData.query ? `${action.getUrl()}/?${testData.query}` : action.getUrl(),
    testData.postData,
    actionsHeaders,
  );
  let data;
  try {
    data = JSON.parse(body);
  } catch (e) {
    data = body;
  }
  expect(status).eql(testData.status || 200);
  expect(data).eql(testData.body);
  for (const key in testData.headers) {
    expect(headers[key]).eql(testData.headers[key]);
  }
}

function makeTests(httpServer, authService, description: string) {
  return describe(description, async () => {
    let server;
    const corvette = new Corvette({
      actions,
      origins: { '127.0.0.1': true },
      authService,
    });
    let session, sessionBadIp;
    before(async () => {
      [session, sessionBadIp] = await Promise.all([
        authService.createSession(defaultSession),
        authService.createSession({
          ...defaultSession,
          ip: '192.168.1.1',
        }),
      ]);
      server = await corvette.startServer(httpServer);
    });
    after(() => server.close());
    it('Test not found', async () => {
      const { status }: IResponse = await makeRequest('GET', '/n/ot/found/e/r/r/');
      expect(status).eql(404);
    });

    corvette.getActions().forEach((action: IAction) => {
      return it(action.getName(), async () => {
        const actionCfg = mapActionsToNames[action.getName()];
        const testData =
          typeof actionCfg.test === 'function' ? actionCfg.test({ session, sessionBadIp }) : actionCfg.test;
        await makeTest(action, testData);
      });
    });
  });
}

export function testEngine() {
  const authService: IAuthService = new AuthService({
    user: {
      'Test response with authorization': true,
      'Test response without group': false,
      'Test session expiration with new agent': true,
    },
  });
  actions.forEach((action: IActionConfig) => {
    mapActionsToNames[action.name] = action;
  });
  makeTests(false, authService, 'Test Corvette with native HTTP Server');
  makeTests(http, authService, 'Test Corvette with external HTTP Server(native)');
}
