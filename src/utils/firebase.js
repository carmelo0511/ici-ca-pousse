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
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

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
      pendingInvites: [],
      experience: {
        xp: 0,
        level: 1,
        levelName: 'Débutant',
        totalWorkouts: 0,
        streak: 0,
        lastWorkoutDate: null
      },
      badges: [],
      selectedBadge: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

// Fonctions pour gérer les défis dans Firebase
export async function createChallengeInFirebase(challengeData) {
  try {
    // Création du défi dans Firebase
    const challengeRef = await addDoc(collection(db, 'challenges'), {
      ...challengeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    // Défi créé dans Firebase avec succès
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

// Fonction pour uploader une photo de profil
export async function uploadProfilePicture(userId, file) {
  try {
    // Début de l'upload de la photo de profil
    
    const storage = getStorage();
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const fileName = `profile-pictures/${userId}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
          // Informations du fichier
    
    // Upload du fichier
    const snapshot = await uploadBytes(storageRef, file);
          // Upload réussi, récupération de l'URL
    
    const downloadURL = await getDownloadURL(snapshot.ref);
          // URL de téléchargement obtenue
    
    // Mettre à jour le profil utilisateur
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL,
      updatedAt: serverTimestamp()
    });
    
          // Profil utilisateur mis à jour avec succès
    return downloadURL;
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de la photo de profil:', error);
    console.error('❌ Code d\'erreur:', error.code);
    console.error('❌ Message d\'erreur:', error.message);
    
    // Gestion spécifique des erreurs
    if (error.code === 'storage/unauthorized') {
      throw new Error('Erreur d\'autorisation. Vérifiez que vous êtes connecté.');
    } else if (error.code === 'storage/cors') {
      throw new Error('Erreur CORS. Les règles Firebase Storage doivent être configurées.');
    } else if (error.code === 'storage/quota-exceeded') {
      throw new Error('Quota de stockage dépassé.');
    } else if (error.code === 'storage/invalid-format') {
      throw new Error('Format de fichier non supporté.');
    } else {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }
}

// Fonction pour supprimer une photo de profil
export async function deleteProfilePicture(userId) {
  try {
    const storage = getStorage();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists() && userDoc.data().photoURL) {
      // Supprimer l'ancienne photo du storage
      const oldPhotoRef = ref(storage, userDoc.data().photoURL);
      await deleteObject(oldPhotoRef);
    }
    
    // Mettre à jour le profil utilisateur
    await updateDoc(userRef, {
      photoURL: null,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo de profil:', error);
    throw error;
  }
}

// Fonction pour sauvegarder les badges d'un utilisateur
export async function saveUserBadges(userId, badges) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      badges: badges,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des badges:', error);
    throw error;
  }
}

// Fonction pour récupérer les badges d'un utilisateur
export async function getUserBadges(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().badges || [];
    }
    
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return [];
  }
}

// Fonction pour récupérer les informations complètes d'un utilisateur (avec photo et badges)
export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: userId,
        displayName: userData.displayName,
        email: userData.email,
        photoURL: userData.photoURL,
        badges: userData.badges || [],
        selectedBadge: userData.selectedBadge || null,
        experience: userData.experience || {
          xp: 0,
          level: 1,
          levelName: 'Débutant',
          totalWorkouts: 0,
          streak: 0,
          lastWorkoutDate: null
        },
        height: userData.height,
        weight: userData.weight,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    return null;
  }
} 