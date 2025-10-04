import { toast } from 'react-toastify'

export function useNotify () {
  
  const open = (type, message, opts = {}) => {
    const notifyFn = toast[type] || toast 
    const id = notifyFn(message, opts)
    return id
  }
  
  const replace = (message, opts = {}) => {
    toast.dismiss() 
    return open('info', message, opts)
  }

  return {
    success: (m, o) => open('success', m, o),
    info:    (m, o) => open('info',    m, o),
    warning: (m, o) => open('warn',    m, o), 
    error:   (m, o) => open('error',   m, o),
    replace: replace 
  }
}