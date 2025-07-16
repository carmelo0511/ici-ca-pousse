import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyxtOXHNqly6q5R_P3WY5XJgXZjsPVn5M",
  authDomain: "ici-ca-pousse.firebaseapp.com",
  projectId: "ici-ca-pousse",
  storageBucket: "ici-ca-pousse.appspot.com",
  messagingSenderId: "633260578575",
  appId: "1:633260578575:web:bbabfd72ea861ca9e9107a",
  measurementId: "G-8PH0HHW4NG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;

// Initialise le profil utilisateur dans Firestore (users/{uid})
export async function ensureUserProfile(user) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      friends: [],
      pendingInvites: []
    });
  }
}

// Fonctions pour gérer les défis dans Firebase
export async function createChallengeInFirebase(challengeData) {
  try {
    console.log('🔥 Création du défi dans Firebase:', challengeData);
    const challengeRef = await addDoc(collection(db, 'challenges'), {
      ...challengeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('🔥 Défi créé dans Firebase avec ID:', challengeRef.id);
    return { id: challengeRef.id, ...challengeData };
  } catch (error) {
    console.error('🔥 Erreur lors de la création du défi dans Firebase:', error);
    throw error;
  }
}

export async function getChallengesFromFirebase(userId) {
  try {
    const challengesRef = collection(db, 'challenges');
    
    // Récupérer les défis envoyés
    const sentQuery = query(
      challengesRef,
      where('senderId', '==', userId)
    );
    const sentSnapshot = await getDocs(sentQuery);
    
    const sentChallenges = sentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Récupérer les défis reçus
    const receivedQuery = query(
      challengesRef,
      where('receiverId', '==', userId)
    );
    const receivedSnapshot = await getDocs(receivedQuery);
    
    const receivedChallenges = receivedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Combiner et trier par date de création (plus récent en premier)
    const allChallenges = [...sentChallenges, ...receivedChallenges];
    return allChallenges.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des défis:', error);
    return [];
  }
}

export async function updateChallengeInFirebase(challengeId, updates) {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du défi:', error);
    throw error;
  }
}

export async function deleteChallengeFromFirebase(challengeId) {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    await deleteDoc(challengeRef);
  } catch (error) {
    console.error('Erreur lors de la suppression du défi:', error);
    throw error;
  }
} 