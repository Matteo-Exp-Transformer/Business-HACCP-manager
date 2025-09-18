/**
 * Toast Notification System - HACCP Design System
 * 
 * Toast notifications with HACCP-specific styling and context
 */

import { toast, ToastContainer } from 'react-toastify'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import 'react-toastify/dist/ReactToastify.css'

// Custom toast content component
const ToastContent = ({ icon: Icon, title, message, iconColor }) => (
  <div className="flex items-start gap-3">
    <Icon className={`w-5 h-5 mt-0.5 ${iconColor}`} />
    <div className="flex-1">
      <div className="font-medium text-neutral-900">{title}</div>
      {message && <div className="text-sm text-neutral-600 mt-1">{message}</div>}
    </div>
  </div>
)

// Toast notification functions
export const showToast = {
  success: (title, message = '') => {
    toast.success(
      <ToastContent 
        icon={CheckCircle} 
        title={title} 
        message={message} 
        iconColor="text-success-600" 
      />,
      {
        className: 'bg-white border-l-4 border-success-500',
        progressClassName: 'bg-success-500'
      }
    )
  },

  error: (title, message = '') => {
    toast.error(
      <ToastContent 
        icon={XCircle} 
        title={title} 
        message={message} 
        iconColor="text-error-600" 
      />,
      {
        className: 'bg-white border-l-4 border-error-500',
        progressClassName: 'bg-error-500'
      }
    )
  },

  warning: (title, message = '') => {
    toast.warning(
      <ToastContent 
        icon={AlertTriangle} 
        title={title} 
        message={message} 
        iconColor="text-warning-600" 
      />,
      {
        className: 'bg-white border-l-4 border-warning-500',
        progressClassName: 'bg-warning-500'
      }
    )
  },

  info: (title, message = '') => {
    toast.info(
      <ToastContent 
        icon={Info} 
        title={title} 
        message={message} 
        iconColor="text-primary-600" 
      />,
      {
        className: 'bg-white border-l-4 border-primary-500',
        progressClassName: 'bg-primary-500'
      }
    )
  },

  // HACCP-specific notifications
  compliance: (title, message = '') => {
    toast.success(
      <ToastContent 
        icon={CheckCircle} 
        title={`✅ HACCP: ${title}`} 
        message={message} 
        iconColor="text-success-600" 
      />,
      {
        className: 'bg-success-50 border-l-4 border-success-500',
        progressClassName: 'bg-success-500'
      }
    )
  },

  nonCompliance: (title, message = '') => {
    toast.error(
      <ToastContent 
        icon={XCircle} 
        title={`🚨 Non-Conformità: ${title}`} 
        message={message} 
        iconColor="text-error-600" 
      />,
      {
        className: 'bg-error-50 border-l-4 border-error-500',
        progressClassName: 'bg-error-500',
        autoClose: 8000 // Longer display for critical issues
      }
    )
  },

  temperatureAlert: (title, message = '') => {
    toast.warning(
      <ToastContent 
        icon={AlertTriangle} 
        title={`🌡️ Temperatura: ${title}`} 
        message={message} 
        iconColor="text-warning-600" 
      />,
      {
        className: 'bg-warning-50 border-l-4 border-warning-500',
        progressClassName: 'bg-warning-500',
        autoClose: 6000
      }
    )
  },

  taskReminder: (title, message = '') => {
    toast.info(
      <ToastContent 
        icon={Info} 
        title={`📋 Promemoria: ${title}`} 
        message={message} 
        iconColor="text-primary-600" 
      />,
      {
        className: 'bg-primary-50 border-l-4 border-primary-500',
        progressClassName: 'bg-primary-500'
      }
    )
  }
}

// Toast container component
export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      className="mt-16" // Account for header height
      toastClassName="rounded-lg shadow-medium"
      bodyClassName="text-sm"
      progressClassName="h-1"
    />
  )
}

export default showToast