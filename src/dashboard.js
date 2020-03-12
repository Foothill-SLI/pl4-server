module.exports.htmlPage = `<!DOCTYPE html>
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
      var req = await fetch('/admin/event', {
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
