import * as http from 'http';
import * as Router from 'find-my-way';
import { parse as parseUrl } from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { cors } from './cors';
import { Action } from './Action';
import { fetchBody } from './utils/fetchBody';
import { createRouter } from './createRouter';
import { createLogger } from './utils/logger';
import { makePreCompiledError } from './makePreCompiledError';
import { IAction, IActionConfig, IHandleRequest, IAuthService } from './interface';
const logger = createLogger('API');

export { createLogger } from './utils/logger';
export * from './interface';

export interface ICorvetteOptions {
  actions: Array<IActionConfig>;
  port?: number;
  keepAliveTimeout?: number;
  origins: { [key: string]: boolean };
  authService: IAuthService;
}

export class Corvette {
  private actions: Array<IAction>;
  private port: number;
  private keepAliveTimeout: number;
  private origins: { [key: string]: boolean };
  private authService: IAuthService;
  constructor({ actions, port = 3000, keepAliveTimeout = 60e3, origins, authService }: ICorvetteOptions) {
    this.port = port;
    this.actions = this.compileActions(actions);
    this.keepAliveTimeout = keepAliveTimeout;
    this.origins = origins;
    this.authService = authService;
  }

  private compileActions(actionConfigs: Array<IActionConfig>): Array<Action> {
    const actions = actionConfigs.map((actionConfig: IActionConfig) => {
      const action = new Action(actionConfig);
      // TODO: register an action;

      return action;
    });

    return actions;
  }

  private getIp(req: IncomingMessage): string {
    return (req.headers['x-forwarded-for'] || '')[0] || req.socket.remoteAddress;
  }

  private async handleRequest(req: IncomingMessage, action: IAction, params: any): Promise<IHandleRequest> {
    const { query } = parseUrl(req.url, true);
    let session;
    const ip = this.getIp(req);
    if (!action.isWhiteListed()) {
      session = await this.authService.getSession(req.headers as { [key: string]: string }, ip);
      if (!this.authService.checkAccess(action.getName(), session)) {
        return makePreCompiledError(403);
      }
    }

    let body;

    if (req.method === 'POST') {
      body = await fetchBody(req);
    }

    const inputData = Object.assign({}, params, query, body, { ip, headers: req.headers });

    if (!action.validateInput(inputData)) {
      return makePreCompiledError(400);
    }

    return action.handle(session, inputData);
  }
  private setCookie(res: ServerResponse, cookie: string) {
    res.setHeader('Set-Cookie', cookie);
  }

  private async createRoute(req: IncomingMessage, res: ServerResponse, action: IAction, params: any) {
    const origin = req.headers.origin as string;
    const host = this.origins[origin] && origin;
    if (host) {
      const options = cors(req, res, host);
      if (options) {
        return;
      }
    }
    const { result, status, cookie } = await this.handleRequest(req, action, params).catch(err => {
      logger.error(err);

      return makePreCompiledError(500);
    });

    if (cookie) {
      this.setCookie(res, cookie);
    }
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(result);
  }
  private createRoutes(router: Router) {
    this.actions.forEach((action: IAction) => {
      router.on(action.getMethod(), action.getUrl(), (req: IncomingMessage, res: ServerResponse, params: any) =>
        this.createRoute(req, res, action, params),
      );
    });
  }

  private createApp(httpServer) {
    const router = createRouter();
    this.createRoutes(router);

    return httpServer.createServer(async (request: IncomingMessage, response: ServerResponse) => {
      router.lookup(request, response);
    });
  }

  startServer(httpServer?: any) {
    return new Promise(resolve => {
      if (!httpServer) {
        httpServer = http;
      }
      const app = this.createApp(httpServer);
      app.keepAliveTimeout = this.keepAliveTimeout;
      app.listen(this.port, () => {
        console.log(`app is listening on ${this.port}`);

        return resolve(app);
      });
    });
  }
  // for tests
  getActions() {
    return this.actions;
  }
}
