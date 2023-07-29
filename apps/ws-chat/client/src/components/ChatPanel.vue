<template>
  <div>
    <MessageItem
      v-for="(message, index) in chatStore.currentChatList"
      :key="index"
      :data="message"
      :left-align="message.id !== userIdStore.userId"
    />
  </div>
</template>

<script setup lang="ts">
import { useChat } from '@/store/use-chat'
import { useUserId } from '@/store/use-user-id'
import MessageItem from './MessageItem.vue'

const chatStore = useChat()
const userIdStore = useUserId()
</script>

<style scoped></style>
