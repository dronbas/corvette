import { parse } from 'cookie';
import { ISession, IAuthService, IUserGroups } from '../src';
import * as hyperid from 'hyperid';

interface ICustomSession extends ISession {
  apiKeyId: string;
  ip: string;
  userAgent: string;
  userGroups: Array<string>;
  user: any;
}

const uuid = hyperid({
  urlSafe: true,
  fixedLength: true,
});

export class AuthService implements IAuthService {
  private sessions: Map<string, ICustomSession>;
  private userGroups: IUserGroups;
  constructor(userGroups) {
    this.sessions = new Map();
    this.userGroups = userGroups;
  }
  private async fetchSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }
  async createSession(sessionData) {
    const sessionId = uuid();
    const session = { ...sessionData, sessionId };
    this.sessions.set(sessionId, session);

    return session;
  }
  async getSession(headers: { [key: string]: string }, ip: string): Promise<ICustomSession> {
    let session = null;
    const userAgent = headers['user-agent'];
    // let apiKey = headers['x-api-key'];
    const cookie = parse(headers.cookie || '');
    const sid = cookie['sid'];
    if (sid !== undefined) {
      session = await this.fetchSession(sid);
    }

    if (session && (session.ip !== ip || session.userAgent !== userAgent)) {
      this.sessions.delete(sid);

      return null;
    }

    return session;
  }
  checkAccess(actionName: string, session: ICustomSession): boolean {
    const userGroups: Array<string> = session ? session.userGroups : ['guest'];

    return userGroups.some(userGroup => this.userGroups[userGroup] && this.userGroups[userGroup][actionName]);
  }
}
export const defaultAgent = 'custom user agent';

export const defaultSession = {
  apiKeyId: '',
  ip: '::ffff:127.0.0.1',
  userAgent: defaultAgent,
  user: {
    id: 777,
    name: 'John Silver',
  },
  userGroups: ['user'],
};
