import { IncomingMessage } from 'http';
import { safeParse } from './safeParse';

export function fetchBody(req: IncomingMessage): Promise<any> {
  return new Promise(resolve => {
    let body: string = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk;
    });

    req.on('end', () => {
      resolve(safeParse(body));
    });
  });
}
