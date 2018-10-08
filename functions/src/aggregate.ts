import * as adminModule from './classes/admin.js';
import {myMoment} from './classes/myMoment';
const admin = adminModule.admin;
const db_fs = admin.firestore();
const db = admin.database();

const getRoomsDataPerUser = async () => {
  try {
    const data = (await db.ref('rooms').once('value')).val();
    const aggregateObject = {};
    for (const key in data){
      const room = data[key];
      aggregateObject[room.listenID] = (aggregateObject[room.listenID] || 0) + 1;
      aggregateObject[room.speakID] = (aggregateObject[room.speakID] || 0) + 1;
    }
    return aggregateObject;
  } catch (error) {
    throw error;
  }
}

const getDocId = (): string => {
  return myMoment().subtract(1, 'days').format('YYYY-MM-DD');
}

/** 
 *  ref: roomsPerUser/Date
 * 
 */
export const aggregate_rooms_per_user = async event => {
  try {
    const aggregateData = await getRoomsDataPerUser();
    const docID = getDocId();
    await db_fs.collection('rooms_per_user').doc(docID).set(aggregateData);
  } catch (error) {
    throw error;
  }
}

export const aggregate_rooms_per_user_avg = async event => {
  try {
    const aggregateData = await getRoomsDataPerUser();
    const usersCount = Object.keys(aggregateData).length;
    let totalRoomsCount = 0;
    for (const key in aggregateData){
      totalRoomsCount += aggregateData[key];
    }
    const avg = totalRoomsCount / usersCount;
    const docID = getDocId();
    await db_fs.collection('rooms_per_user_avg').doc(docID).set({avg});
  } catch (error) {
    throw error;
  }
}

export const aggregate_rooms_count_all = async event => {
  try {
    const data = (await db.ref('rooms').once('value')).val();
    const count = Object.keys(data).length;
    const docID = getDocId();
    await db_fs.collection('roomsCount').doc(docID).set({count});
  } catch (error) {
    throw error;
  }
  
}