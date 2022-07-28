import { type Express } from 'express';
import { logging } from '@ha-assistant/listner';
import { format } from 'util';

export const authInit = (app: Express) => {

  app.get('/login', (req, res) => {
    res.send(`
    <html>
  <body>
  <p>${req.query.response_url}</p>
  <form action="/login" method="post">
  <input type="hidden" name="response_url" value="${req.query.response_url}" />
  <button type="submit" style="font-size:14pt">Link this service to Google</button>
  </form>
  </body>
  </html>
  `);
  });

  app.post('/login', async (req, res) => {
    logging.debug('post login query', req.query);
    logging.debug('post login body', req.body);
    // Here, you should validate the user account.
    // In this sample, we do not do that.
    const responseUrl = decodeURIComponent(req.body.response_url as string);
    logging.debug('redirect:', responseUrl);
    return res.redirect(responseUrl);
  });

  app.get('/api/fakeauth', async (req, res) => {
    logging.warn('/fakeauth', req.query);
    const responseUrl = format(
      '%s?code=%s&state=%s',
      decodeURIComponent(req.query.redirect_uri as string),
      'xxxxxx',
      req.query.state
    );
    const redirectUrl = `/login?response_url=${encodeURIComponent(
      responseUrl
    )}`;
    logging.warn('redirect:', redirectUrl);
    return res.redirect(redirectUrl);
  });

  app.all('/api/faketoken', async (req, res) => {
    logging.warn('/faketoken', req.query);
    const grantType = req.query.grant_type
      ? req.query.grant_type
      : req.body.grant_type;
    const secondsInDay = 86400; // 60 * 60 * 24
    const HTTP_STATUS_OK = 200;
    let token;
    if (grantType === 'authorization_code') {
      token = {
        token_type: 'bearer',
        access_token: '123access',
        refresh_token: '123refresh',
        expires_in: secondsInDay,
      };
    } else if (grantType === 'refresh_token') {
      token = {
        token_type: 'bearer',
        access_token: '123access',
        expires_in: secondsInDay,
      };
    }
    logging.warn('token:', token);
    res.status(HTTP_STATUS_OK).json(token);
  });
};
