const firebase = require("firebase-admin");
const serviceAccount = require("../vaishakhi-matrimony-firebase-adminsdk-mjr6h-34a24c9c5e.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });

  module.exports = {firebase};