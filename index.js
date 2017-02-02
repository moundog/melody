'use strict';

let express = require('express');
let bodyParser = require('body-parser');
let ApiAiAssistant = require('actions-on-google').ApiAiAssistant;
let winston = require('winston');

// Configuration
const config = require('./config.js');
winston.level = 'info';

let app = express();
app.set('port', (config.port || 8080));
app.use(bodyParser.json({type: 'application/json'}));

app.post('/', function (request, response) {

  winston.log('info', 'Processing request from API.AI');

  const assistant = new ApiAiAssistant({request: request, response: response});

  const FORECAST_INTENT = 'input.getForecast'; // the action name from the API.AI intent

  function forecastIntent(assistant) {
    assistant.tell('I will give you the weather forecast');
  }

  let actionMap = new Map();
  actionMap.set(FORECAST_INTENT, forecastIntent);

  assistant.handleRequest(actionMap);

});

// Start the server
let server = app.listen(app.get('port'), function () {
  winston.log('info', 'Express listening on port ' + config.port);
});
