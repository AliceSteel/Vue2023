import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAph9o1skVlvwYedCjj-zlTILaqrfzl_6k',
  authDomain: 'metal-music-forum.firebaseapp.com',
  projectId: 'metal-music-forum',
  storageBucket: 'metal-music-forum.appspot.com',
  appId: '1:660637327433:web:f520cd028e2e3210dedf98'
}
// Initializing Firebase:
firebase.initializeApp(firebaseConfig)

// Creating the references to be accessible through app:
const auth = firebase.auth()
const db = firebase.firestore()

export { auth, db }
