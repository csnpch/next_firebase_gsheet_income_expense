// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8JO4_2MRTRfpg3GOIwu43BVoMqRSg-dE",
  authDomain: "incopens-4489.firebaseapp.com",
  projectId: "incopens-4489",
  storageBucket: "incopens-4489.appspot.com",
  messagingSenderId: "967899335208",
  appId: "1:967899335208:web:a82c85081c34f9dbe1c31d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;