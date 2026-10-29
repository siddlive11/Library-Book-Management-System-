// ============================================================
//  LibraryOS — Smart RFID Library Management System
//  Node.js + Express Backend  |  server.js
// ============================================================

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
//  IN-MEMORY DATABASE
//  (Simulates MySQL — all data lives here while server runs)
// ============================================================

let db = {
  books: [
    { id: 1, rfid: 'RF-001', title: 'Introduction to Algorithms',      author: 'Cormen',         isbn: '978-0-262-03384-8', shelf: 'A-1-01', category: 'Computer Science',  status: 'available' },
    { id: 2, rfid: 'RF-002', title: 'Data Structures & Algorithms',    author: 'Mark Allen Weiss',isbn: '978-0-13-284737-7', shelf: 'A-1-02', category: 'Computer Science',  status: 'issued'    },
    { id: 3, rfid: 'RF-003', title: 'Database System Concepts',        author: 'Silberschatz',    isbn: '978-0-07-352332-3', shelf: 'B-2-05', category: 'Computer Science',  status: 'available' },
    { id: 4, rfid: 'RF-004', title: 'Operating System Concepts',       author: 'Silberschatz',    isbn: '978-0-470-12872-5', shelf: 'B-2-06', category: 'Computer Science',  status: 'available' },
    { id: 5, rfid: 'RF-005', title: 'Computer Networks',               author: 'Tanenbaum',       isbn: '978-0-13-212695-3', shelf: 'C-3-10', category: 'Computer Science',  status: 'overdue'   },
    { id: 6, rfid: 'RF-006', title: 'Machine Learning',                author: 'Tom Mitchell',    isbn: '978-0-07-042807-2', shelf: 'D-4-03', category: 'Computer Science',  status: 'available' },
    { id: 7, rfid: 'RF-007', title: 'Calculus: Early Transcendentals', author: 'James Stewart',   isbn: '978-0-538-49790-9', shelf: 'E-1-08', category: 'Mathematics',       status: 'available' },
    { id: 8, rfid: 'RF-008', title: 'Linear Algebra Done Right',       author: 'Sheldon Axler',   isbn: '978-0-387-98258-6', shelf: 'E-2-02', category: 'Mathematics',       status: 'available' },
    { id: 9, rfid: 'RF-009', title: 'Signals and Systems',             author: 'Oppenheim',       isbn: '978-0-13-814757-0', shelf: 'F-3-11', category: 'Engineering',       status: 'available' },
    { id:10, rfid: 'RF-010', title: 'Python for Data Analysis',        author: 'Wes McKinney',    isbn: '978-1-491-91205-8', shelf: 'A-2-07', category: 'Computer Science',  status: 'issued'    },
  ],

  students: [
    { id: 'STU-001', name: 'Arun Prakash',   rfid: 'CARD-001', department: 'CSE – Data Science',      activeLoans: 1 },
    { id: 'STU-002', name: 'Priya Raman',    rfid: 'CARD-002', department: 'CSE – Data Science',      activeLoans: 0 },
    { id: 'STU-003', name: 'Karthik Selvan', rfid: 'CARD-003', department: 'Information Technology',  activeLoans: 1 },
    { id: 'STU-004', name: 'Divya Menon',    rfid: 'CARD-004', department: 'Computer Science',        activeLoans: 0 },
    { id: 'STU-005', name: 'Rahul Nair',     rfid: 'CARD-005', department: 'Electronics',             activeLoans: 1 },
  ],

  loans: [
    { id: 'LN-001', studentId: 'STU-001', studentName: 'Arun Prakash',   bookRfid: 'RF-002', title: 'Data Structures & Algorithms', issueDate: '2025-09-10', dueDate: '2025-09-24', status: 'active'   },
    { id: 'LN-002', studentId: 'STU-003', studentName: 'Karthik Selvan', bookRfid: 'RF-005', title: 'Computer Networks',            issueDate: '2025-09-01', dueDate: '2025-09-15', status: 'overdue'  },
    { id: 'LN-003', studentId: 'STU-005', studentName: 'Rahul Nair',     bookRfid: 'RF-010', title: 'Python for Data Analysis',     issueDate: '2025-09-18', dueDate: '2025-10-02', status: 'active'   },
  ],

  transactions: [
    { id: 'TX-001', type: 'ISSUE',  studentId: 'STU-001', book: 'Data Structures & Algorithms', date: '2025-09-10', status: 'active'  },
    { id: 'TX-002', type: 'ISSUE',  studentId: 'STU-003', book: 'Computer Networks',             date: '2025-09-01', status: 'overdue' },
    { id: 'TX-003', type: 'ISSUE',  studentId: 'STU-005', book: 'Python for Data Analysis',      date: '2025-09-18', status: 'active'  },
    { id: 'TX-004', type: 'RETURN', studentId: 'STU-002', book: 'Operating System Concepts',     date: '2025-09-05', status: 'closed'  },
    { id: 'TX-005', type: 'RETURN', studentId: 'STU-004', book: 'Signals and Systems',           date: '2025-09-12', status: 'closed'  },
  ],

  exitLog: [],
  finesTotal: 310,
  loanCounter: 4,
  txCounter: 6,
  bookCounter: 11,
  studentCounter: 6
};

// ─── helpers ────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}
function daysBetween(dateA, dateB) {
  return Math.round((new Date(dateB) - new Date(dateA)) / 86400000);
}
function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// ============================================================
//  STATS  —  GET /api/stats
// ============================================================
app.get('/api/stats', (req, res) => {
  res.json({
    totalBooks:     db.books.length,
    totalStudents:  db.students.length,
    activeLoans:    db.loans.filter(l => l.status === 'active').length,
    overdueLoans:   db.loans.filter(l => l.status === 'overdue').length,
    exitChecks:     db.exitLog.length,
    finesTotal:     db.finesTotal
  });
});

// ============================================================
//  BOOKS
// ============================================================

// GET all books
app.get('/api/books', (req, res) => {
  res.json(db.books);
});

// GET search books  ?q=query
app.get('/api/books/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json(db.books);
  const results = db.books.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.rfid.toLowerCase().includes(q) ||
    b.isbn.toLowerCase().includes(q) ||
    b.category.toLowerCase().includes(q)
  );
  res.json(results);
});

// POST register new book
app.post('/api/books', (req, res) => {
  const { rfid, title, author, isbn, shelf, category } = req.body;
  if (!rfid || !title || !author || !shelf) {
    return res.status(400).json({ error: 'rfid, title, author, and shelf are required.' });
  }
  if (db.books.find(b => b.rfid === rfid)) {
    return res.status(409).json({ error: 'RFID tag already registered.' });
  }
  const newBook = {
    id: db.bookCounter++,
    rfid, title, author,
    isbn: isbn || '',
    shelf,
    category: category || 'General',
    status: 'available'
  };
  db.books.push(newBook);
  res.status(201).json({ message: `Book "${title}" registered successfully.`, book: newBook });
});

// DELETE book
app.delete('/api/books/:rfid', (req, res) => {
  const idx = db.books.findIndex(b => b.rfid === req.params.rfid);
  if (idx === -1) return res.status(404).json({ error: 'Book not found.' });
  const [removed] = db.books.splice(idx, 1);
  res.json({ message: `"${removed.title}" removed.` });
});

// ============================================================
//  STUDENTS
// ============================================================

app.get('/api/students', (req, res) => {
  res.json(db.students);
});

app.post('/api/students', (req, res) => {
  const { id, name, rfid, department } = req.body;
  if (!id || !name || !rfid) {
    return res.status(400).json({ error: 'id, name, and rfid are required.' });
  }
  if (db.students.find(s => s.id === id)) {
    return res.status(409).json({ error: 'Student ID already exists.' });
  }
  if (db.students.find(s => s.rfid === rfid)) {
    return res.status(409).json({ error: 'RFID card already assigned.' });
  }
  const student = { id, name, rfid, department: department || 'General', activeLoans: 0 };
  db.students.push(student);
  res.status(201).json({ message: `Student "${name}" registered.`, student });
});

app.delete('/api/students/:id', (req, res) => {
  const idx = db.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found.' });
  db.students.splice(idx, 1);
  res.json({ message: 'Student removed.' });
});

// ============================================================
//  LOANS — ISSUE
// ============================================================
app.post('/api/loans/issue', (req, res) => {
  const { studentId, bookRfid, issueDate, dueDate } = req.body;
  if (!studentId || !bookRfid) {
    return res.status(400).json({ error: 'studentId and bookRfid are required.' });
  }

  const student = db.students.find(s => s.id === studentId || s.rfid === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found. Please register first.' });

  const book = db.books.find(b => b.rfid === bookRfid);
  if (!book) return res.status(404).json({ error: 'Book RFID not found in the system.' });

  if (book.status !== 'available') {
    return res.status(409).json({ error: `Book is currently "${book.status}" and cannot be issued.` });
  }

  const already = db.loans.find(l => l.bookRfid === bookRfid && l.status === 'active');
  if (already) return res.status(409).json({ error: 'This book already has an active loan.' });

  const iDate = issueDate || today();
  const dDate = dueDate   || addDays(iDate, 14);
  const loanId = 'LN-' + String(db.loanCounter++).padStart(3, '0');
  const txId   = 'TX-' + String(db.txCounter++).padStart(3, '0');

  const loan = {
    id: loanId, studentId: student.id, studentName: student.name,
    bookRfid, title: book.title, issueDate: iDate, dueDate: dDate, status: 'active'
  };
  db.loans.push(loan);
  db.transactions.push({ id: txId, type: 'ISSUE', studentId: student.id, book: book.title, date: iDate, status: 'active' });
  book.status = 'issued';
  student.activeLoans++;

  res.status(201).json({
    message: `"${book.title}" issued to ${student.name}. Due: ${dDate}.`,
    loan
  });
});

// ============================================================
//  LOANS — RETURN
// ============================================================
app.post('/api/loans/return', (req, res) => {
  const { studentId, bookRfid, returnDate } = req.body;
  if (!studentId || !bookRfid) {
    return res.status(400).json({ error: 'studentId and bookRfid are required.' });
  }

  const loan = db.loans.find(l =>
    l.bookRfid === bookRfid &&
    (l.studentId === studentId || l.studentName.toLowerCase() === studentId.toLowerCase()) &&
    (l.status === 'active' || l.status === 'overdue')
  );
  if (!loan) return res.status(404).json({ error: 'No active loan found for this student and book.' });

  const rDate = returnDate || today();
  const overdueDays = Math.max(0, daysBetween(loan.dueDate, rDate));
  const fine = overdueDays * 5;

  loan.status      = 'returned';
  loan.returnDate  = rDate;
  loan.fine        = fine;

  const book    = db.books.find(b => b.rfid === bookRfid);
  const student = db.students.find(s => s.id === loan.studentId);
  if (book)    book.status = 'available';
  if (student && student.activeLoans > 0) student.activeLoans--;
  if (fine > 0) db.finesTotal += fine;

  const txId = 'TX-' + String(db.txCounter++).padStart(3, '0');
  db.transactions.push({ id: txId, type: 'RETURN', studentId: loan.studentId, book: loan.title, date: rDate, status: 'closed' });

  res.json({
    message: `"${loan.title}" returned by ${loan.studentName}.`,
    overdueDays,
    fine,
    returnDate: rDate
  });
});

// ============================================================
//  LOANS — GET ALL  /  GET active
// ============================================================
app.get('/api/loans', (req, res) => {
  res.json(db.loans);
});

app.get('/api/loans/active', (req, res) => {
  res.json(db.loans.filter(l => l.status === 'active' || l.status === 'overdue'));
});

// ============================================================
//  FINE CALCULATOR
// ============================================================
app.post('/api/fine/calculate', (req, res) => {
  const { dueDate, returnDate } = req.body;
  if (!dueDate || !returnDate) {
    return res.status(400).json({ error: 'dueDate and returnDate are required.' });
  }
  const overdueDays = Math.max(0, daysBetween(dueDate, returnDate));
  const fine = overdueDays * 5;
  res.json({ dueDate, returnDate, overdueDays, fine, ratePerDay: 5 });
});

// ============================================================
//  EXIT SECURITY VERIFICATION
// ============================================================
app.post('/api/security/verify-exit', (req, res) => {
  const { bookRfid, studentId } = req.body;
  if (!bookRfid) return res.status(400).json({ error: 'bookRfid is required.' });

  const book      = db.books.find(b => b.rfid === bookRfid);
  const activeLoan = db.loans.find(l => l.bookRfid === bookRfid && (l.status === 'active' || l.status === 'overdue'));

  const timestamp = new Date().toLocaleTimeString();
  let result;

  if (!book) {
    result = { status: 'ALERT', message: 'Unknown RFID — book not registered in system.', buzz: true };
  } else if (activeLoan) {
    result = {
      status:  'CLEAR',
      message: `Valid loan. "${book.title}" issued to ${activeLoan.studentName}. Due: ${activeLoan.dueDate}.`,
      buzz:    false,
      loan:    activeLoan
    };
  } else {
    result = {
      status:  'ALERT',
      message: `UNAUTHORIZED REMOVAL — "${book.title}" has no active issue record!`,
      buzz:    true
    };
  }

  db.exitLog.push({ timestamp, bookRfid, studentId: studentId || '—', result: result.status });
  res.json(result);
});

app.get('/api/security/exit-log', (req, res) => {
  res.json([...db.exitLog].reverse());
});

// ============================================================
//  TRANSACTIONS
// ============================================================
app.get('/api/transactions', (req, res) => {
  res.json([...db.transactions].reverse());
});

// ============================================================
//  SERVE FRONTEND
// ============================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================================
//  START
// ============================================================
app.listen(PORT, () => {
  console.log('');
  console.log('  📚  LibraryOS is running!');
  console.log(`  👉  Open this in your browser: http://localhost:${PORT}`);
  console.log('');
  console.log('  Press Ctrl + C to stop the server.');
  console.log('');
});
