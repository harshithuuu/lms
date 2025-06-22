import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function showToast(msg, success = false) {
  if (window.M && M.toast) {
    M.toast({html: msg, classes: success ? 'green' : 'red'});
  } else {
    alert(msg);
  }
}

export async function register(email, password, role) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      role,
      createdAt: new Date()
    });
    showToast('Registration successful!', true);
  } catch (err) {
    showToast('Registration failed: ' + err.message);
    console.error('Register error:', err);
    throw err;
  }
}

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    showToast('Login successful!', true);
  } catch (err) {
    showToast('Login failed: ' + err.message);
    console.error('Login error:', err);
    throw err;
  }
}

export async function logout() {
  try {
    await signOut(auth);
    showToast('Logged out!', true);
    window.location.href = 'login.html';
  } catch (err) {
    showToast('Logout failed: ' + err.message);
    console.error('Logout error:', err);
  }
}

export async function getUserRole(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role : null;
  } catch (err) {
    showToast('Error fetching user role: ' + err.message);
    console.error('GetUserRole error:', err);
    return null;
  }
}

export async function loadProfile() {
  try {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = 'login.html';
        return;
      }
      document.getElementById('profileEmail').value = user.email;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      document.getElementById('profileRole').value = userDoc.exists() ? userDoc.data().role : '';
    });
  } catch (err) {
    showToast('Error loading profile: ' + err.message);
    console.error('LoadProfile error:', err);
  }
}

export async function resetPassword() {
  try {
    const email = document.getElementById('profileEmail').value;
    if (email) {
      await sendPasswordResetEmail(auth, email);
      showToast('Password reset email sent!', true);
    }
  } catch (err) {
    showToast('Password reset failed: ' + err.message);
    console.error('ResetPassword error:', err);
  }
} 