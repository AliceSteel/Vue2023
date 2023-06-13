<template>
  <main>
    <!-- Music Header -->
    <!--<section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      ></div>
      <div class="container mx-auto flex items-center">
        <button
          @click.prevent="newSong(song)"
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
        >
          <i class="fas fa-play"></i>
        </button>
        <div class="z-50 text-left ml-8">
          <div class="text-3xl font-bold">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
        </div>
      </div>
    </section>-->
    <section>
      <div class="container mx-auto flex items-center justify-between bg-transparent">
        <button
          @click.prevent="newSong(song)"
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
        >
          <i class="fas fa-play"></i>
        </button>
        <div class="z-50 text-left ml-8 mr-auto">
          <div class="text-3xl font-bold text-white">{{ song.modified_name }}</div>
          <div>{{ song.genre }}</div>
        </div>
        <div class="w-2/4 h-0 pb-[50%] rounded-full overflow-hidden aspect-square">
          <div class="w-full relative">
            <div class="leftHand">
              <img src="/assets/img/leftHand2.png" alt="" />
            </div>
            <div class="drummerBody">
              <img src="/assets/img/withoutLeftHand2.png" alt="" />
            </div>
            <div class="rightHand">
              <img src="/assets/img/righthand.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6 text-white" id="comments">
      <div class="rounded border relative flex flex-col">
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
    <ul class="container mx-auto text-white">
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

<style scoped>
.leftHand {
  position: absolute;
  width: 120px;
  transform-origin: bottom left;
  left: 223px;
  top: 450px;
  z-index: 5;
  transform: rotate(0deg);
  animation: pikaPat 0.7s alternate infinite;
}
.leftHand img {
  width: 100%;
}

.drummerBody {
  position: absolute;
}

.rightHand {
  position: absolute;
  left: 650px;
  top: 240px;
  transform-origin: bottom left;
  transform: rotateY(0deg) rotateX(0deg) scale(0.5);
  transform-style: preserve-3d;
  animation: rotateRight 1s alternate infinite;
}

@keyframes pikaPat {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-5deg);
  }
}
@keyframes rotateRight {
  from {
    transform: rotateX(0deg);
  }
  to {
    transform: rotateX(45deg) scale(1.1);
  }
}
</style>
