const EventSource = require('eventsource');
const path = require('path');
const util = require('util');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec);
const signScript = path.resolve(__dirname, '../sign/powerled.exe');

let es = new EventSource('http://localhost:3000/stream');
let update = null;
let nextUpdate = null;

function updateSign(newValue) {
  return exec(`Powershell.exe -Command "Start-Process -Wait '${signScript}' ${newValue}"`);
}

function next() {
  if (nextUpdate) {
    update = nextUpdate().then(next);
    nextUpdate = null;
  } else {
    update = null;
  }
}

es.addEventListener('count_change', function (e) {
  let newValue = e.data;
  console.log(`Car Count: ${newValue}`);

  let updateAsync = () => updateSign(newValue);
  if (update) {
    nextUpdate = updateAsync;
  } else {
    update = updateAsync().then(next);
  }
});

process.on('beforeExit', () => {
  es.close();
});
