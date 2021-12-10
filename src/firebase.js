
import firebase from 'firebase';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCgwnjSyH9dysvH0aZdhHkLtILBJ_X6W9c",
    authDomain: "exam-app-2ce87.firebaseapp.com",
    projectId: "exam-app-2ce87",
    storageBucket: "exam-app-2ce87.appspot.com",
    messagingSenderId: "955030323895",
    appId: "1:955030323895:web:2046c796d234fd6e7dc332",
    measurementId: "${config.measurementId}",
    databaseURL : ""
}

firebase.initializeApp(firebaseConfig);

export default firebase;