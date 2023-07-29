<template>
  <div
    class="p-2 flex flex-column"
    :class="{ 'align-items-end': !leftAlign }"
  >
    <p class="text-sm px-2">
      {{ userData.userMap.get(data.id)?.name }}
    </p>
    <div
      class="message flex align-items-center my-1"
      :class="{ 'flex-row-reverse': !leftAlign }"
    >
      <p
        class="border-round-3xl px-3 py-1"
        :class="[leftAlign ? 'bg-primary' : 'bg-gray-300']"
      >
        {{ data.message }}
      </p>
      <p class="text-xs mx-2 text-gray-500">
        {{ moment(data.time).format('kk:mm') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message } from '@/store/use-chat'
import { useUserData } from '../store/use-user-data'
import moment from 'moment'

interface Props {
  data: Message
  leftAlign?: boolean
}

defineProps<Props>()
const userData = useUserData()
</script>

<style scoped></style>
