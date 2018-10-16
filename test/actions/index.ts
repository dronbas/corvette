import * as Validator from 'fastest-validator';
import * as fastJson from 'fast-json-stringify';
import { IActionConfig } from '../../src/interface';

const v = new Validator();
interface ITestActionConfig extends IActionConfig {
  test: any;
}
export const actions: Array<ITestActionConfig> = [
  {
    test: { status: 500, body: { error: 'Internal Server Error' } },
    name: 'Test 500 error',
    path: '/white/listed/err/500',
    method: 'GET',
    version: 0,
    prefix: '',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'string' }),
    handle() {
      throw new Error('AAA');
    },
  },
  {
    test: { cors: true, origin: '127.0.0.1', status: 204, body: '' },
    name: 'Test cors',
    path: '/white/listed/err/cors',
    method: 'OPTIONS',
    version: 0,
    prefix: '',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: null,
    handle() {},
  },
  {
    test: { origin: '127.0.0.1', status: 500, body: { error: 'Internal Server Error' } },
    name: 'Test 500 error on compile response',
    path: '/white/listed/err/500/compile',
    method: 'GET',
    version: 0,
    prefix: '',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        mail: {
          type: 'string',
        },
      },
      required: ['mail'],
    }),
    handle() {
      return { name: 'test' };
    },
  },
  {
    test: { status: 200, body: { error: 'custom error' } },
    name: 'Test custom 200 error',
    path: '/white/listed/err/custom/200',
    method: 'GET',
    version: 0,
    prefix: '',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'string' }),
    handle() {
      return {
        error: 'custom error',
      };
    },
  },
  {
    test: { status: 418, body: { error: 'custom 418 error' } },
    name: 'Test custom error with status',
    path: '/white/listed/err/custom/status',
    method: 'GET',
    version: 0,
    prefix: '',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'string' }),
    handle() {
      return {
        error: 'custom 418 error',
        status: 418,
      };
    },
  },
  {
    test: { body: 'OK', status: 200 },
    name: 'Test white listed string response',
    path: '/white/listed/string',
    method: 'GET',
    version: 0,
    prefix: '',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'string' }),
    handle() {
      return 'OK';
    },
  },
  {
    test: { body: { state: 'OK' }, status: 200 },
    name: 'Test white listed compiled response',
    path: '/white/listed/compiled',
    method: 'GET',
    version: 0,
    prefix: '',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: { body: { state: 'OK' }, status: 200 },
    name: 'Test white listed response with prefix',
    path: '/white/listed/compiled-prefix',
    method: 'GET',
    version: 0,
    prefix: 'test',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: null,
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: { body: { state: 'OK' }, status: 200 },
    name: 'Test white listed compiled response with prefix and version',
    path: '/white/listed/compiled-prefix/version',
    method: 'GET',
    version: 12,
    prefix: 'test',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: { postData: { v1: 'text', v2: { v3: 'as' } }, body: { error: 'Bad Request' }, status: 400 },
    name: 'Test bad post validation',
    path: '/white/listed/bad/validation',
    method: 'POST',
    version: 12,
    prefix: 'test',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: v.compile({
      v1: 'number',
      v2: 'string',
    }),
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: { query: 'someParam=1', body: { state: 'OK' }, status: 200 },
    name: 'Test query validation',
    path: '/white/listed/ok/query/validation',
    method: 'GET',
    version: 12,
    prefix: 'test',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: v.compile({
      someParam: 'string',
    }),
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: { postData: { v1: 'text', v2: { v3: 'test@test.te' } }, body: { state: 'OK' }, status: 200 },
    name: 'Test success post validation',
    path: '/white/listed/good/validation',
    method: 'POST',
    version: 12,
    prefix: 'test',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: v.compile({
      v1: 'string',
      v2: {
        type: 'object',
        props: {
          v3: 'email',
        },
      },
    }),
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: {
      postData: { v1: 'text', v2: { v3: 'test@test.te' } },
      body: { v1: 'text', v2: { v3: 'test@test.te' } },
      status: 200,
    },
    name: 'Test POST echo',
    path: '/white/listed/post-echo',
    method: 'POST',
    version: 12,
    prefix: 'test',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: v.compile({
      v1: 'string',
      v2: {
        type: 'object',
        props: {
          v3: 'email',
        },
      },
    }),
    compileResponse: fastJson({
      type: 'object',
      properties: { v1: { type: 'string' }, v2: { type: 'object', properties: { v3: { type: 'string' } } } },
    }),
    handle(session, params) {
      return params;
    },
  },
  {
    test: { body: { state: 'OK' }, headers: { 'set-cookie': ['test=test-cookie;'] }, status: 200 },
    name: 'Test set cookie',
    path: '/set-cookie',
    method: 'GET',
    version: 1,
    prefix: 'test',
    signed: false,
    whiteListed: true,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({
      type: 'object',
      properties: { state: { type: 'string' } },
    }),
    handle() {
      return { state: 'OK', cookie: 'test=test-cookie;' };
    },
  },
  {
    test: { body: { error: 'Forbidden' }, status: 403 },
    name: 'Test forbidden response',
    path: '/forbidden',
    method: 'GET',
    version: 1,
    prefix: 'test',
    signed: false,
    whiteListed: false,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: ({ session }) => ({ cookie: `sid=${session.sessionId}`, body: { state: 'OK' }, status: 200 }),
    name: 'Test response with authorization',
    path: '/need/auth',
    method: 'GET',
    version: 1,
    prefix: 'test',
    signed: false,
    whiteListed: false,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: { body: { error: 'Forbidden' }, status: 403 },
    name: 'Test response without group',
    path: '/need/auth/group',
    method: 'GET',
    version: 1,
    prefix: 'test',
    signed: false,
    whiteListed: false,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: ({ session }) => ({
      cookie: `sid=${session.sessionId}`,
      agent: 'new-suspicious-agent',
      body: { error: 'Forbidden' },
      status: 403,
    }),
    name: 'Test session expiration with new agent',
    path: '/need/auth/new-agent',
    method: 'GET',
    version: 1,
    prefix: 'test',
    signed: false,
    whiteListed: false,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
  {
    test: ({ sessionBadIp }) => ({
      cookie: `sid=${sessionBadIp.sessionId}`,
      body: { error: 'Forbidden' },
      status: 403,
    }),
    name: 'Test session expiration with new ip',
    path: '/need/auth/new-ip',
    method: 'GET',
    version: 1,
    prefix: 'test',
    signed: false,
    whiteListed: false,
    rateLimitWeight: 1,
    validateInput: null,
    compileResponse: fastJson({ type: 'object', properties: { state: { type: 'string' } } }),
    handle() {
      return { state: 'OK' };
    },
  },
];
