import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { io } from 'socket.io-client'
import { useUserId } from './use-user-id'
import { useUserData } from './use-user-data'

export type Message = {
	id: string
	message: string
	time: number
}

export const useChat = defineStore('chat', () => {
	const { userId } = storeToRefs(useUserId())
	const { friends } = storeToRefs(useUserData())
	const socket = computed(() => {
		const client = io('ws://localhost:9000', {
			path: '',
			query: {
				id: userId.value,
			},
		})

		client.on('online_list', (userIds: string[]) => {
			onlineList.value = userIds
		})

		client.on('user_online', (userId: string) => {
			if (!onlineList.value.includes(userId)) {
				onlineList.value = [userId, ...onlineList.value]
			}
		})

		client.on('user_offline', (userId: string) => {
			onlineList.value = onlineList.value.filter(id => id !== userId)
		})

		client.on('receive_message', ([roomId, message]: [string, Message]) => {
			const messageList = chatMessages.value[roomId] || []
			messageList.push(message)
			chatMessages.value[roomId] = messageList
			if (roomId !== currentRoom.value) {
				unreadRoom.value[roomId] = unreadRoom.value[roomId]
					? unreadRoom.value[roomId] + 1
					: 1
			}
		})

		return client
	})

	const currentRoom = ref('')
	const chatMessages = ref<Record<string, Message[]>>({})
	const onlineList = ref<string[]>([])
	const unreadRoom = ref<Record<string, number>>({})

	watch(
		() => friends.value,
		value => {
			if (friends.value?.length) currentRoom.value = value[0].id
		}
	)

	const currentChatList = computed(() => {
		return chatMessages.value[currentRoom.value] || []
	})

	const pushMessage = ({
		roomId,
		message,
		sender,
	}: {
		roomId: string
		message: string
		sender: string
	}) => {
		const messageData = {
			id: sender,
			message: message,
			time: Date.now(),
		}
		const messageList = chatMessages.value[roomId] || []
		messageList.push(messageData)
		chatMessages.value[roomId] = messageList

		socket.value.emit('send_message', roomId, messageData)
	}

	return {
		socket,
		currentRoom,
		unreadRoom,
		chatMessages,
		onlineList,
		currentChatList,
		pushMessage,
	}
})
