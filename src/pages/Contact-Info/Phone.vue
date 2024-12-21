<template>
  <div class="call-container">
    <div class="controls">
      <input v-model="phoneNumber" placeholder="Nhập số điện thoại" />
      <button :disabled="isInCall" @click="makeCall">
        {{ isInCall ? 'Đang gọi...' : 'Gọi' }}
      </button>
      <button :disabled="!isInCall" @click="endCall">Kết thúc</button>
      <button :disabled="!isInCall" @click="toggleRecord">
        {{ isRecording ? 'Dừng ghi âm' : 'Bắt đầu ghi âm' }}
      </button>
    </div>

    <div class="call-status">
      <p>Trạng thái: {{ callStatus }}</p>
      <p v-if="recordingUrl">
        <a :href="recordingUrl" download>Tải xuống file ghi âm</a>
      </p>
    </div>

    <audio id="remoteAudio" autoplay></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface StringeeClient {
  connect: (token: string) => void
  disconnect: () => void
  on: (event: string, callback: (...args: any[]) => void) => void
  startRecord: (params: { callId: string }) => Promise<{ r: number }>
  stopRecord: (params: { callId: string }) => Promise<{ r: number; recordingUrl: string }>
}

interface StringeeCall {
  callId: string
  makeCall: (callback: (res: { r: number }) => void) => Promise<void>
  hangup: () => Promise<void>
  on: (event: string, callback: (state: any) => void) => void
}

declare global {
  interface Window {
    StringeeClient: new () => StringeeClient
    StringeeCall: new (
      client: StringeeClient,
      options: {
        from: string
        to: string
        videoResolution: string
        custom: { recording: boolean }
      },
    ) => StringeeCall
  }
}

// State
const stringeeClient = ref<StringeeClient | null>(null)
const currentCall = ref<StringeeCall | null>(null)
const phoneNumber = ref('')
const isInCall = ref(false)
const isRecording = ref(false)
const callStatus = ref('Sẵn sàng')
const recordingUrl = ref<string | null>(null)

const token = 'YOUR_STRINGEE_TOKEN'

// Methods
const initStringee = () => {
  stringeeClient.value = new window.StringeeClient()
  stringeeClient.value.connect(token)

  stringeeClient.value.on('connect', () => {
    console.log('Connected to Stringee')
    callStatus.value = 'Đã kết nối'
  })

  stringeeClient.value.on('disconnect', () => {
    console.log('Disconnected from Stringee')
    callStatus.value = 'Mất kết nối'
  })

  stringeeClient.value.on('error', (error) => {
    console.error('Stringee error:', error)
    callStatus.value = 'Lỗi kết nối'
  })
}

const handleCallEnd = () => {
  if (isRecording.value) {
    stopRecording()
  }
  currentCall.value = null
  isInCall.value = false
  callStatus.value = 'Cuộc gọi kết thúc'
}

const makeCall = async () => {
  if (!phoneNumber.value) {
    alert('Vui lòng nhập số điện thoại')
    return
  }

  try {
    if (!stringeeClient.value) return

    const call = new window.StringeeCall(stringeeClient.value, {
      from: '842471052419', // Số điện thoại Stringee của bạn
      to: phoneNumber.value,
      videoResolution: 'NORMAL',
      custom: { recording: true },
    })

    currentCall.value = call

    call.on('addremotestream', (stream) => {
      const audioElement = document.getElementById('remoteAudio') as HTMLAudioElement
      audioElement.srcObject = stream
    })

    call.on('signalingstate', (state) => {
      console.log('signaling state: ', state)
      switch (state) {
        case 'calling':
          callStatus.value = 'Đang gọi...'
          break
        case 'ringing':
          callStatus.value = 'Đang đổ chuông...'
          break
        case 'answered':
          callStatus.value = 'Đã kết nối cuộc gọi'
          isInCall.value = true
          break
        case 'ended':
          handleCallEnd()
          break
      }
    })

    await call.makeCall((res) => {
      if (res.r !== 0) {
        console.error('Lỗi thực hiện cuộc gọi:', res)
      }
    })
  } catch (error) {
    console.error('Lỗi khi thực hiện cuộc gọi:', error)
    callStatus.value = 'Lỗi cuộc gọi'
    isInCall.value = false
  }
}

const endCall = async () => {
  if (currentCall.value) {
    try {
      await currentCall.value.hangup()
    } catch (error) {
      console.error('Lỗi khi kết thúc cuộc gọi:', error)
    }
  }
}

const startRecording = async () => {
  if (!stringeeClient.value || !currentCall.value) return

  const response = await stringeeClient.value.startRecord({
    callId: currentCall.value.callId,
  })

  if (response.r === 0) {
    isRecording.value = true
    callStatus.value = 'Đang ghi âm'
  }
}

const stopRecording = async () => {
  if (!stringeeClient.value || !currentCall.value) return

  const response = await stringeeClient.value.stopRecord({
    callId: currentCall.value.callId,
  })

  if (response.r === 0) {
    isRecording.value = false
    callStatus.value = 'Đã dừng ghi âm'
    recordingUrl.value = response.recordingUrl
  }
}

const toggleRecord = async () => {
  if (!currentCall.value) return

  try {
    if (!isRecording.value) {
      await startRecording()
    } else {
      await stopRecording()
    }
  } catch (error) {
    console.error('Lỗi khi xử lý ghi âm:', error)
  }
}

// Lifecycle hooks
onMounted(() => {
  if (window.StringeeClient) {
    initStringee()
  } else {
    console.error('Stringee SDK chưa được load')
  }
})

onBeforeUnmount(() => {
  if (stringeeClient.value) {
    stringeeClient.value.disconnect()
  }
})
</script>

<style scoped>
.call-container {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px;
  margin: 5px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input {
  padding: 8px;
  margin-bottom: 10px;
}

.call-status {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

#remoteAudio {
  display: none;
}
</style>
