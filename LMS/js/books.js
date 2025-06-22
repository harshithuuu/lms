import { db, storage } from './firebase.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const bookForm = document.getElementById('bookForm');
const booksTable = document.getElementById('booksTable').getElementsByTagName('tbody')[0];
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resetBtn = document.getElementById('resetBtn');

async function renderBooks(books) {
  booksTable.innerHTML = '';
  books.forEach(book => {
    const row = booksTable.insertRow();
    row.innerHTML = `
      <td>${book.coverUrl ? `<img src="${book.coverUrl}" width="40" />` : ''}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td>${book.genre}</td>
      <td>${book.quantity}</td>
      <td class="admin-only">
        <button onclick="editBook('${book.id}')">Edit</button>
        <button onclick="deleteBook('${book.id}')">Delete</button>
      </td>
    `;
  });
}

export async function listBooks() {
  const querySnapshot = await getDocs(collection(db, "books"));
  const books = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderBooks(books);
}

window.editBook = async function(id) {
  const docRef = doc(db, "books", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const book = docSnap.data();
    document.getElementById('bookId').value = id;
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('isbn').value = book.isbn;
    document.getElementById('genre').value = book.genre;
    document.getElementById('quantity').value = book.quantity;
  }
}

window.deleteBook = async function(id) {
  if (confirm('Delete this book?')) {
    await deleteDoc(doc(db, "books", id));
    listBooks();
  }
}

bookForm.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('bookId').value;
  const book = {
    title: document.getElementById('title').value,
    author: document.getElementById('author').value,
    isbn: document.getElementById('isbn').value,
    genre: document.getElementById('genre').value,
    quantity: parseInt(document.getElementById('quantity').value)
  };
  const coverFile = document.getElementById('cover').files[0];
  let coverUrl = '';
  if (coverFile) {
    const storageRef = ref(storage, `book_covers/${coverFile.name}`);
    await uploadBytes(storageRef, coverFile);
    coverUrl = await getDownloadURL(storageRef);
    book.coverUrl = coverUrl;
  }
  if (id) {
    await updateDoc(doc(db, "books", id), book);
  } else {
    await addDoc(collection(db, "books"), book);
  }
  bookForm.reset();
  listBooks();
};

resetBtn.onclick = () => bookForm.reset();

searchBtn.onclick = async () => {
  const value = searchInput.value.trim();
  if (!value) return listBooks();
  const q = query(collection(db, "books"), where("title", "==", value));
  const querySnapshot = await getDocs(q);
  const books = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderBooks(books);
};

clearSearchBtn.onclick = () => {
  searchInput.value = '';
  listBooks();
};

listBooks(); 