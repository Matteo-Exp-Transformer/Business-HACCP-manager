/**
 * Test per il componente CollapsibleCard
 * Verifica il comportamento di apertura/chiusura e rendering
 */

import { render, screen, fireEvent } from '@testing-library/react'
import CollapsibleCard from '../components/CollapsibleCard'
import { Thermometer } from 'lucide-react'

test('renders with title and icon', () => {
  render(
    <CollapsibleCard 
      title="Test Card" 
      subtitle="Test Subtitle"
      icon={Thermometer}
    />
  )
  
  expect(screen.getByText('Test Card')).toBeInTheDocument()
  expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
})

test('toggles content visibility', () => {
  render(
    <CollapsibleCard title="Test Card">
      <div data-testid="content">Test Content</div>
    </CollapsibleCard>
  )
  
  // Contenuto inizialmente non visibile (collapsed)
  expect(screen.queryByTestId('content')).not.toBeVisible()
  
  // Clicca per espandere
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByTestId('content')).toBeVisible()
  
  // Clicca per chiudere
  fireEvent.click(screen.getByRole('button'))
  expect(screen.queryByTestId('content')).not.toBeVisible()
})

test('shows count badge when provided', () => {
  render(
    <CollapsibleCard 
      title="Test Card" 
      count={5}
    />
  )
  
  expect(screen.getByText('5')).toBeInTheDocument()
})

test('calls onToggle callback when toggled', () => {
  const onToggle = jest.fn()
  
  render(
    <CollapsibleCard 
      title="Test Card" 
      onToggle={onToggle}
    />
  )
  
  fireEvent.click(screen.getByRole('button'))
  expect(onToggle).toHaveBeenCalledWith(true)
  
  fireEvent.click(screen.getByRole('button'))
  expect(onToggle).toHaveBeenCalledWith(false)
})

test('renders with custom testId', () => {
  render(
    <CollapsibleCard 
      title="Test Card" 
      testId="custom-test"
    >
      <div data-testid="content">Test Content</div>
    </CollapsibleCard>
  )
  
  expect(screen.getByTestId('custom-test-header')).toBeInTheDocument()
  expect(screen.getByTestId('custom-test-content')).toBeInTheDocument()
})

test('defaults to collapsed state', () => {
  render(
    <CollapsibleCard title="Test Card">
      <div data-testid="content">Test Content</div>
    </CollapsibleCard>
  )
  
  expect(screen.queryByTestId('content')).not.toBeVisible()
})

test('can be expanded by default', () => {
  render(
    <CollapsibleCard title="Test Card" defaultExpanded={true}>
      <div data-testid="content">Test Content</div>
    </CollapsibleCard>
  )
  
  expect(screen.getByTestId('content')).toBeVisible()
})
