import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import styled from 'styled-components';
import { LayoutProfile, ModuleConfig } from '../types/modules';
import { layoutManager } from '../services/layoutManager';
import { useNotifications } from './NotificationProvider';
import { renderModule } from './modules/ModuleRegistry';

// CSS imports for react-grid-layout
import 'react-grid-layout/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface ModularGridProps {
  // Future: Add props for custom module renderers
}

const GridContainer = styled.div`
  height: 100vh;
  width: 100%;
  background: #f5f5f5;
  position: relative;
  
  .react-grid-layout {
    position: relative;
  }
  
  .react-grid-item {
    transition: all 200ms ease;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
  }
  
  .react-grid-item.cssTransforms {
    transition-property: transform;
  }
  
  .react-grid-item.resizing {
    z-index: 1;
    will-change: width, height;
  }
  
  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }
  
  .react-grid-item.dropping {
    visibility: hidden;
  }
  
  .react-grid-item.react-grid-placeholder {
    background: #4CAF50;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    user-select: none;
    border-radius: 8px;
  }
  
  /* Edit mode specific styles */
  &.edit-mode {
    .react-grid-item {
      border: 2px dashed #2196F3;
      
      &:hover {
        border-color: #1976D2;
        background: #f3f8ff;
      }
    }
  }
`;

const EditModeToolbar = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ToolbarButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ variant = 'secondary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #2196F3;
          color: white;
          &:hover { background: #1976D2; }
        `;
      case 'danger':
        return `
          background: #f44336;
          color: white;
          &:hover { background: #d32f2f; }
        `;
      default:
        return `
          background: #f5f5f5;
          color: #333;
          &:hover { background: #e0e0e0; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LayoutSelector = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const ModuleWrapper = styled.div<{ isEditMode: boolean }>`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  
  ${({ isEditMode }) => isEditMode && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(33, 150, 243, 0.1);
      z-index: 1;
      pointer-events: none;
    }
  `}
`;

const ModuleHeader = styled.div<{ isEditMode: boolean }>`
  display: ${({ isEditMode }) => isEditMode ? 'flex' : 'none'};
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  z-index: 2;
  position: relative;
`;

const ModuleTitle = styled.span`
  flex: 1;
`;

const ModuleActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ModuleActionButton = styled.button`
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  cursor: pointer;
  background: #e0e0e0;
  color: #666;
  
  &:hover {
    background: #d0d0d0;
  }
`;

const ModuleContent = styled.div<{ hasHeader: boolean }>`
  height: ${({ hasHeader }) => hasHeader ? 'calc(100% - 41px)' : '100%'};
  overflow: auto;
`;

export const ModularGrid: React.FC<ModularGridProps> = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<LayoutProfile | null>(null);
  const [availableLayouts, setAvailableLayouts] = useState<LayoutProfile[]>([]);
  const { showSuccess } = useNotifications();

  // Load layouts on mount
  useEffect(() => {
    const layouts = layoutManager.initializeLayouts();
    setAvailableLayouts(layouts);
    
    const activeLayout = layoutManager.getActiveLayout();
    setCurrentLayout(activeLayout);
  }, []);

  // Convert ModuleConfig to react-grid-layout Layout
  const convertToGridLayout = useCallback((modules: ModuleConfig[]): Layout[] => {
    return modules
      .filter(module => module.visible)
      .map(module => ({
        i: module.id,
        x: module.position.x,
        y: module.position.y,
        w: module.position.w,
        h: module.position.h,
        minW: module.minSize.w,
        minH: module.minSize.h,
        maxW: module.maxSize?.w,
        maxH: module.maxSize?.h,
        static: !isEditMode || module.locked
      }));
  }, [isEditMode]);

  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback((layouts: Layout[]) => {
    if (!isEditMode || !currentLayout) return;

    const updatedModules = currentLayout.modules.map(module => {
      const gridItem = layouts.find(item => item.i === module.id);
      if (gridItem) {
        return {
          ...module,
          position: {
            x: gridItem.x,
            y: gridItem.y,
            w: gridItem.w,
            h: gridItem.h
          }
        };
      }
      return module;
    });

    const updatedLayout = layoutManager.updateLayout(currentLayout.id, {
      modules: updatedModules
    });

    if (updatedLayout) {
      setCurrentLayout(updatedLayout);
    }
  }, [isEditMode, currentLayout]);

  // Switch layouts
  const handleLayoutSwitch = useCallback((layoutId: string) => {
    const layout = layoutManager.getLayout(layoutId);
    if (layout) {
      layoutManager.setActiveLayout(layoutId);
      setCurrentLayout(layout);
      showSuccess('Layout Changed', `Switched to "${layout.name}"`);
    }
  }, [showSuccess]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(!isEditMode);
    showSuccess(
      isEditMode ? 'Edit Mode Off' : 'Edit Mode On',
      isEditMode ? 'Layout is now locked' : 'You can now move and resize modules'
    );
  }, [isEditMode, showSuccess]);

  // Save current layout as new
  const saveAsNewLayout = useCallback(() => {
    if (!currentLayout) return;

    const newName = prompt('Enter name for the new layout:');
    if (newName && newName.trim()) {
      const newLayout = layoutManager.saveLayout({
        name: newName.trim(),
        description: `Custom layout based on ${currentLayout.name}`,
        modules: currentLayout.modules
      });

      setAvailableLayouts(layoutManager.getLayouts());
      layoutManager.setActiveLayout(newLayout.id);
      setCurrentLayout(newLayout);
      showSuccess('Layout Saved', `"${newName}" has been saved`);
    }
  }, [currentLayout, showSuccess]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    if (!currentLayout) return;

    if (confirm('Reset layout to default? This will lose any unsaved changes.')) {
      const layouts = layoutManager.getLayouts();
      const defaultLayout = layouts.find(layout => layout.isDefault);
      if (defaultLayout) {
        handleLayoutSwitch(defaultLayout.id);
      }
    }
  }, [currentLayout, handleLayoutSwitch]);

  // Placeholder module renderer (will be replaced with actual modules)
  const renderModuleContent = useCallback((module: ModuleConfig) => {
    return (
      <ModuleWrapper key={module.id} isEditMode={isEditMode}>
        <ModuleHeader isEditMode={isEditMode}>
          <ModuleTitle>{module.title}</ModuleTitle>
          <ModuleActions>
            <ModuleActionButton onClick={() => console.log('Configure:', module.id)}>
              ⚙️
            </ModuleActionButton>
            <ModuleActionButton onClick={() => console.log('Hide:', module.id)}>
              👁️
            </ModuleActionButton>
            <ModuleActionButton onClick={() => console.log('Remove:', module.id)}>
              ✕
            </ModuleActionButton>
          </ModuleActions>
        </ModuleHeader>
        <ModuleContent hasHeader={isEditMode}>
          {renderModule(module, isEditMode)}
        </ModuleContent>
      </ModuleWrapper>
    );
  }, [isEditMode]);

  if (!currentLayout) {
    return (
      <GridContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading layout...
        </div>
      </GridContainer>
    );
  }

  const gridLayout = convertToGridLayout(currentLayout.modules);

  return (
    <GridContainer className={isEditMode ? 'edit-mode' : ''}>
      <EditModeToolbar>
        <LayoutSelector
          value={currentLayout.id}
          onChange={(e) => handleLayoutSwitch(e.target.value)}
        >
          {availableLayouts.map(layout => (
            <option key={layout.id} value={layout.id}>
              {layout.name}
            </option>
          ))}
        </LayoutSelector>
        
        <ToolbarButton 
          onClick={toggleEditMode}
          variant={isEditMode ? 'danger' : 'primary'}
        >
          {isEditMode ? 'Exit Edit' : 'Edit Layout'}
        </ToolbarButton>
        
        {isEditMode && (
          <>
            <ToolbarButton onClick={saveAsNewLayout}>
              Save As...
            </ToolbarButton>
            <ToolbarButton onClick={resetLayout}>
              Reset
            </ToolbarButton>
          </>
        )}
      </EditModeToolbar>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: gridLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 10, md: 8, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        margin={[8, 8]}
        containerPadding={[16, 16]}
        useCSSTransforms={true}
        autoSize={true}
      >
        {currentLayout.modules
          .filter(module => module.visible)
          .map(module => renderModuleContent(module))}
      </ResponsiveGridLayout>
    </GridContainer>
  );
};
