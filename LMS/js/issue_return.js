import { db } from './firebase.js';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const issueForm = document.getElementById('issueForm');
const returnForm = document.getElementById('returnForm');
const issuesTable = document.getElementById('issuesTable').getElementsByTagName('tbody')[0];
const issueUser = document.getElementById('issueUser');
const issueBook = document.getElementById('issueBook');
const dueDate = document.getElementById('dueDate');
const returnTransaction = document.getElementById('returnTransaction');
const issueSuccess = document.getElementById('issueSuccess');
const returnSuccess = document.getElementById('returnSuccess');

async function populateUsersAndBooks() {
  // Populate users
  const usersSnap = await getDocs(collection(db, "users"));
  issueUser.innerHTML = '';
  usersSnap.forEach(doc => {
    const user = doc.data();
    issueUser.innerHTML += `<option value="${doc.id}">${user.email}</option>`;
  });
  // Populate books
  const booksSnap = await getDocs(collection(db, "books"));
  issueBook.innerHTML = '';
  booksSnap.forEach(doc => {
    const book = doc.data();
    issueBook.innerHTML += `<option value="${doc.id}">${book.title}</option>`;
  });
}

async function renderIssues() {
  const querySnapshot = await getDocs(collection(db, "transactions"));
  issuesTable.innerHTML = '';
  returnTransaction.innerHTML = '<option value="" disabled selected>Choose issued book</option>';
  querySnapshot.forEach(doc => {
    const t = doc.data();
    const row = issuesTable.insertRow();
    row.innerHTML = `
      <td>${t.userEmail}</td>
      <td>${t.bookTitle}</td>
      <td>${t.issuedOn}</td>
      <td>${t.dueDate}</td>
      <td>${t.returned ? 'Returned' : 'Issued'}</td>
    `;
    if (!t.returned) {
      returnTransaction.innerHTML += `<option value="${doc.id}">${t.userEmail} - ${t.bookTitle}</option>`;
    }
  });
  // Re-initialize Materialize select
  M.FormSelect.init(document.querySelectorAll('select'));
}

async function calculateAndCreateFine(transaction) {
  const today = new Date();
  const dueDate = new Date(transaction.dueDate);
  if (today > dueDate) {
    const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    const fineAmount = daysOverdue * 10; // ₹10 per day
    await addDoc(collection(db, "fines"), {
      userId: transaction.userId,
      userEmail: transaction.userEmail,
      bookId: transaction.bookId,
      bookTitle: transaction.bookTitle,
      amount: fineAmount,
      date: new Date().toISOString().slice(0,10),
      paid: false
    });
  }
}

issueForm.onsubmit = async (e) => {
  e.preventDefault();
  issueSuccess.style.display = 'none';
  const userId = issueUser.value;
  const bookId = issueBook.value;
  const due = dueDate.value;
  // Get user and book details
  const userDoc = await getDoc(doc(db, "users", userId));
  const bookDoc = await getDoc(doc(db, "books", bookId));
  if (!userDoc.exists() || !bookDoc.exists()) return;
  const user = userDoc.data();
  const book = bookDoc.data();
  // Add transaction
  await addDoc(collection(db, "transactions"), {
    userId,
    userEmail: user.email,
    bookId,
    bookTitle: book.title,
    issuedOn: new Date().toISOString().slice(0,10),
    dueDate: due,
    returned: false
  });
  issueForm.reset();
  issueSuccess.style.display = 'block';
  renderIssues();
};

returnForm.onsubmit = async (e) => {
  e.preventDefault();
  returnSuccess.style.display = 'none';
  const transactionId = returnTransaction.value;
  if (!transactionId) return;
  
  await updateDoc(doc(db, "transactions", transactionId), { returned: true });
  returnForm.reset();
  returnSuccess.style.display = 'block';
  renderIssues();
};

populateUsersAndBooks();
renderIssues(); 