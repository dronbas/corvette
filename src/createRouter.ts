import * as Router from 'find-my-way';
import { makePreCompiledError } from './makePreCompiledError';

export function createRouter(): Router {
  return Router({
    defaultRoute: (req, res) => {
      const { result, status } = makePreCompiledError(404);
      res.statusCode = status;
      res.end(result);
    },
    ignoreTrailingSlash: true,
  });
}
