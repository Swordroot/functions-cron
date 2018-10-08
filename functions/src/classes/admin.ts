import * as functions from 'firebase-functions';
import * as admin_ from 'firebase-admin';
admin_.initializeApp(functions.config().firebase);

export const admin = admin_;