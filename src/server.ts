import * as express from 'express';
import * as path from 'path';
import * as morgan from 'morgan';
import signaling from './signaling';
import Options from './class/options';
import { reset as resetHandler }from './class/httphandler';

export const createServer = (config: Options): express.Application => {
  const app: express.Application = express();
  resetHandler(config.mode);
  // logging http access
  if (config.logging != "none") {
    app.use(morgan(config.logging));
  }
  // const signal = require('./signaling');
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.get('/config', (req, res) => res.json({ useWebSocket: config.websocket, startupMode: config.mode, logging: config.logging }));
  app.use('/signaling', signaling);
  
  app.use(express.static(path.join(__dirname, '../client/public')));
  app.use('/module', express.static(path.join(__dirname, '../client/src')));
  
  app.get('/stream', (req, res) => res.sendFile('../client/public/stream/index.html'));
  app.get('/details', (req, res) => res.sendFile('../client/public/receiver/index.html'));

  return app;
};
