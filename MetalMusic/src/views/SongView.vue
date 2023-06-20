<template>
  <main>
    <!-- Music Header -->
    <section>
      <div class="container mx-auto flex items-center justify-between bg-transparent">
        <button
          @click.prevent="newSong(song)"
          type="button"
          class="z-4 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
        >
          <i class="fas fa-play"></i>
        </button>
        <div class="z-4 text-left ml-8 mr-auto">
          <div class="text-3xl font-bold text-white">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
        </div>
        <div class="w-2/4 h-0 pb-[50%] overflow-hidden aspect-square rounded-lg">
          <div class="w-full relative h-0 pb-[50%]">
            <video loop muted preload autoplay class="absolute w-full h-auto top-0 left-0 z-5">
              <source src="/assets/video/drummer.mp4" type="video/mp4" />
              <source src="/assets/video/drummer.webm" type="video/webm" />
            </video>
          </div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6 text-white" id="comments">
      <div class="rounded border relative flex flex-col">
        <div class="px-6 pt-6 pb-5 border-b border-gray-200 text-orange-800" v-if="!userLoggedIn">
          <span>You can add a comment after logging in.</span>
        </div>
        <div class="px-6 pt-6 pb-5 border-b border-gray-200">
          <!-- Comment Count -->
          <span v-if="song.comment_count" class="card-title">{{ song.comment_count }}</span>
          <span> {{ commentWord(song.comment_count) }}</span>

          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div
            class="text-white text-center font-bold p-4 mb-4"
            v-if="commentShowAlert"
            :class="commentAlertVariant"
          >
            {{ commentAlertMessage }}
          </div>
          <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn">
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
          <!-- Sort Comments -->
          <select
            v-model="sort"
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          >
            <option value="1">Newest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto text-white pb-10">
      <li class="p-6 border border-gray-200" v-for="comment in sortedComments" :key="comment.docID">
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
  </main>
</template>

<script>
import { songsCollection, auth, commentsCollection } from '@/includes/firebase'
import { mapState, mapActions } from 'pinia'
import useUserStore from '@/stores/user'
import usePlayerStore from '@/stores/player'

export default {
  name: 'SongView',
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
      vm.getComments()
      vm.commentWord(vm.song_comment_count)
    })
  },
  methods: {
    ...mapActions(usePlayerStore, ['newSong']),
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
}
</script>
