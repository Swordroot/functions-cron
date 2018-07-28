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
