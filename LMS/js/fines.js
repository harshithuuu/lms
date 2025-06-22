import { db } from './firebase.js';
import { collection, getDocs, updateDoc, doc, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const finesTable = document.getElementById('finesTable').getElementsByTagName('tbody')[0];

async function renderFines(fines) {
  finesTable.innerHTML = '';
  fines.forEach(fine => {
    const row = finesTable.insertRow();
    row.innerHTML = `
      <td>${fine.userEmail}</td>
      <td>${fine.bookTitle}</td>
      <td>₹${fine.amount}</td>
      <td>${fine.date}</td>
      <td>${fine.paid ? 'Paid' : 'Unpaid'}</td>
      <td>${!fine.paid ? `<button onclick="payFine('${fine.id}')">Pay</button>` : ''}</td>
    `;
  });
}

async function calculateAndUpdateOverdueFines() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  // Get all un-returned transactions
  const q = query(collection(db, "transactions"), where("returned", "==", false));
  const transactionsSnap = await getDocs(q);
  
  for (const docSnap of transactionsSnap.docs) {
    const transaction = { id: docSnap.id, ...docSnap.data() };
    const dueDate = new Date(transaction.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Normalize to start of day
    
    if (today > dueDate) {
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * 10; // ₹10 per day

      // Check if a fine already exists for this transaction
      const fineQuery = query(collection(db, "fines"), where("transactionId", "==", transaction.id));
      const fineSnap = await getDocs(fineQuery);
      
      if (!fineSnap.empty) {
        // Update existing fine
        const fineDoc = fineSnap.docs[0];
        await updateDoc(doc(db, "fines", fineDoc.id), { amount: fineAmount });
      } else {
        // Create new fine
        await addDoc(collection(db, "fines"), {
          transactionId: transaction.id,
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
  }
}

export async function listFines() {
  await calculateAndUpdateOverdueFines();
  const querySnapshot = await getDocs(collection(db, "fines"));
  const fines = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderFines(fines);
}

window.payFine = async function(id) {
  await updateDoc(doc(db, "fines", id), { paid: true });
  listFines();
}

listFines(); 