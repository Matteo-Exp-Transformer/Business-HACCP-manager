/**
 * UI Components Index - HACCP Design System
 * 
 * Central export point for all UI components
 */

// Base components
export { Button } from './Button'
export { Input } from './Input'
export { Select, SelectOption } from './Select'
export { Checkbox, CheckboxWithLabel } from './Checkbox'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
export { default as LoadingSpinner } from './LoadingSpinner'

// Complex components
export { default as Modal, ModalFooter, ConfirmModal } from './Modal'
export { default as showToast, ToastProvider } from './Toast'

// Layout components
export { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  ListSkeleton, 
  TextSkeleton, 
  AvatarSkeleton, 
  ButtonSkeleton,
  ConservationPointSkeleton,
  TaskSkeleton
} from './Skeleton'

export { 
  Badge, 
  StatusBadge, 
  ComplianceBadge, 
  TemperatureBadge 
} from './Badge'

// Re-export existing components for backwards compatibility
export { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'
export { Label } from './Label'

// Export types for TypeScript (when we migrate)
export type { ButtonProps, InputProps, CardProps, ModalProps } from './types'