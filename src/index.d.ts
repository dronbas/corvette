import { IncomingMessage } from 'http';

declare namespace Corvette {
  class Corvette<T = ICorvetteOptions> {
    constructor(options: ICorvetteOptions);
    // TODO: describe startServer
    startServer(httpServer?: any): Promise<any>;
    getActions(): Array<IActionConfig>;
  }
  export function createLogger(loggerName: string);
  export interface ICorvetteOptions {
    actions: Array<IActionConfig>;
    port?: number;
    authService: IAuthService;
    keepAliveTimeout?: number;
    origins: { [key: string]: boolean };
  }
  export interface IActionResult {
    status?: number;
    error?: string;
    data: any;
  }

  export interface IHandleRequest {
    result: string;
    status: number;
  }
  type method = 'OPTIONS' | 'GET' | 'POST' | 'DELETE';

  export interface IActionConfig {
    name: string;
    path: string;
    method: method;
    version: number;
    prefix: string;
    signed: boolean;
    whiteListed: boolean;
    rateLimitWeight: 1;
    validateInput: Function | null;
    compileResponse: Function | null;
    handle: Function;
  }

  export interface IAction {
    getName(): string;
    getUrl(): string;
    getMethod(): method;
    isWhiteListed(): boolean;
    validateInput(data: any): boolean;
    handle(session: ISession, inputData: any): Promise<IHandleRequest>;
    prepareResponse(actionData: IActionResult): IHandleRequest;
  }

  export interface ISession {
    sessionId: string;
  }

  export interface IAuthService<T = IUserGroups> {
    createSession(data: any): Promise<ISession>;
    getSession(headers: { [key: string]: string }, ip: string): Promise<ISession | null>;
    checkAccess(actionName: string, session: ISession);
  }

  export interface IUserGroups {
    [key: string]: {
      [key: string]: boolean;
    };
  }
}

export = Corvette;
