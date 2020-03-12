#! /usr/bin/env node

/*
 * SLI PL4 - Central Server
 * by Madhav Varshney
 *
 * Routes:
 *
 * GET   /dashboard     Web dashboard for viewing and modifying the car count
 * POST  /admin/event   Endpoint for manually sending events
 *                      Body Params: { timestamp, type } 
 * GET   /count         Get current car count
 *                      Response: { status, count }
 * EVS   /stream        EventSource stream for receiving events, i.e. car count updates
 *                      Receives "sensor_event" and "count_change" events
 * POST  /handshake     Endpoint to establish connection with controllers
 *                      and receive public keys for identity verification
 *                      Body Params: { device_id, public_key: "" }
 * POST  /event         Recieves events from controllers i.e. camera controllers
 *                      Body Params: { device_id, token: JWT }
 *                      JWT: { device_id, type, timestamp }
 *
 * Data Formats:
 *
 * ""    status         "success" | "failed"
 * ""    device_id      The ID of the device
 * #     timestamp      Milliseconds since Epoch
 * ""    type           "IN" | "OUT"
 * #     count          The number of available parking lot spots
 * JWT   token          A JSON Webtoken that is signed using device-specific private keys
 *
 */

const Koa = require('koa');
const Router = require('@koa/router');
const logger = require('koa-logger');
const sse = require('koa-sse-stream');
const bodyParser = require('koa-bodyparser');
const jwt = require('jsonwebtoken');

const { Subscription } = require('./db');
const { htmlPage } = require('./dashboard');
const { connectToTTN } = require('./ttn-client');

const app = new Koa();
const router = new Router();
const db = new Subscription();

const devices = {};

function registerDevice(id, key) {
  devices[id] = { key };
  console.log(`Device with id ${id} registered`);
}

// TODO: don't hardcode the string below
const appID = process.env.TTN_APP_ID || 'try-2';
const accessKey = process.env.TTN_ACCESS_KEY;
if (appID && appID !== '' && accessKey && accessKey != '') {
  connectToTTN(db, appID, accessKey);
}

app.use(logger());
app.use(bodyParser());

router.get(['/', '/dashboard'], async function(ctx) {
  ctx.type = 'text/html';
  ctx.body = htmlPage;
});

router.post('/handshake', async function (ctx) {
  const { device_id, public_key } = ctx.request.body;
  if (!device_id, !public_key) {
    ctx.status = 400;
    ctx.body = { status: 'failed', error: 'Required parameters not provided.' };
    return;
  }

  // TODO: add manual approval system
  registerDevice(device_id, public_key);
  ctx.body = { status: 'success' };
});

router.post('/event', async function (ctx) {
  const { device_id, token } = ctx.request.body;
  const device = devices[device_id];
  if (!token || !device) {
    ctx.status = 400;
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, device.key);
    // console.log(decoded);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      ctx.status = 401;
      ctx.body = { status: 'failed', error: "JWT Token Expired" };
      return;
    } else {
      throw err;
    }
  }

  const event = {
    type: decoded.type,
    timestamp: decoded.timestamp,
    device_id: decoded.device_id,
  };
  // console.log(event);
  try {
    db.onEvent(event);
    ctx.body = { status: 'success' };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { status: 'failed', error: err.message };
  }
});

router.post('/admin/event', async function(ctx) {
  const event = ctx.request.body || {};
  console.log(event);
  try {
    db.onEvent(event);
    ctx.body = { status: 'success' };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { status: 'failed', error: err.message };
  }
});

// TODO: add some auth (e.g. API key check)
router.get('/count', async function (ctx) {
  ctx.body = { status: 'success', count: db.value };
});

// TODO: add some auth (e.g. API key check)
router.get('/stream', sse({
  maxClients: 5000,
  pingInterval: 60000,
}));

// TODO: add some auth (e.g. API key check)
router.get('/stream', async function(ctx) {
  ctx.sse.send({ data: db.value, event: 'count_change' });
  db.subscribe(ctx.sse);
  ctx.sse.on('close', () => {
    db.unsubscribe(ctx.sse);
  });
  // ctx.sse is a writable stream and has extra method 'send'
  // setInterval(() => {
  //   ctx.sse.send({ data: db.value, event: 'count_change' });
  // }, 1000);
  // ctx.sse.sendEnd();
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => console.log('\n[INFO] Server is listening on port 3000'));
