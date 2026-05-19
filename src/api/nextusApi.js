import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

const speechClient = axios.create({
  baseURL: API_URL,
  timeout: 60000,
})

let activeSpeech = null

function isSpeechCanceled(error, controller) {
  return Boolean(
    controller?.signal?.aborted
    || error?.name === "AbortError"
    || error?.name === "CanceledError"
    || error?.code === "ERR_CANCELED"
    || axios.isCancel?.(error)
  )
}

function parseSpeechErrorMessage(error) {
  const data = error?.response?.data

  if (!data) {
    return error?.message || "Ses isteği başarısız oldu."
  }

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data)
      return parsed?.detail || parsed?.message || data
    } catch {
      return data
    }
  }

  if (data instanceof ArrayBuffer) {
    try {
      const decoded = new TextDecoder().decode(data)
      const parsed = JSON.parse(decoded)
      return parsed?.detail || parsed?.message || decoded || error?.message || "Ses isteği başarısız oldu."
    } catch {
      return error?.message || "Ses isteği başarısız oldu."
    }
  }

  if (ArrayBuffer.isView(data)) {
    try {
      const decoded = new TextDecoder().decode(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))
      const parsed = JSON.parse(decoded)
      return parsed?.detail || parsed?.message || decoded || error?.message || "Ses isteği başarısız oldu."
    } catch {
      return error?.message || "Ses isteği başarısız oldu."
    }
  }

  return data?.detail || data?.message || error?.message || "Ses isteği başarısız oldu."
}

function resetActiveSpeech(settle = "resolve", reason) {
  if (!activeSpeech) {
    return
  }

  const currentSpeech = activeSpeech
  activeSpeech = null

  try {
    currentSpeech.controller?.abort()
  } catch {
    // noop
  }

  if (currentSpeech.audio) {
    currentSpeech.audio.pause()
    currentSpeech.audio.removeAttribute("src")
    currentSpeech.audio.load()
  }

  if (currentSpeech.objectUrl) {
    URL.revokeObjectURL(currentSpeech.objectUrl)
  }

  if (settle === "resolve") {
    currentSpeech.resolve?.()
  } else if (settle === "reject") {
    currentSpeech.reject?.(reason instanceof Error ? reason : new Error("Ses oynatılamadı."))
  }
}

// Error interceptor
client.interceptors.response.use(
  response => response,
  error => {
    // Enhance error messages
    if (error.response) {
      const data = error.response.data
      error.message = data?.detail || data?.message || error.message
    }
    return Promise.reject(error)
  }
)

speechClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      error.message = parseSpeechErrorMessage(error)
    }
    return Promise.reject(error)
  }
)

export async function analyzeStock(symbol) {
  const response = await client.get(`/analyze?symbol=${symbol}`)
  return response.data
}

export async function askChatbot(symbol, question) {
  const response = await client.post(`/chat`, {
    symbol,
    question,
  })
  return response.data
}

export async function speakText(text) {
  const trimmedText = text?.trim()

  if (!trimmedText) {
    return null
  }

  resetActiveSpeech("resolve")

  const controller = new AbortController()
  activeSpeech = {
    controller,
    audio: null,
    objectUrl: null,
    resolve: null,
    reject: null,
  }

  try {
    const response = await speechClient.post(
      `/tts/speak`,
      { text: trimmedText },
      {
        responseType: "arraybuffer",
        signal: controller.signal,
      }
    )

    const contentType = response.headers?.["content-type"] || "audio/mpeg"
    const audioBlob = new Blob([response.data], { type: contentType })
    const objectUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(objectUrl)

    if (!activeSpeech || activeSpeech.controller !== controller) {
      URL.revokeObjectURL(objectUrl)
      return null
    }

    const playbackFinished = new Promise((resolve, reject) => {
      activeSpeech = {
        controller,
        audio,
        objectUrl,
        resolve,
        reject,
      }

      audio.addEventListener("ended", () => resetActiveSpeech("resolve"), { once: true })
      audio.addEventListener("error", () => resetActiveSpeech("reject", new Error("Ses oynatılamadı.")), { once: true })
    })

    try {
      await audio.play()
      await playbackFinished
      return null
    } catch (error) {
      if (isSpeechCanceled(error, controller)) {
        resetActiveSpeech("resolve")
        await playbackFinished.catch(() => {})
        return null
      }

      resetActiveSpeech("reject", error)
      await playbackFinished.catch(() => {})
      throw error
    }
  } catch (error) {
    if (isSpeechCanceled(error, controller)) {
      resetActiveSpeech("resolve")
      return null
    }

    resetActiveSpeech("reject", error)
    throw new Error(parseSpeechErrorMessage(error))
  }
}

export async function stopSpeech() {
  resetActiveSpeech("resolve")

  try {
    await speechClient.post(`/tts/stop`)
  } catch {
    // noop
  }

  return { status: "stopped" }
}