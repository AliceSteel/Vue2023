<template>
  <li class="flex justify-between items-center p-3 pl-6 cursor-pointer transition duration-300">
    <div>
      <router-link :to="{ name: 'song', params: { id: song.docID } }" class="block text-teal-200">{{
        song.modified_name
      }}</router-link>
      <span v-if="song.display_name" class="text-teal-200 text-sm">by {{ song.display_name }}</span>
    </div>

    <div class="text-teal-200 text-lg">
      <span class="comments">
        <i class="fa fa-comments text-gray-600"></i>
        {{ song.comment_count }}
      </span>
    </div>
  </li>
</template>

<script>
export default {
  name: 'HomeSongItem',
  props: ['song']
}
</script>
