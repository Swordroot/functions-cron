import * as adminModule from './classes/admin.js';
import * as request from 'request';
import * as rcloadenv from '@google-cloud/rcloadenv';
import {google} from 'googleapis';
import * as changesets from 'diff-json';
const admin = adminModule.admin;



exports.per_minute_job = event => {
  console.log('=-=-=-=-=-=-=-=-=-=-start deleting expired room-=-=-=-=-=-=-=-=-=-=');
  const query = admin.database().ref('rooms').orderByKey();
  // const usersQuery = admin.database().ref('users').orderByKey();
  query.once('value').then(snapshot => {
    //set expire time limit
    const expireTimeLimit = 60 * 60 * 24;
    //first find expiredRoom
    const deleteTargetRoomKey = [];
    snapshot.forEach(childSnapShot => {
      const data = childSnapShot.val();
      const nowTime = new Date().getTime();
      if((nowTime / 1000 - data.remainingTime) > expireTimeLimit){
        deleteTargetRoomKey.push(childSnapShot.key)
      }
      return false;
    });

    //if found expired room, delete relatedData
    if (deleteTargetRoomKey.length > 0){
      let promisesArray = [];
      const usersQuery2 = admin.database().ref('users').orderByKey();
      usersQuery2.once('value').then(usersSnapshot => {
        usersSnapshot.forEach(userSnapshot => {
          const userData = userSnapshot.val();
          if(userData.rooms){
            const filteredRoomsRemovePromises = Object.keys(userData.rooms).filter( elem => {
              return deleteTargetRoomKey.indexOf(elem) >= 0;
            }).map( elem => {
              console.log('users/' + userSnapshot.key + '/rooms/' + elem);
              return admin.database().ref('users/' + userSnapshot.key + '/rooms/' + elem).remove();
            });
            promisesArray = promisesArray.concat(filteredRoomsRemovePromises)
          }
          return false;
        });
        deleteTargetRoomKey.forEach(key => {
          console.log('rooms/' + key);
          console.log('messages/' + key);
          const roomsRef = admin.database().ref('rooms/' + key);
          const messagesRef = admin.database().ref('messages/' + key);
          
          promisesArray.push(roomsRef.remove());
          promisesArray.push(messagesRef.remove());
        });
        Promise.all(promisesArray).then(() => {
          console.log('=-=-=-=-=-=-=-=-=-=-finish deleting expired room-=-=-=-=-=-=-=-=-=-=');
        }).catch(error => {
          throw error;
        });
      });
    }else{
      console.log('=-=-=-=-=-=-=-=-=-=-not found expired room-=-=-=-=-=-=-=-=-=-=');
    }
  }).catch(error => {
    throw error;
  });
  
};

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    rcloadenv.getAndApply('pushAPI', {}).then(key => {
      console.log(key);
      const jwtClient = new google.auth.JWT(
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

exports.sendPushNoti = (req, res) => {
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
            resolve2({
              error,
              response,
              body
            });
          } else {
            reject2({
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
}

exports.sendPushNotiOnLocal = (snapshot, context) => {
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
              resolve2({
                error,
                response,
                body
              });
            } else {
              reject2({
                error,
                response,
                body
              });
            }
          });
        }).then(result => {
          console.log("successfully sent push noti:", result);
        }).catch(err => {
          console.log("failed to send push noti", err)
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

