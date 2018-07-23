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
    Promise.all([query,usersQuery])
    usersQuery.once('value').then(usersSnapshot => {
      usersSnapshot.forEach(userSnapshot => {
        userSnapshot.val()
      });
    });
    query.once('value').then(snapshot => {
      let deleteTargetRoomKey = [];
      snapshot.forEach(childSnapShot => {
        const data = childSnapShot.val();
        const nowTime = new Date().getTime();
        if((nowTime / 1000 - data.remainingTime) > 60*60*24){
          deleteTargetRoomKey.push(childSnapShot.key)
        }
      });
      console.log(deleteTargetRoomKey);

      if (deleteTargetRoomKey.length > 0){
        let refsArray = [];
        const usersQuery = admin.database().ref('users').orderByKey();
        usersQuery.once('value').then(usersSnapshot => {
          usersSnapshot.forEach(userSnapshot => {
            userSnapshot.val()
          });
        });
        // deleteTargetRoomKey.forEach(key => {
        //   const roomsRef = admin.database().ref('rooms/' + key);
        //   const messagesRef = admin.database().ref('messages/' + key);
          
        //   roomsRef.remove();
        //   messagesRef.remove();

          
        // });
      }
    });
    console.log('=-=-=-=-=-=-=-=-=-=-finish deleting expired room-=-=-=-=-=-=-=-=-=-=');
  });
