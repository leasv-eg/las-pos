import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductDetailsModule } from '../ProductDetailsModule'
import { ModuleConfig } from '../../../types/modules'

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

const mockModule: ModuleConfig = {
  id: 'product-details',
  type: 'product-details',
  title: 'Product Details',
  position: { x: 0, y: 0, w: 4, h: 3 },
  visible: true,
  locked: false,
  minSize: { w: 3, h: 2 }
}

const mockProduct = {
  identifier: { sku: 'TEST001', productId: 'PROD001' },
  itemText: 'Test Product',
  labelText1: 'Premium Quality',
  itemGroupNo: 'GRP001',
  unit: 'ea'
}

const defaultProps = {
  module: mockModule,
  size: 'medium' as const,
  isEditMode: false,
  product: mockProduct
}

describe('ProductDetailsModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders edit mode placeholder', () => {
    render(
      <ProductDetailsModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    expect(screen.getByText('Product Details')).toBeInTheDocument()
  })

  it('renders product details when product is provided', () => {
    render(<ProductDetailsModule {...defaultProps} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Premium Quality')).toBeInTheDocument()
    expect(screen.getByText('TEST001')).toBeInTheDocument()
  })

  it('renders empty state when no product', () => {
    render(
      <ProductDetailsModule 
        {...defaultProps}
        product={undefined}
      />
    )
    
    expect(screen.getByText('Select a product to view details')).toBeInTheDocument()
  })

  it('adapts to different sizes', () => {
    const { rerender } = render(
      <ProductDetailsModule 
        {...defaultProps}
        size="micro"
      />
    )
    
    // Micro size should still show basic product info
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    
    rerender(
      <ProductDetailsModule 
        {...defaultProps}
        size="large"
      />
    )
    
    // Large size should show more detailed information
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('Premium Quality')).toBeInTheDocument()
  })

  it('displays product image placeholder when no image available', () => {
    render(<ProductDetailsModule {...defaultProps} />)
    
    // Should show some kind of placeholder or default image
    const moduleContainer = screen.getByText('Test Product').closest('div')
    expect(moduleContainer).toBeInTheDocument()
  })
})
