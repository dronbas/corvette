import { request, IncomingMessage } from 'http';
const HTTP_PORT = 3000;

export interface IResponse {
  status: number;
  headers?: any;
  body: any;
}

export const makeRequest = (
  method: 'OPTIONS' | 'GET' | 'POST' | 'DELETE',
  path: string,
  postData: any = {},
  headers: any = {},
): Promise<IResponse> =>
  new Promise((resolve, reject) => {
    const options = {
      path,
      method,
      port: HTTP_PORT,
      host: '127.0.0.1',
    };
    const req = request({ ...options, headers: { ...headers, connection: 'keep-alive' } }, (res: IncomingMessage) => {
      const body: any = [];
      const status = res.statusCode;
      res.on('data', chunk => {
        body.push(chunk);
      });
      res.on('end', () => {
        resolve({ headers: res.headers, status, body: body.toString() });
      });
    });

    req.setHeader('content-type', 'application/json');

    req.on('error', reject);

    if (method === 'POST') {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
