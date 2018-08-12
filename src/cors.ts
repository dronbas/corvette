import { IncomingMessage, ServerResponse } from 'http';

export function cors(request: IncomingMessage, response: ServerResponse, host: string) {
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', host);
  response.setHeader('Access-Control-Expose-Headers', 'cookie');
  response.setHeader('Vary', 'Origin');

  // Preflight request https://developer.mozilla.org/ru/docs/Glossary/preflight_request
  if (request.method === 'OPTIONS' && request.headers['access-control-request-method']) {
    response.setHeader('Access-Control-Allow-Headers', 'cookie');
    response.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, POST, OPTIONS');
    response.setHeader('Access-Control-Max-Age', '86400');
    response.writeHead(204, { 'Content-Length': 0 }); // 204 - No content
    response.end();

    return true;
  }

  return false;
}
