export interface IActionResult {
  status?: number;
  error?: string;
  cookie?: string;
  data: any;
}

export interface IHandleRequest {
  result: string;
  status: number;
  cookie?: string;
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
