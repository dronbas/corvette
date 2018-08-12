import * as fastJson from 'fast-json-stringify';

export const compileError = fastJson({
  title: 'Error schema',
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
  required: ['error'],
});
