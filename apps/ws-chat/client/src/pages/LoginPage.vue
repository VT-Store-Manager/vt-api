<template>
  <div class="card flex justify-content-center h-full align-items-center">
    <InputText
			v-model="phone"
      type="text"
      placeholder="Phone number"
      width="200"
			@keyup.enter="onLogin"
    />
    <Button
      label="Login"
      :loading="pending"
      class="ml-3"
      @click="onLogin"
    />
  </div>
  <p v-if="error"></p>
</template>

<script lang="ts" setup>
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useLogin } from '@/store/use-login'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router';
import { useUserId } from '@/store/use-user-id';

const loginStore = useLogin()
const { pending, phone, error, data } = storeToRefs(loginStore)
const { fetch } = loginStore
const router = useRouter()
const { userId } = storeToRefs(useUserId())

const onLogin = async () => {
	await fetch()
	if (data.value) {
		userId.value = data.value
		router.push('/')
	}
}
</script>
