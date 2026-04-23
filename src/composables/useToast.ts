import { reactive } from 'vue'

type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastState {
  visible: boolean
  message: string
  type: ToastType
  duration: number
}

// Module-level singleton so all components share one notification slot
const state = reactive<ToastState>({
  visible: false,
  message: '',
  type: 'info',
  duration: 3000,
})

let resetTimer: ReturnType<typeof setTimeout> | null = null

function show(message: string, type: ToastType = 'info', duration = 3000) {
  if (resetTimer) clearTimeout(resetTimer)
  // Brief reset so re-triggering the same message re-animates
  state.visible = false
  resetTimer = setTimeout(() => {
    state.message = message
    state.type = type
    state.duration = duration
    state.visible = true
  }, 30)
}

export function useToast() {
  return {
    state,
    show,
    success: (msg: string) => show(msg, 'success'),
    error: (msg: string) => show(msg, 'error'),
    warning: (msg: string) => show(msg, 'warning'),
    info: (msg: string) => show(msg, 'info'),
    close: () => {
      state.visible = false
    },
  }
}
