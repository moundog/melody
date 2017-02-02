// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

//process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let express = require('express');
let bodyParser = require('body-parser');
let request = require('request');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const SHOW_ARGUMENT = 'show';

app.post('/', function (req, res) {

  const assistant = new Assistant({request: req, response: res});
  //console.log('Request headers: ' + JSON.stringify(req.headers));
  //console.log('Request body: ' + JSON.stringify(req.body));

  // Fulfill action business logic
  function responseHandler (assistant) {
    const show = assistant.getArgument(SHOW_ARGUMENT);
    console.log('Argument: ' + show);
    request('http://il.srgssr.ch/integrationlayer/2.0/rts/searchResultList/audio.json?q=' + encodeURIComponent(show), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let data = JSON.parse(body);
        let id = data.searchResultListMedia[0].id;
        request('http://eceapi.rts.ch/v2/api/assets/' + id, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            let url = data.streams[0].url;
            console.log('URL: ' + url);
            // Complete your fulfillment logic and send a response
            let text_to_speech = '<speak><audio src="' + url + '">An error occured while reading the audio file</audio></speak>';
            assistant.tell(text_to_speech);
          } else {
            assistant.tell('An error occured while retrieving the audio file');
          }
        });
      } else {
        assistant.tell('An error occured while retrieving the show\'s id');
      }
    });
  }

  assistant.handleRequest(responseHandler);

});

if (module === require.main) {
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;
