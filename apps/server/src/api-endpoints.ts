import { type Express } from 'express';

export const apiInit = (app: Express) => {
  app.get('/api', (req, res) => {
    res.send({
      name: 'hello',
    });
  });
};
