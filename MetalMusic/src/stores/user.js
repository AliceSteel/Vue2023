import { defineStore } from 'pinia'
import { auth, usersCollection } from '@/includes/firebase'

export default defineStore('user', {
  state: () => ({
    userLoggedIn: false
  }),
  actions: {
    async register(values) {
      // to store user data in authentication database:
      const userCred = await auth.createUserWithEmailAndPassword(values.email, values.password)

      // to store user data in firestore database, linked to newly created user:
      await usersCollection.doc(userCred.user.uid).set({
        name: values.name,
        email: values.email,
        age: values.age,
        country: values.country,
        role: values.role
      })

      //to update the name for auth user:
      await userCred.user.updateProfile({
        displayName: values.name
      })
      this.userLoggedIn = true
    }
  }
})
