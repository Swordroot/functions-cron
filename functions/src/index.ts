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

import * as functions from 'firebase-functions';
import * as deleteExpireRoom from './deleteExpireRoom';
import * as aggregate from './aggregate'

export const per_minute_job = functions.pubsub
.topic('per-minute')
.onPublish(deleteExpireRoom.per_minute_job);

export const sendPushNoti = functions.https.onRequest(deleteExpireRoom.sendPushNoti);


export const sendPushNotiTriggeredByDBUpdate = functions.database.ref('messages').onUpdate(deleteExpireRoom.sendPushNotiOnLocal);

export const aggegate_roomsCount = functions.pubsub.topic('aggregate-tick').onPublish(aggregate.aggregate_rooms_count_all);
export const aggegate_rooms_per_user = functions.pubsub.topic('aggregate-tick').onPublish(aggregate.aggregate_rooms_per_user);
export const aggegate_rooms_per_user_avg = functions.pubsub.topic('aggregate-tick').onPublish(aggregate.aggregate_rooms_per_user_avg);


