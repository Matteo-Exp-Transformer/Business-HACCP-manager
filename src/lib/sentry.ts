import * as Sentry from '@sentry/react'

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.VITE_APP_ENV || 'development'
  
  if (!dsn) {
    console.warn('Sentry DSN not found. Error monitoring disabled.')
    return
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Session replay
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    // Additional options
    beforeSend(event) {
      // Filter out non-critical errors in development
      if (environment === 'development') {
        console.log('Sentry event:', event)
      }
      return event
    },
  })
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const addBreadcrumb = Sentry.addBreadcrumb
export const setUser = Sentry.setUser
export const setTag = Sentry.setTag
export const setContext = Sentry.setContext

// React error boundary
export const SentryErrorBoundary = Sentry.ErrorBoundary