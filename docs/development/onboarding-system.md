# Onboarding System - HACCP Business Manager

This document describes the onboarding wizard system for initial business setup.

## Overview

The onboarding wizard guides new users through the complete setup of their HACCP management system, ensuring all required data is collected and validated according to food safety regulations.

## Architecture

### Components

#### OnboardingWizard
Main wizard component that orchestrates the multi-step process:
- Form state management with React Hook Form
- Step navigation and validation
- Progress tracking and persistence
- HACCP compliance validation

#### StepNavigator
Navigation component for moving between steps:
- Visual progress indication
- Step completion status
- Access control based on validation
- Mobile-optimized compact version

#### Step Components
Individual step components for each configuration phase:
- BusinessInfoStep: Company information
- DepartmentsStep: Organizational structure
- StaffStep: Personnel management
- ConservationPointsStep: Temperature monitoring setup
- TasksStep: Basic task configuration
- CompletionStep: Final review and submission

### Validation System

#### Zod Schemas
Comprehensive validation schemas for each step:

```javascript
// Business information validation
const businessInfoSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(10).max(200),
  email: z.string().email(),
  employeeCount: z.number().int().min(1).max(1000)
})
```

#### HACCP Compliance
Specialized validation for food safety requirements:
- Temperature range validation for equipment types
- Minimum requirement checks
- Cross-step data consistency
- Regulatory compliance verification

### State Management

#### Zustand Integration
Onboarding state is managed through the main app store:

```javascript
// Onboarding state structure
onboarding: {
  isCompleted: false,
  currentStep: 1,
  stepsCompleted: [],
  formData: {
    business: {},
    departments: {},
    staff: {},
    conservationPoints: {},
    tasks: {}
  }
}
```

#### Persistence
Form data is automatically saved to localStorage:
- Auto-save on form changes (debounced)
- Step completion tracking
- Recovery on page refresh
- Clear on completion

## Step-by-Step Process

### Step 1: Business Information
Collects essential company data:
- **Required**: Name, address, email, employee count
- **Optional**: Phone, VAT number
- **Validation**: Email format, address completeness
- **HACCP**: Business type for regulatory context

### Step 2: Departments
Configures organizational structure:
- **Presets**: Kitchen, Dining Room, Storage, Counter
- **Custom**: User-defined departments
- **Validation**: Minimum 1 department, unique names
- **HACCP**: Responsibility assignment structure

### Step 3: Staff Management
Sets up personnel:
- **Required**: Name, role, department assignment
- **Optional**: Email, HACCP certification
- **Validation**: Minimum 1 staff member, unique emails
- **HACCP**: Certification tracking, role responsibilities

### Step 4: Conservation Points
Configures temperature monitoring:
- **Types**: Room temperature, refrigerator, freezer, blast chiller
- **Required**: Name, temperature range, department, product categories
- **Validation**: Minimum 1 point, valid temperature ranges
- **HACCP**: Critical control points setup

### Step 5: Basic Tasks
Creates initial task structure:
- **Types**: Maintenance, cleaning, general, temperature
- **Required**: Name, frequency, assignment
- **Validation**: Minimum 1 task
- **HACCP**: Compliance task framework

### Step 6: Completion
Final review and system activation:
- Summary of all configured data
- Final compliance validation
- System initialization
- Redirect to main application

## Form Management

### React Hook Form Integration
Professional form handling with:
- Real-time validation
- Error state management
- Optimistic updates
- Accessibility support

### Field Components
Specialized form fields for HACCP data:
- InputField: Text inputs with validation
- SelectField: Dropdowns with options
- CheckboxField: Boolean selections
- TextareaField: Multi-line text
- Custom fields for HACCP-specific data

### Validation Flow
Multi-layer validation system:
1. **Field-level**: Real-time input validation
2. **Step-level**: Complete step validation
3. **Cross-step**: Data consistency checks
4. **HACCP**: Compliance requirement validation
5. **Final**: Complete system validation

## HACCP Compliance Features

### Temperature Validation
Automatic validation of temperature ranges:
- Room temperature: 15°C - 25°C
- Refrigerator: 0°C - 9°C
- Freezer: -25°C - -15°C
- Blast chiller: -50°C - -10°C

### Minimum Requirements
Ensures regulatory compliance:
- At least 1 department (organizational structure)
- At least 1 staff member (responsibility assignment)
- At least 1 conservation point (critical control point)
- At least 1 task (monitoring procedure)

### Audit Trail
Complete tracking of setup process:
- Step completion timestamps
- Data change history
- Validation results
- User actions

## Error Handling

### Validation Errors
Comprehensive error handling:
- Field-level error display
- Step-level error summary
- Cross-validation errors
- HACCP compliance errors

### Recovery Mechanisms
Robust error recovery:
- Form state persistence
- Automatic retry logic
- Graceful degradation
- User guidance

### User Feedback
Clear communication:
- Real-time validation feedback
- Progress indicators
- Success confirmations
- Error explanations

## Mobile Optimization

### Responsive Design
Mobile-first approach:
- Touch-friendly controls
- Optimized form layouts
- Compact navigation
- Safe area support

### Performance
Optimized for mobile devices:
- Lazy loading of step components
- Efficient form state management
- Minimal re-renders
- Fast navigation

## Testing Strategy

### Unit Tests
Component and utility testing:
- Form validation logic
- Step navigation
- State management
- HACCP compliance rules

### Integration Tests
End-to-end workflow testing:
- Complete onboarding flow
- Error scenarios
- Data persistence
- Cross-step validation

### Accessibility Tests
Ensuring inclusive design:
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels

## Usage Examples

### Basic Implementation
```javascript
import { OnboardingWizard } from './features/onboarding'

function App() {
  return (
    <div>
      <OnboardingWizard />
    </div>
  )
}
```

### Custom Step Handling
```javascript
import { useOnboardingProgress } from './features/onboarding'

function CustomOnboarding() {
  const { 
    currentStep, 
    completeStep, 
    goToNextStep,
    validateStep 
  } = useOnboardingProgress()

  const handleStepSubmit = async (data) => {
    const success = await completeStep(currentStep, data)
    if (success) {
      goToNextStep(currentStep)
    }
  }

  return (
    // Custom implementation
  )
}
```

### Validation Integration
```javascript
import { businessInfoSchema } from './features/onboarding'

const validateBusinessData = async (data) => {
  try {
    await businessInfoSchema.parseAsync(data)
    return { valid: true }
  } catch (error) {
    return { valid: false, errors: error.errors }
  }
}
```

## Configuration

### Environment Variables
No additional environment variables required for onboarding.

### Customization
The onboarding system can be customized:
- Step order and content
- Validation rules
- HACCP requirements
- UI styling and branding

### Localization
Ready for internationalization:
- All text externalized
- Validation messages
- Error handling
- Date/number formatting

This comprehensive onboarding system ensures proper HACCP setup while providing an excellent user experience across all devices.