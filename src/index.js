/*
 * SLI PL4 - Central Server
 * by Madhav Varshney
 * 
 * Routes:
 * 
 * GET   /dashboard   Web dashboard for viewing and modifying the car count
 * POST  /event       Endpoint for sending events; timestamp is the milliseconds since Epoch
 *                    Format: { timestamp: #, type: "IN" | "OUT" } 
 * EVT   /stream      EventSource stream for receiving events, e.g. car count updates
 *                    Receives "sensor_event" and "count_change" events
 */

const Koa = require('koa');
const logger = require('koa-logger');
const sse = require('koa-sse-stream');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const { Subscription } = require('./db');

const app = new Koa();
const router = new Router();
const db = new Subscription();

// let count = 0;

const htmlData = `<!DOCTYPE html>
<html>
<head>
  <title>SLI PL4 Dashboard</title>
  <style>
    * {
      box-sizing: border-box;
    }
    html, body {
      font-family: Verdana;
      height: 100%;
      padding: 0;
      margin: 0;
    }
    body {
      padding: 0px 24px 24px 24px;
      display: flex;
      flex-direction: column;
    }
    button:hover {
      background-color: #4caf50cf;
    }
    button {
      display: inline-block;
      padding: 12px;
      font-family: Verdana;
      font-size: 16px;
      background-color: #4CAF50; /* Green */
      border: none;
      color: white;
      text-align: center;
      text-decoration: none;
      cursor: pointer;
    }
    #events {
      flex: 1;
      overflow: auto;
      border: black 1px solid;
      padding: 0 24px;
    }
  </style>  
</head>
<body>
  <h2>SLI PL4 Dashboard</h2>
  <h3>Car Count: <span id="count"></span></h3>
  <span style="margin: 12px 0">
    <button onclick="increment()">INCREMENT</button>
    <button onclick="decrement()">DECREMENT</button>
  </span>
  <h4>Events:</h4>
  <div id="events"></div>
  <script>
    var es = new EventSource('/stream');
    var display = document.getElementById('count');
    var eventsDiv = document.getElementById('events');
    
    function increment() {
      sendEvent('IN');
    }
    function decrement() {
      sendEvent('OUT');
    }
    async function sendEvent(type) {
      var now = Date.now();
      var req = await fetch('/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: now,
          type,
        }),
      });
      var res = await req.json();
      if (res.status === 'failed' && res.error) {
        var eventItem = document.createElement('p');
        eventItem.innerHTML = new Date(now).toLocaleString() + " - <b> ERROR: " + res.error + "</b>";
        eventsDiv.appendChild(eventItem);
        eventsDiv.scrollTop = eventsDiv.scrollHeight;
      }
    }
    es.addEventListener('count_change', function (e) {
      display.innerText = e.data;
    });
    es.addEventListener('sensor_event', function (e) {
      var event = JSON.parse(e.data);
      console.log(event);

      var eventItem = document.createElement('p');
      eventItem.innerHTML = new Date(event.timestamp).toLocaleString() + " - Direction: <b>" + event.type + "</b>";
      eventsDiv.appendChild(eventItem);
      eventsDiv.scrollTop = eventsDiv.scrollHeight;
    });
  </script>
</body>
</html>`;

app.use(logger());
app.use(bodyParser());

router.get(['/', '/dashboard'], async function(ctx) {
  ctx.response.headers['Content-Type'] = 'text/html';
  ctx.body = htmlData;
});

router.post('/event', async function(ctx) {
  const event = ctx.request.body || {};
  console.log(event);
  try {
    db.onEvent(event);
    ctx.response.headers['Content-Type'] = 'application/json';
    ctx.body = JSON.stringify({ status: 'success' });
  } catch (err) {
    ctx.status = 400;
    ctx.response.headers['Content-Type'] = 'application/json';
    ctx.body = JSON.stringify({ status: 'failed', error: err.message });
  }
});

router.get('/stream', sse({
  maxClients: 5000,
  pingInterval: 60000,
}));

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
  .listen(3000);
