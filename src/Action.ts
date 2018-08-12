import { IAction, IActionConfig, IActionResult, IHandleRequest, ISession } from './interface';
import { compileError } from './compileError';
import { makePreCompiledError } from './makePreCompiledError';
import { createLogger } from './utils/logger';

const logger = createLogger('ACTION');

export class Action implements IAction {
  private action: IActionConfig;
  constructor(actionConfig: IActionConfig) {
    this.action = actionConfig;
  }
  getName() {
    return this.action.name;
  }
  getUrl(): string {
    let path: string = '/api';
    if (this.action.version) {
      path += `/v${this.action.version}`;
    }
    if (this.action.prefix) {
      path += `/${this.action.prefix}`;
    }

    path += `${this.action.path}`;

    return path;
  }
  getMethod() {
    return this.action.method;
  }
  isWhiteListed() {
    return !!this.action.whiteListed;
  }
  validateInput(data: any): boolean {
    // TODO: forbid invalidated inputs
    if (this.action.validateInput === null) {
      return true;
    }

    const validationResult = this.action.validateInput(data);

    return validationResult !== true ? false : true;
  }
  prepareResponse(actionData: IActionResult): IHandleRequest {
    let result: string;
    if (!actionData || actionData.error) {
      result = compileError(actionData);
    } else if (typeof actionData === 'string') {
      result = actionData;
    } else if (this.action.compileResponse !== null) {
      try {
        result = this.action.compileResponse(actionData);
      } catch (err) {
        logger.error(err);

        return makePreCompiledError(500);
      }
    } else {
      // TODO: all responses should have compile fn - remove it later
      logger.warn('all responses should have compileResponse fn');
      result = JSON.stringify(actionData);
    }
    const status = actionData.status || 200;

    return { result, status, cookie: actionData.cookie };
  }
  async handle(session: ISession, inputData: any): Promise<IHandleRequest> {
    const result: IActionResult = await this.action.handle(session, inputData);

    return this.prepareResponse(result);
  }
}
