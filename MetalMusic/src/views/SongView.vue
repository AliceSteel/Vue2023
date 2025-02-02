<template>
  <main>
    <section class="container mx-auto pt-24">
      <spectrum-visualizer />
      <!--  <button
          @click.prevent="playSong()"
          type="button"
          class="z-10 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
        >
          <i class="fas fa-play"></i>
        </button> -->
    </section>
    <!-- Form -->
    <section class="container mx-auto my-6 text-white" id="comments">
      <div class="rounded border relative flex flex-col">
        <div class="px-6 pt-6 pb-5 border-b border-gray-200 text-orange-800" v-if="!userLoggedIn">
          <span>You can add a comment after logging in.</span>
        </div>
        <div class="flex items-center p-6 border-b border-gray-200">
          <!-- Comment Count -->
          <span v-if="song.comment_count" class="card-title">{{ song.comment_count }}</span>
          <span>&nbsp; {{ commentWord(song.comment_count) }}</span>
          <!-- Sort Comments -->
          <select
            v-model="sort"
            class="block py-1.5 px-3 ml-auto text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          >
            <option value="1">Newest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
        <div
          class="text-white text-center font-bold p-6 mb-4"
          v-if="commentShowAlert"
          :class="commentAlertVariant"
        >
          {{ commentAlertMessage }}
        </div>
        <div v-if="userLoggedIn" class="p-6">
          <vee-form :validation-schema="schema" @submit="addComment">
            <vee-field
              as="textarea"
              name="comment"
              class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded mb-4"
              placeholder="Your comment here..."
            ></vee-field>
            <ErrorMessage class="text-red-600" name="comment" />
            <button
              type="submit"
              class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="commentInSubmission"
            >
              Submit
            </button>
          </vee-form>
        </div>
      </div>
      <!-- Comments -->
      <ul class="w-full text-white">
        <li
          class="p-6 border border-gray-200"
          v-for="comment in sortedComments"
          :key="comment.docID"
        >
          <!-- Comment Author -->
          <div class="mb-5">
            <div class="font-bold text-orange">{{ comment.whoPosted }}</div>
            <time class="text-xs">{{ comment.datePosted }}</time>
          </div>

          <p>
            {{ comment.content }}
          </p>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteEnter } from 'vue-router'
import { songsCollection, auth, commentsCollection } from '@/includes/firebase'
import SpectrumVisualizer from '../components/SpectrumVisualizer.vue'
import { mapState, mapActions } from 'pinia'
import useUserStore from '@/stores/user'
import usePlayerStore from '@/stores/player'
import { storeToRefs } from 'pinia'
import { ErrorMessage } from 'vee-validate'

const song = ref({})
const schema = {
  comment: 'required|min:3'
}
const commentInSubmission = ref(false)
const commentShowAlert = ref(false)
const commentAlertVariant = ref('bg-blue-500')
const commentAlertMessage = ref('Please wait! Your comment is being submitted...')
const comments = ref([])
const sort = ref('1') // 1 is for newest to oldest

// Store
const userStore = useUserStore()
const { userLoggedIn } = storeToRefs(userStore)
const playerStore = usePlayerStore()
const { playSong } = playerStore
// Computed
const sortedComments = computed(() => {
  return comments.value.slice().sort((a, b) => {
    if (sort.value === '1') {
      return new Date(b.datePosted) - new Date(a.datePosted)
    }
    return new Date(a.datePosted) - new Date(b.datePosted)
  })
})
async function addComment(values, { resetForm }) {
  commentInSubmission.value = true
  commentShowAlert.value = true
  commentAlertVariant.value = 'bg-blue-500'
  commentAlertMessage.value = 'Please wait! Your comment is being submitted...'

  const comment = {
    content: values.comment,
    datePosted: new Date().toString(),
    songID: route.params.id,
    whoPosted: auth.currentUser.displayName,
    userID: auth.currentUser.uid
  }
  await commentsCollection.add(comment)
  // Update the comments count
  song.value.comment_count += 1
  commentWord(song.value.comment_count)

  await songsCollection.doc(route.params.id).update({
    comment_count: song.value.comment_count
  })

  getComments()

  commentInSubmission.value = false
  commentAlertVariant.value = 'bg-green-500'
  commentAlertMessage.value = 'Comment added!'

  resetForm()
}
async function getComments() {
  const snapshots = await commentsCollection.where('songID', '==', route.params.id).get()

  comments.value = [] // Reset comments to avoid duplicates

  snapshots.forEach((doc) => {
    comments.value.push({
      docID: doc.id,
      ...doc.data()
    })
  })
}
function commentWord(comment_count) {
  if (comment_count) {
    return comment_count > 1 ? ' comments' : ' comment'
  } else {
    return 'No comments'
  }
}
const route = useRoute()
const router = useRouter()

onBeforeRouteEnter(async (to, from, next) => {
  const docSnapshot = await songsCollection.doc(to.params.id).get()
  next((vm) => {
    if (!docSnapshot.exists) {
      vm.$router.push({ name: 'home' })
      return
    }
    // Check if sort param exists in route query
    const { sort } = vm.$route.query
    vm.sort = sort === '1' || sort === '2' ? sort : '1'

    vm.song = docSnapshot.data()
    const { current_song } = storeToRefs(usePlayerStore())
    current_song.value = vm.song
    vm.getComments()
    vm.commentWord(vm.song.comment_count)
  })
})
watch(sort, (newVal) => {
  if (newVal === route.query.sort) {
    return
  }
  router.push({
    query: {
      sort: newVal
    }
  })
})
/* export default {
  name: 'SongView',
  components: { SpectrumVisualizer },
  data() {
    return {
      song: {},
      schema: {
        comment: 'required|min:3'
      },
      commentInSubmission: false,
      commentShowAlert: false,
      commentAlertVariant: 'bg-blue-500',
      commentAlertMessage: 'Please wait! Your comment is being submitted...',
      comments: [],
      sort: '1' //1 is for newest to oldest
    }
  },
  computed: {
    ...mapState(useUserStore, ['userLoggedIn']),
    sortedComments() {
      //we use 'slice' to return the new array, to avoid original array mutation:
      return this.comments.slice().sort((a, b) => {
        if (this.sort === '1') {
          return new Date(b.datePosted) - new Date(a.datePosted)
        }
        return new Date(a.datePosted) - new Date(b.datePosted)
      })
    }
  },
  //instead of 'created' hook I use router guard hook to optimise performance:
  async beforeRouteEnter(to, from, next) {
    const docSnapshot = await songsCollection.doc(to.params.id).get()
    next((vm) => {
      if (!docSnapshot.exists) {
        vm.$router.push({ name: 'home' })
        return
      }
      //checking if sort param exist in route query:
      const { sort } = vm.$route.query
      vm.sort = sort === '1' || sort === '2' ? sort : '1'

      vm.song = docSnapshot.data()
      const { current_song } = storeToRefs(usePlayerStore())
      current_song.value = vm.song
      vm.getComments()
      vm.commentWord(vm.song_comment_count)
    })
  },
  methods: {
    ...mapActions(usePlayerStore, ['playSong']),
    async addComment(values, { resetForm }) {
      this.commentInSubmission = true
      this.commentShowAlert = true
      this.commentAlertVariant = 'bg-blue-500'
      this.commentAlertMessage = 'Please wait! Your comment is being submitted...'

      const comment = {
        content: values.comment,
        datePosted: new Date().toString(),
        songID: this.$route.params.id,
        whoPosted: auth.currentUser.displayName,
        userID: auth.currentUser.uid
      }
      await commentsCollection.add(comment)

      //to update the comments count:
      this.song.comment_count += 1
      this.commentWord(this.song.comment_count)

      await songsCollection.doc(this.$route.params.id).update({
        comment_count: this.song.comment_count
      })

      this.getComments()

      this.commentInSubmission = false
      this.commentAlertVariant = 'bg-green-500'
      this.commentAlertMessage = 'Comment added!'

      resetForm()
    },
    async getComments() {
      const snapshots = await commentsCollection.where('songID', '==', this.$route.params.id).get()

      this.comments = [] //we need to reset comments to avoid duplicates

      snapshots.forEach((doc) => {
        this.comments.push({
          docID: doc.id,
          ...doc.data()
        })
      })
    },

    commentWord(comment_count) {
      if (comment_count) {
        //checking if comments array exist
        return comment_count > 1 ? ' comments' : ' comment'
      } else {
        return 'No comments'
      }
    }
  },
  //to keep sorted selection when updating the page as query params
  watch: {
    sort(newVal) {
      if (newVal === this.$route.query.sort) {
        return
      }
      this.$router.push({
        query: {
          sort: newVal
        }
      })
    }
  }
} */
</script>
