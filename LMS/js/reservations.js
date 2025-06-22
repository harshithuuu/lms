import { db } from './firebase.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const reserveForm = document.getElementById('reserveForm');
const reserveBook = document.getElementById('reserveBook');
const reservationsTable = document.getElementById('reservationsTable').getElementsByTagName('tbody')[0];

async function populateBooks() {
  const booksSnap = await getDocs(collection(db, "books"));
  reserveBook.innerHTML = '';
  booksSnap.forEach(doc => {
    const book = doc.data();
    reserveBook.innerHTML += `<option value="${doc.id}">${book.title}</option>`;
  });
}

async function renderReservations() {
  const querySnapshot = await getDocs(collection(db, "reservations"));
  reservationsTable.innerHTML = '';
  querySnapshot.forEach(doc => {
    const r = doc.data();
    const row = reservationsTable.insertRow();
    row.innerHTML = `
      <td>${r.bookTitle}</td>
      <td>${r.dateReserved}</td>
      <td>${r.status}</td>
      <td><button onclick="cancelReservation('${doc.id}')">Cancel</button></td>
    `;
  });
}

reserveForm.onsubmit = async (e) => {
  e.preventDefault();
  const bookId = reserveBook.value;
  const bookDoc = await getDoc(doc(db, "books", bookId));
  if (!bookDoc.exists()) return;
  const book = bookDoc.data();
  await addDoc(collection(db, "reservations"), {
    bookId,
    bookTitle: book.title,
    dateReserved: new Date().toISOString().slice(0,10),
    status: 'Reserved'
  });
  reserveForm.reset();
  renderReservations();
};

window.cancelReservation = async function(id) {
  await deleteDoc(doc(db, "reservations", id));
  renderReservations();
}

populateBooks();
renderReservations(); 