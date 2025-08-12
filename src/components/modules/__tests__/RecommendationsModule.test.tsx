import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecommendationsModule } from '../RecommendationsModule'
import { ModuleConfig } from '../../../types/modules'

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

const mockModule: ModuleConfig = {
  id: 'recommendations',
  type: 'recommendations',
  title: 'Recommendations',
  position: { x: 0, y: 0, w: 4, h: 3 },
  visible: true,
  locked: false,
  minSize: { w: 3, h: 2 }
}

const mockRecommendations = [
  {
    identifier: { sku: 'REC001', productId: 'REC001' },
    itemText: 'Recommended Product 1',
    labelText1: 'Popular Choice',
    itemGroupNo: 'GRP001',
    unit: 'ea'
  },
  {
    identifier: { sku: 'REC002', productId: 'REC002' },
    itemText: 'Recommended Product 2',
    labelText1: 'Best Value',
    itemGroupNo: 'GRP002',
    unit: 'ea'
  }
]

const defaultProps = {
  module: mockModule,
  size: 'medium' as const,
  isEditMode: false,
  recommendations: mockRecommendations,
  onProductSelect: vi.fn(),
  onProductAdd: vi.fn()
}

describe('RecommendationsModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders edit mode placeholder', () => {
    render(
      <RecommendationsModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    expect(screen.getByText('Recommendations')).toBeInTheDocument()
  })

  it('renders recommendations when provided', () => {
    render(<RecommendationsModule {...defaultProps} />)
    
    expect(screen.getByText('Recommended Product 1')).toBeInTheDocument()
    expect(screen.getByText('Recommended Product 2')).toBeInTheDocument()
    expect(screen.getByText('Popular Choice')).toBeInTheDocument()
    expect(screen.getByText('Best Value')).toBeInTheDocument()
  })

  it('renders empty state when no recommendations', () => {
    render(
      <RecommendationsModule 
        {...defaultProps}
        recommendations={[]}
      />
    )
    
    expect(screen.getByText('No recommendations available')).toBeInTheDocument()
  })

  it('handles product selection', () => {
    render(<RecommendationsModule {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Recommended Product 1'))
    
    expect(defaultProps.onProductSelect).toHaveBeenCalledWith(mockRecommendations[0])
  })

  it('handles product addition', () => {
    render(<RecommendationsModule {...defaultProps} />)
    
    // Look for add buttons or click events that trigger add
    const addButtons = screen.getAllByText('+')
    if (addButtons.length > 0) {
      fireEvent.click(addButtons[0])
      expect(defaultProps.onProductAdd).toHaveBeenCalledWith(mockRecommendations[0])
    }
  })

  it('adapts to different sizes', () => {
    const { rerender } = render(
      <RecommendationsModule 
        {...defaultProps}
        size="micro"
      />
    )
    
    // Micro size should show fewer details
    expect(screen.getByText('Recommended Product 1')).toBeInTheDocument()
    
    rerender(
      <RecommendationsModule 
        {...defaultProps}
        size="large"
      />
    )
    
    // Large size should show more details
    expect(screen.getByText('Recommended Product 1')).toBeInTheDocument()
    expect(screen.getByText('Popular Choice')).toBeInTheDocument()
  })

  it('disables interactions in edit mode', () => {
    render(
      <RecommendationsModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    // In edit mode, clicking should not trigger callbacks
    const placeholder = screen.getByText('Recommendations')
    fireEvent.click(placeholder)
    
    expect(defaultProps.onProductSelect).not.toHaveBeenCalled()
    expect(defaultProps.onProductAdd).not.toHaveBeenCalled()
  })
})
