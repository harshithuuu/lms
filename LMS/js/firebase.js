 // js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8fnRcdgHzaLzG_xLxRu46-IkQO_s-XT8",
  authDomain: "cme-g-63ebf.firebaseapp.com",
  projectId: "cme-g-63ebf",
  storageBucket: "cme-g-63ebf.appspot.com",
  messagingSenderId: "909124913952",
  appId: "YOUR_WEB_APP_ID" // <-- Replace with your actual web appId from Firebase Console!
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);