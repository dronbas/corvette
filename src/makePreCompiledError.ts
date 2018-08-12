import { IHandleRequest } from './interface';
import { compileError } from './compileError';

const errors = {
  400: compileError({ error: 'Bad Request' }),
  403: compileError({ error: 'Forbidden' }),
  404: compileError({ error: 'Not Found' }),
  405: compileError({ error: 'Method Not Allowed' }),
  500: compileError({ error: 'Internal Server Error' }),
};

export function makePreCompiledError(status: 400 | 403 | 404 | 405 | 500): IHandleRequest {
  return { result: errors[status], status };
}
