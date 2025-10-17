// El componente del contenedor debe ser un Client Component en Next.js 13+
'use client'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ToastProvider({ children }) {
  const MAX_TOASTS = 2

  return (
    <>
      {children}
      <ToastContainer
        limit={MAX_TOASTS} 
        
        position="top-center" // O la posición que desees
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Puedes usar 'light', 'dark' o 'colored'
      />
    </>
  )
}