<template>
  <li class="w-full p-3 pl-6 text-teal-200 transition duration-300">
    <router-link
      :to="{ name: 'song', params: { id: song.docID } }"
      class="flex justify-between items-center"
    >
      <div>
        <span class="text-lime-500">
          {{ song.modified_name }}
        </span>
        <span v-if="song.display_name" class="text-sm"> by {{ song.display_name }} </span>
      </div>
      <div v-if="song.genre" class="mr-auto">
        <span
          >&nbsp;(
          {{ song.genre }}
          )</span
        >
      </div>
      <div class="text-lg">
        <i class="fa fa-comments"></i>
        {{ song.comment_count }}
      </div>
    </router-link>
  </li>
</template>

<script>
export default {
  name: 'HomeSongItem',
  props: ['song']
}
</script>
