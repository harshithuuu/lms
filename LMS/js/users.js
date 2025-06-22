import { db } from './firebase.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const userForm = document.getElementById('userForm');
const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
const resetUserBtn = document.getElementById('resetUserBtn');

async function renderUsers(users) {
  usersTable.innerHTML = '';
  users.forEach(user => {
    const row = usersTable.insertRow();
    row.innerHTML = `
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button onclick="editUser('${user.id}')">Edit</button>
        <button onclick="deleteUser('${user.id}')">Delete</button>
      </td>
    `;
  });
}

export async function listUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderUsers(users);
}

window.editUser = async function(id) {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const user = docSnap.data();
    document.getElementById('userId').value = id;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
  }
}

window.deleteUser = async function(id) {
  if (confirm('Delete this user?')) {
    await deleteDoc(doc(db, "users", id));
    listUsers();
  }
}

userForm.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('userId').value;
  const user = {
    email: document.getElementById('userEmail').value,
    role: document.getElementById('userRole').value
  };
  if (id) {
    await updateDoc(doc(db, "users", id), user);
  } else {
    // For demo: add user to Firestore only (not Auth)
    await addDoc(collection(db, "users"), user);
  }
  userForm.reset();
  listUsers();
};

resetUserBtn.onclick = () => userForm.reset();

listUsers(); 
 