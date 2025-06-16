# Capstone Project Backend 

This is the backend service for my capstone project, powering the entire system used by SAO Admins including student registration, submissions, appointments, report management, and notifications. Built with Node.js, Express, and Firebase, it handles real-time database operations and authentication.

Although the chatbot backend is managed separately, this backend includes a file watcher system that detects PDF uploads from uniquely identified schools. When triggered, it notifies the chatbot backend to process the uploaded document and generate vector embeddings for semantic search and intelligent responses.

---

## Key Responsibilities

- ✅ Validate student registration against uploaded student lists
- 📥 Manage student submissions and SAO responses
- 📅 Handle appointment requests and confirmations
- 📝 Receive student reports and maintain records
- 🔔 Send real-time notifications to SAO Admins
- 📄 Upload and monitor chatbot knowledge files
- 📡 Notify external chatbot backend of new files for vector processing

---

## Tech Stack

- **Node.js** – Runtime environment  
- **Express.js** – Web framework for routing and middleware  
- **Firebase Admin SDK** – Used for Firestore database, authentication, and file storage  
- **Multer / File System** – For handling uploads and watching directories  
- **CORS, dotenv, body-parser** – Middleware utilities  

---

## ⚠️ Security Notice
🔐 Important:
This repository includes the original Firebase configuration file (firebaseConfig.json) as part of the project history.
However, the associated Firebase project and database have already been deleted, so the credentials can no longer be used to access any backend services.
In production or future development, always use environment variables and avoid committing sensitive keys to version control.

---

## Author
Ralph Pilapil  
Email: ralphc.pilapil@gmail.com
