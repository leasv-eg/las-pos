import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SearchModule } from '../SearchModule'
import { ModuleConfig } from '../../../types/modules'
import { NotificationProvider } from '../../NotificationProvider'

// Mock the itemService
vi.mock('../../../services/itemService')

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

// Wrapper component with NotificationProvider
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
)

const mockModule: ModuleConfig = {
  id: 'search',
  type: 'search',
  title: 'Search',
  position: { x: 0, y: 0, w: 4, h: 2 },
  visible: true,
  locked: false,
  minSize: { w: 2, h: 1 }
}

const defaultProps = {
  module: mockModule,
  size: 'medium' as const,
  isEditMode: false,
  onProductSelect: vi.fn(),
  onProductAdd: vi.fn()
}

describe('SearchModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders edit mode correctly', () => {
    render(
      <Wrapper>
        <SearchModule 
          {...defaultProps}
          isEditMode={true}
        />
      </Wrapper>
    )
    
    // In edit mode, the input should be disabled
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    expect(screen.getByText('Start typing to search for products')).toBeInTheDocument()
  })

  it('renders search input in normal mode', () => {
    render(
      <Wrapper>
        <SearchModule {...defaultProps} />
      </Wrapper>
    )
    
    // The component should render without crashing
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
