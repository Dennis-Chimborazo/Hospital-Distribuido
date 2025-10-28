import { useToast } from 'vue-toastification'

const MAX = 2
const activeIds = [] 

export function useNotify () {
  const toast = useToast()

  const removeId = (id) => {
    const i = activeIds.indexOf(id)
    if (i !== -1) activeIds.splice(i, 1)
  }

  const open = (type, message, opts = {}) => {
    if (activeIds.length >= MAX) {
      const oldest = activeIds.shift()
      if (oldest) toast.dismiss(oldest)
    }

    const id = (toast[type] || toast)(message, {
      ...opts,
      onClose: () => removeId(id) // al cerrarse, lo quitamos del registro
    })
    activeIds.push(id)
    return id
  }

  return {
    success:  (m, o) => open('success',  m, o),
    info:     (m, o) => open('info',     m, o),
    warning:  (m, o) => open('warning',  m, o),
    error:    (m, o) => open('error',    m, o),
    replace:  (m, o) => { // nunca más de 1: reemplaza todo
      activeIds.splice(0).forEach(id => toast.dismiss(id))
      return open('info', m, o)
    }
  }
}
