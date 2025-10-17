import Swal from 'sweetalert2'

export async function confirm({
  type = 'confirm', // 'delete' | 'edit' | 'confirm'
  title,
  text = '',
  confirmText,
  cancelText = 'Cancelar',
}) {
  // Configuración base según tipo
  let baseConfig = {
    delete: {
      icon: 'warning',
      title: title || '¿Eliminar?',
      confirmButtonText: confirmText || 'Eliminar',
      confirmButtonColor: '#d33', // rojo
    },
    cancel: {
      icon: 'warning',
      title: title || '¿Cancelar?',
      confirmButtonText: confirmText || 'Cancelar',
      confirmButtonColor: '#d33', // rojo
    },
    edit: {
      icon: 'info',
      title: title || '¿Editar?',
      confirmButtonText: confirmText || 'Guardar cambios',
      confirmButtonColor: '#6db0efff', // azul
    },
    confirm: {
      icon: 'question',
      title: title || '¿Confirmar?',
      confirmButtonText: confirmText || 'Sí',
      confirmButtonColor: '#3085d6', // azul estándar
    }
  }[type]

  const { isConfirmed } = await Swal.fire({
    ...baseConfig,
    text,
    showCancelButton: true,
    cancelButtonText: cancelText, // ✅ ahora sí definido
    reverseButtons: true,
    focusCancel: true,
  })

  return isConfirmed
}
