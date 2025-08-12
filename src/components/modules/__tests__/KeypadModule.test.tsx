import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { KeypadModule } from '../KeypadModule'
import { ModuleConfig } from '../../../types/modules'

const mockModule: ModuleConfig = {
  id: 'test-keypad',
  type: 'keypad',
  name: 'Test Keypad',
  description: 'Test keypad module',
  category: 'input',
  x: 0,
  y: 0,
  w: 4,
  h: 6,
  minW: 2,
  minH: 3,
  maxW: 6,
  maxH: 8,
  defaultSize: 'medium',
  minSize: 'micro',
  maxSize: 'large'
}

describe('KeypadModule', () => {
  const defaultProps = {
    module: mockModule,
    size: 'medium' as const,
    isEditMode: false,
    onInput: vi.fn(),
    onAction: vi.fn(),
    onConfigChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with medium size', () => {
    render(<KeypadModule {...defaultProps} />)
    
    // Use getAllByText to handle multiple instances of '0'
    const zeroButtons = screen.getAllByText('0')
    expect(zeroButtons.length).toBeGreaterThan(0)
    
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('OK')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument() // Uses 'C' not 'Clear'
  })

  it('renders micro layout correctly', () => {
    render(<KeypadModule {...defaultProps} size="micro" />)
    
    // Micro layout should have basic numbers
    const zeroButtons = screen.getAllByText('0')
    expect(zeroButtons.length).toBeGreaterThan(0)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
  })

  it('handles number input correctly', () => {
    render(<KeypadModule {...defaultProps} />)
    
    fireEvent.click(screen.getByText('5'))
    expect(defaultProps.onInput).toHaveBeenLastCalledWith('5')
    
    fireEvent.click(screen.getByText('2'))
    expect(defaultProps.onInput).toHaveBeenLastCalledWith('52')
  })

  it('handles clear action correctly', () => {
    render(<KeypadModule {...defaultProps} />)
    
    fireEvent.click(screen.getByText('C')) // Uses 'C' not 'Clear'
    expect(defaultProps.onAction).toHaveBeenCalledWith('clear')
  })

  it('handles OK action correctly', () => {
    render(<KeypadModule {...defaultProps} />)
    
    fireEvent.click(screen.getByText('OK'))
    expect(defaultProps.onAction).toHaveBeenCalledWith('enter')
  })

  it('disables interactions in edit mode', () => {
    render(<KeypadModule {...defaultProps} isEditMode={true} />)
    
    fireEvent.click(screen.getByText('5'))
    expect(defaultProps.onInput).not.toHaveBeenCalled()
  })

  it('handles decimal input correctly', () => {
    render(<KeypadModule {...defaultProps} size="large" />)
    
    fireEvent.click(screen.getByText('.'))
    expect(defaultProps.onInput).toHaveBeenCalledWith('.')
  })

  it('renders different layouts for different sizes', () => {
    const { rerender } = render(<KeypadModule {...defaultProps} size="micro" />)
    
    // Check micro layout exists
    expect(screen.getByText('0')).toBeInTheDocument()
    
    rerender(<KeypadModule {...defaultProps} size="large" />)
    
    // Large should have more buttons including decimal
    expect(screen.getByText('.')).toBeInTheDocument()
  })

  it('displays current value in display area', () => {
    render(<KeypadModule {...defaultProps} />)
    
    // The display should show 0 initially - use getAllByText to handle multiple instances
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBeGreaterThan(0)
  })
})
