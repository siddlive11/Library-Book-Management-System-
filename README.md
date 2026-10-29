# 📚 LibraryOS — Smart RFID Library Management System

**CSE – Data Science | Academic Project**  
Nandha Kishore S · Gokul Siddharth B · Samuel Joseph J · Syed Fakrudeen Ali Ahamed A

---

## HOW TO RUN THIS PROJECT (Step-by-Step)

### STEP 1 — Install Node.js
1. Go to **https://nodejs.org** in Google Chrome
2. Click the big green **"LTS"** download button
3. Run the installer — click Next on every screen
4. When finished, Node.js is installed

---

### STEP 2 — Download and extract the project
1. Download the ZIP file from GitHub
2. Right-click the ZIP → **Extract All** → choose a folder (e.g. Desktop)
3. Open the extracted folder — you should see these files:
   ```
   server.js
   package.json
   .gitignore
   README.md
   public/
     index.html
     css/style.css
     js/app.js
     js/scene.js
   ```

---

### STEP 3 — Open the Terminal inside the project folder
- **Windows:** Right-click inside the extracted folder (on empty space, not on a file) → click **"Open in Terminal"** or **"Open PowerShell window here"**
- **Mac:** Right-click the folder → Services → New Terminal at Folder

---

### STEP 4 — Install dependencies
In the terminal, type this and press Enter:
```
npm install
```
Wait for it to finish (you'll see a list of packages). This only needs to be done once.

---

### STEP 5 — Start the server
Type this and press Enter:
```
npm start
```
You should see:
```
  📚  LibraryOS is running!
  👉  Open this in your browser: http://localhost:3000
```

---

### STEP 6 — Open the website
1. Open **Google Chrome**
2. Go to: **http://localhost:3000**
3. The LibraryOS website will load!

---

### STEP 7 — Test each module

| Module | What to test |
|---|---|
| Dashboard | See live book/loan counts |
| Register Book | Fill the form, click Register Book |
| Search Books | Type "algorithms" or "RF-003" |
| Issue Book | Student: STU-001, Book RFID: RF-003 |
| Return Book | Book RFID: RF-002, Student: STU-001 |
| Fine Calculator | Set a due date in the past |
| Exit Security | RFID: RF-002 → CLEAR, RFID: RF-001 → ALERT |
| Students | Add a new student |

---

### STEP 8 — Stop the server
Press **Ctrl + C** in the terminal.

---

## FILES TO UPLOAD TO GITHUB

Upload ALL of these (do NOT upload the `node_modules` folder):

```
server.js          ← backend
package.json       ← dependency list
.gitignore         ← tells GitHub to ignore node_modules
README.md          ← this file
public/
  index.html       ← frontend page
  css/
    style.css      ← all styles
  js/
    app.js         ← all frontend logic + API calls
    scene.js       ← Three.js 3D animation
```

**GitHub Steps:**
1. Go to github.com → New Repository
2. Name it: `library-book-management-system`
3. Click **"uploading an existing file"**
4. Drag and drop all the files listed above (maintain the folder structure)
5. Click **Commit changes**

---

## API ENDPOINTS REFERENCE

| Method | Endpoint | What it does |
|---|---|---|
| GET | /api/stats | Dashboard counts |
| GET | /api/books | All books |
| GET | /api/books/search?q= | Search books |
| POST | /api/books | Register a new book |
| GET | /api/students | All students |
| POST | /api/students | Add a student |
| GET | /api/loans | All loans |
| GET | /api/loans/active | Active loans only |
| POST | /api/loans/issue | Issue a book |
| POST | /api/loans/return | Return a book |
| POST | /api/fine/calculate | Calculate fine |
| POST | /api/security/verify-exit | Exit verification |
| GET | /api/security/exit-log | Exit scan history |
| GET | /api/transactions | Full transaction log |

---

## DEMO DATA (pre-loaded)

**Sample Book RFIDs:** RF-001 to RF-010  
**Sample Student IDs:** STU-001 to STU-005  
**Sample RFID Cards:** CARD-001 to CARD-005  

**Try this demo flow:**
1. Issue Book: Student = `STU-002`, Book RFID = `RF-003`
2. Exit Security: RFID = `RF-003` → shows CLEAR (valid loan)
3. Exit Security: RFID = `RF-001` → shows ALERT (not issued)
4. Return Book: RFID = `RF-002`, Student = `STU-001`
5. Fine Calculator: Due = yesterday's date, Return = today

---

## TECHNOLOGY STACK

- **Frontend:** HTML5, CSS3, JavaScript, Three.js (3D animation)
- **Backend:** Node.js + Express (REST API)
- **Database:** In-memory (simulates MySQL for demo)
- **Hardware (concept):** RFID Reader, ESP32, LCD, Buzzer

---

*Built as an academic demonstration of the RFID Library Book Management System concept.*
