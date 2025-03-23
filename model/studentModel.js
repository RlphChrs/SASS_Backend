const { db } = require('../config/firebaseConfig');  
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin'); 

const createStudent = async (studentId, email, password, firstName, lastName, schoolName) => {
    const trimmedStudentId = studentId.trim().toLowerCase();
    console.log(`📝 Saving student with ID: "${trimmedStudentId}"`);

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    await db.collection('students').doc(trimmedStudentId).set({
        studentId: trimmedStudentId,
        email,
        password: hashedPassword,
        role: 'Student',
        firstName,
        lastName,
        schoolName, 
        createdAt: new Date(),
        chatHistory: []
    });

    console.log(`✅ Student saved successfully in Firestore: "${trimmedStudentId}"`);

    const savedUser = await db.collection("students").doc(trimmedStudentId).get();
    console.log(`🔍 Firestore confirms storage:`, savedUser.data());
};


const getStudentByEmail = async (email) => {
    const studentSnapshot = await db.collection('students').where('email', '==', email).get();
    return studentSnapshot.empty ? null : studentSnapshot.docs[0].data();
};

const getStudentById = async (studentId) => {
  studentId = studentId.trim().toLowerCase();
  console.log(`🔍 Searching Firestore for Student ID: "${studentId}"`);

  try {
      console.log(`🔍 Attempting Firestore query where 'studentId' == "${studentId}"`);
      const querySnapshot = await db.collection("students").where("studentId", "==", studentId).get();

      if (!querySnapshot.empty) {
          const foundStudent = querySnapshot.docs[0].data();
          console.log(`✅ Found Student via Firestore query:`, foundStudent);
          return foundStudent;
      }

      console.log(`❌ Student not found in Firestore for ID: "${studentId}"`);
      return null;
  } catch (error) {
      console.error(`❌ Firestore Error Retrieving Student:`, error);
      throw error;
  }
};


// Save a chat message (with user & bot responses)
const saveChatMessage = async (studentId, messages) => {
  if (!Array.isArray(messages)) {
      throw new Error("Messages must be an array.");
  }

  const chatRef = db.collection('chatHistory').doc(studentId);

  try {
      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) {
          // If chat history doesn't exist, create a new document
          await chatRef.set({
              studentId: studentId,
              messages: messages, // Store new messages
              createdAt: new Date(),
          });
      } else {
          // If chat history exists, append new messages
          await chatRef.update({
              messages: admin.firestore.FieldValue.arrayUnion(...messages)
          });
      }

      console.log(`✅ Chat messages saved in 'chatHistory' for student ${studentId}`);
  } catch (error) {
      console.error(`❌ Error saving chat for ${studentId}:`, error);
      throw error;
  }
};

// Retrieve chat history for a student
const getChatHistory = async (studentId) => {
    try {
        console.log(`🔍 Fetching grouped chat history from 'chatHistory' for student: "${studentId}"`);
        const chatDoc = await db.collection('chatHistory').doc(studentId).get();
  
        if (!chatDoc.exists) {
            console.log(`⚠️ No chat history found for student ${studentId}`);
            return [];
        }
  
        return chatDoc.data().conversations || []; // Use 'conversations' instead of 'messages'
    } catch (error) {
        console.error(`❌ Error retrieving grouped chat history for ${studentId}:`, error);
        throw error;
    }
  };
  


module.exports = { createStudent, getStudentByEmail, getStudentById, saveChatMessage, getChatHistory };
