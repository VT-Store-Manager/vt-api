<template>
  <div class="flex flex-column h-full">
    <ProgressSpinner
      v-if="pending"
      class="mt-7"
    />
    <p v-else-if="error">{{ error }}</p>
    <template v-else>
      <div class="user-chatbox flex h-full">
        <div
          class="friend-list h-full border-right-2 border-black-alpha-10"
          :style="{ minWidth: '200px' }"
        >
          <p
            class="text-sm my-0 px-3 py-3 border-bottom-1 border-black-alpha-10"
          >
            Online: {{ chatStore.onlineList.length }}
          </p>
          <div
            v-for="user in friends"
            :key="user.id"
            class="friend-item py-2 px-3 flex justify-content-between align-items-center cursor-pointer hover:bg-gray-100"
            :class="
              chatStore.currentRoom === user.id
                ? ['bg-primary-100', 'hover:bg-primary-100']
                : []
            "
            @click="onChangeRoom(user.id)"
          >
            <p class="my-2">{{ user.name }}</p>
            <Badge
              v-if="chatStore.unreadRoom[user.id]"
              :value="chatStore.unreadRoom[user.id]"
            />
            <div
              v-if="chatStore.onlineList.includes(user.id)"
              :style="{ paddingTop: '2px', paddingBottom: '2px' }"
              class="bg-green-500 px-2 border-round-2xl text-xs text-white"
            >
              online
            </div>
          </div>
        </div>
        <div class="chatbox flex flex-column flex-1">
          <div
            class="user-online flex justify-content-between align-items-center bg-primary px-3 py-2"
          >
            <p class="mr-4">
              <Avatar
                v-if="me?.name"
                :label="
                  userMap
                    .get(chatStore.currentRoom)
                    ?.name.toUpperCase()
                    .slice(0, 2)
                "
                class="mr-2"
                shape="circle"
                :style="{
                  backgroundColor: friendAvtColor,
                  color: '#ffffff',
                }"
              />
              <span v-if="userMap && chatStore.currentRoom">{{
                userMap.get(chatStore.currentRoom)?.name
              }}</span>
            </p>
            <div class="flex align-items-center">
              <p v-if="me">{{ me.name }}</p>
              <Avatar
                v-if="me?.name"
                :label="me.name.toUpperCase().slice(0, 2)
                "
                class="ml-2"
                shape="circle"
                :style="{
                  backgroundColor: '#999',
                  color: '#ffffff',
                }"
							/>
            </div>
          </div>
          <div class="messages flex-1 overflow-y-scroll p-2">
            <ChatPanel />
          </div>
          <div class="message-input p-2 flex">
            <InputText
              v-model="inputMessage"
              type="text"
              class="w-full"
              size="small"
              placeholder="Enter message..."
              @keyup.enter="onSend"
            />
            <Button
              icon="pi pi-send"
              text
              class="ml-2"
							:disabled="!inputMessage.trim()"
              @click="onSend"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Badge from 'primevue/badge'
import ChatPanel from '@/components/ChatPanel.vue'
import { useUserData } from '@/store/use-user-data'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useChat } from '../store/use-chat'
import { useUserId } from '@/store/use-user-id'
import { ref, watch } from 'vue'

const userInfoStore = useUserData()
const chatStore = useChat()
const userIdStore = useUserId()
const { userId } = storeToRefs(userIdStore)
const { refresh } = userIdStore
const { me, userMap, friends, pending, error } = storeToRefs(userInfoStore)
const { fetch } = userInfoStore
const router = useRouter()
const inputMessage = ref('')

refresh()
if (userId.value) {
  fetch(userId.value)
  chatStore.socket.connect()
} else {
  router.push('/login')
}

const onSend = () => {
  const message = inputMessage.value.trim()
  if (!message) return

  chatStore.pushMessage({
    roomId: chatStore.currentRoom,
    message,
    sender: userId.value,
  })
  inputMessage.value = ''
}

const onChangeRoom = (roomId: string) => {
  chatStore.currentRoom = roomId
  if (chatStore.unreadRoom[roomId]) {
    delete chatStore.unreadRoom[roomId]
  }
}

const friendAvtColor = ref('#'+ (Math.random() * 0xFFFFFF<<0) .toString(16))
watch(() => chatStore.currentRoom, () => {
	friendAvtColor.value = '#'+ (Math.random() * 0xFFFFFF<<0) .toString(16)
})
</script>

<style scoped></style>
