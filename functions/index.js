// Copyright 2017 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var functions = require('firebase-functions');
var admin = require('firebase-admin');
var request = require('request');
var rcloadenv = require('@google-cloud/rcloadenv');
var {google} = require('googleapis');
var changesets = require('diff-json');
admin.initializeApp(functions.config().firebase);



exports.per_minute_job = functions.pubsub
.topic('per-minute')
.onPublish(event => {
  console.log('=-=-=-=-=-=-=-=-=-=-start deleting expired room-=-=-=-=-=-=-=-=-=-=');
  const query = admin.database().ref('rooms').orderByKey();
  const usersQuery = admin.database().ref('users').orderByKey();
  query.once('value').then(snapshot => {
    //set expire time limit
    const expireTimeLimit = 60 * 60 * 24;
    //first find expiredRoom
    let deleteTargetRoomKey = [];
    snapshot.forEach(childSnapShot => {
      const data = childSnapShot.val();
      const nowTime = new Date().getTime();
      if((nowTime / 1000 - data.remainingTime) > expireTimeLimit){
        deleteTargetRoomKey.push(childSnapShot.key)
      }
    });

    //if found expired room, delete relatedData
    if (deleteTargetRoomKey.length > 0){
      let promisesArray = [];
      const usersQuery = admin.database().ref('users').orderByKey();
      usersQuery.once('value').then(usersSnapshot => {
        usersSnapshot.forEach(userSnapshot => {
          const userData = userSnapshot.val();
          if(userData.rooms){
            const filteredRoomsRemovePromises = Object.keys(userData.rooms).filter( elem => {
              return deleteTargetRoomKey.includes(elem);
            }).map( elem => {
              console.log('users/' + userSnapshot.key + '/rooms/' + elem);
              return admin.database().ref('users/' + userSnapshot.key + '/rooms/' + elem).remove();
            });
            promisesArray = promisesArray.concat(filteredRoomsRemovePromises)
          }
        });
        deleteTargetRoomKey.forEach(key => {
          console.log('rooms/' + key);
          console.log('messages/' + key);
          const roomsRef = admin.database().ref('rooms/' + key);
          const messagesRef = admin.database().ref('messages/' + key);
          
          promisesArray.push(roomsRef.remove());
          promisesArray.push(messagesRef.remove());
        });
        Promise.all(promisesArray, () => {
          console.log('=-=-=-=-=-=-=-=-=-=-finish deleting expired room-=-=-=-=-=-=-=-=-=-=');
        });
      });
    }else{
      console.log('=-=-=-=-=-=-=-=-=-=-not found expired room-=-=-=-=-=-=-=-=-=-=');
    }
  });
  
});

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    rcloadenv.getAndApply('pushAPI', {}).then(key => {
      console.log(key);
      var jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        ['https://www.googleapis.com/auth/firebase.messaging'],
        null
      );
      jwtClient.authorize(function(err, tokens) {
        if (err) {
          reject(err);
          return;
        }
        resolve(tokens.access_token);
      });
    });
    
  });
}

exports.sendPushNoti = functions.https.onRequest((req, res) => {
  if (req.method === 'POST'){
    console.log(req.body);
    getAccessToken().then((authToken) => {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      };
      const options = {
        url: 'https://fcm.googleapis.com/v1/projects/confession-room-frx/messages:send',
        method: 'POST',
        headers: headers,
        json: {
          "message": {
            "token": req.body.message.token,
            "notification": {
              "body": req.body.message.notification.body,
              "title": req.body.message.notification.title
            }
          }
        }
      };
      new Promise((resolve2, reject2) => {
        request(options, function (error, response, body) {
          if (response.statusCode === 200) {
            return resolve2({
              error,
              response,
              body
            });
          } else {
            return reject2({
              error,
              response,
              body
            });
          }
        });
      }).then(result => {
        res.status(200).send(result).end();
      }).catch(err => {
        res.status(500).send(err).end();
      });
    }).catch(err => {
      console.log("failed getAccessToken");
      console.log(err);
      res.status(500).send(err).end();
    });
  } else {
    res.status(404).end();
  }
});

const sendPushNotiOnLocal = (snapshot, context) => {
  //console.log('before', snapshot.before.val());
  //console.log('after', snapshot.after.val());
  const diff = changesets.diff(snapshot.before.val(), snapshot.after.val());
  console.log('diff', diff);
  console.log('diff[0]', diff[0]);
  console.log('change', diff[0].changes);
  const roomId = diff[0].key;
  const senderId = diff[0].changes[0].value.senderId;
  const text = diff[0].changes[0].value.text;
  const query = admin.database().ref('rooms/' + roomId);
  query.once('value').then( snapshot2 => {
    const roominfo = snapshot2.val();
    console.log('updatedRoom:', roominfo);
    const roomName = roominfo.roomName;
    const targetID = (roominfo.listenID === senderId) ? roominfo.speakID : roominfo.listenID;
    admin.database().ref('users/' + targetID).once('value').then(snapshot3 => {
      const userInfo = snapshot3.val();
      const targetToken = userInfo.fcmtoken;
      const notiBody = {
        "message": {
          "token": targetToken,
          "notification": {
            "body": "メッセージが届きました",
            "title": roomName
          }
        }
      }
      console.log("notibody", notiBody);
      getAccessToken().then((authToken) => {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        };
        const options = {
          url: 'https://fcm.googleapis.com/v1/projects/confession-room-frx/messages:send',
          method: 'POST',
          headers: headers,
          json: notiBody
        };
        new Promise((resolve2, reject2) => {
          request(options, function (error, response, body) {
            if (response.statusCode === 200) {
              return resolve2({
                error,
                response,
                body
              });
            } else {
              return reject2({
                error,
                response,
                body
              });
            }
          });
        }).then(result => {
          console.log("successfully sent push noti:", result);
        }).catch(err => {
          console.log("failed to send push noti", result)
        });
      }).catch(err => {
        console.log("failed getAccessToken");
        console.log(err);
      });
    }).catch(err2 => {
      console.log('error on users/:targetID once', err2);
    })
  }).catch( err => {
    console.log('error on rooms/:roomId once', err);
  });
  
}

exports.sendPushNotiTriggeredByDBUpdate = functions.database.ref('messages').onUpdate(sendPushNotiOnLocal);


