import * as debug from 'debug';
const log: debug.IDebugger = debug('pts:server');

import * as http from 'http';
import {port, host} from '../share/config'
import apiSendMessage from './api-send-message';
import {urlRegExp as sendMessageUrl} from './api-send-message';
import l10n from '../share/l10n';
import sendAlert from '../share/send-alert';
import {getClientAddress} from '../share/utill';

http
.createServer(serverListener)
.listen(port, host)
;
console.log(`Server start on http://${host}:${port}/`);

async function serverListener (request: http.IncomingMessage, response: http.ServerResponse) {
  log(`New request: ${request.url}`);

  if (request.url.match(sendMessageUrl)) {
    const reply: any = await apiSendMessage(request);
    returnData(response, reply);
    return;
  }

  //else
  if (request.url === '/favicon.ico') {
    responseFavicon(response);
    return;
  }

  //else
  returnData(response, {
    ok: false,
    error_code: 404
  });
  sendAlert(404, {
    ip: getClientAddress(request),
    url: request.url,
    method: request.method,
  });
}

function returnData (response: http.ServerResponse, data: Object) {
  if (data['error_code']) {
    data['error_description'] = l10n('error_' + data['error_code']);
  }
  const statusCode: number = data['error_code'] > 400 ? data['error_code'] : 200;
  const content: string = JSON.stringify(data);
  const heads: any = {
    'Content-Type': 'application/json',
    'Server': 'PTC Server',
  };
  response.writeHead(statusCode, heads);
  response.end(content);
  log('returnData ', statusCode, data);
}

function responseFavicon (response: http.ServerResponse) {
  const faviconUrl: string = 'http://app.ptciorder.com/favicon.ico';
  redirectUrl(response, faviconUrl);
}

function redirectUrl (response: http.ServerResponse, url: string, permanently: boolean = false) {
  const code: number  = permanently ? 301 : 302;
  const heads: any = {
    'Location': url,
    'Server': 'PTC Server',
  };
  response.writeHead(code, heads);
  response.end();
}
