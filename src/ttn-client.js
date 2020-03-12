// TODO: This TTN client has been deprecated
const { data } = require('ttn');

module.exports.connectToTTN = function connectToTTN(db, appID, accessKey) {
  // Discover handler and open mqtt connection
  data(appID, accessKey)
    .then(function (client) {
      // TODO: Gracefully fail when appID or accessKey do not match
      //       Currently the app crashes with "Connection refused: Not authorized"
      console.log(`[TTN] Connected to TTN application "${client.appID}"`);
      client.on('uplink', function (devID, payload) {
        console.log('[TTN] Received uplink from ', devID)
        console.log(payload);

        const { payload_fields = {} } = payload || {};

        // TODO: properly implement the follwoing
        if (payload_fields['digital_in_55']) {
          db.setValue(payload_fields['digital_in_55']);
        }
        if (payload_fields['digital_in_33']) {
          db.setValue(payload_fields['digital_in_33']);
        }
      });
    })
    .catch(function (err) {
      console.error(err);
    });
}
