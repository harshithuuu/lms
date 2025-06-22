import { db } from './firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { logout as authLogout } from './auth.js';

export async function getDashboardStats() {
  const booksSnap = await getDocs(collection(db, "books"));
  const transactionsSnap = await getDocs(collection(db, "transactions"));
  let totalBooks = 0, issuedBooks = 0, availableBooks = 0, overdueBooks = 0;
  booksSnap.forEach(doc => { totalBooks += doc.data().quantity; });
  transactionsSnap.forEach(doc => {
    const t = doc.data();
    if (!t.returned) issuedBooks++;
    // Overdue: dueDate < today and not returned
    if (!t.returned && t.dueDate < new Date().toISOString().slice(0,10)) overdueBooks++;
  });
  availableBooks = totalBooks - issuedBooks;
  document.getElementById('totalBooks').textContent = totalBooks;
  document.getElementById('issuedBooks').textContent = issuedBooks;
  document.getElementById('availableBooks').textContent = availableBooks;
  document.getElementById('overdueBooks').textContent = overdueBooks;
}

export function logout() {
  authLogout();
}

export function highlightActiveNav() {
  document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('#nav-mobile a');
    // Get only the filename, ignoring any query/hash
    const current = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];
    navLinks.forEach(link => {
      // Also ignore query/hash in href
      const href = link.getAttribute('href').split('?')[0].split('#')[0];
      if (href === current) {
        link.parentElement.classList.add('active');
      }
    });
  });
} 
 