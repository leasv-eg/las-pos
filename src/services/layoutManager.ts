// Layout management service for persisting and managing modular layouts

import { LayoutProfile, ModuleConfig, LAYOUT_TEMPLATES, generateModuleId } from '../types/modules';

const STORAGE_KEY = 'las-pos-layouts';
const ACTIVE_LAYOUT_KEY = 'las-pos-active-layout';

export class LayoutManager {
  private static instance: LayoutManager;
  
  static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  // Get device ID (simple implementation for now)
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('las-pos-device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('las-pos-device-id', deviceId);
    }
    return deviceId;
  }

  // Save layouts to localStorage
  private saveLayouts(layouts: LayoutProfile[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
    } catch (error) {
      console.error('Failed to save layouts:', error);
    }
  }

  // Load layouts from localStorage
  private loadLayouts(): LayoutProfile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const layouts = JSON.parse(stored);
        // Convert date strings back to Date objects
        return layouts.map((layout: any) => ({
          ...layout,
          createdAt: new Date(layout.createdAt),
          updatedAt: new Date(layout.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load layouts:', error);
    }
    return [];
  }

  // Initialize with default layouts if none exist
  initializeLayouts(): LayoutProfile[] {
    const existingLayouts = this.loadLayouts();
    
    if (existingLayouts.length === 0) {
      const deviceId = this.getDeviceId();
      const defaultLayouts: LayoutProfile[] = LAYOUT_TEMPLATES.map((template, index) => ({
        id: `layout-${Date.now()}-${index}`,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: index === 0, // First template is default
        deviceId
      }));
      
      this.saveLayouts(defaultLayouts);
      return defaultLayouts;
    }
    
    return existingLayouts;
  }

  // Get all layouts for current device
  getLayouts(): LayoutProfile[] {
    const layouts = this.loadLayouts();
    const deviceId = this.getDeviceId();
    return layouts.filter(layout => layout.deviceId === deviceId);
  }

  // Get layout by ID
  getLayout(id: string): LayoutProfile | null {
    const layouts = this.getLayouts();
    return layouts.find(layout => layout.id === id) || null;
  }

  // Save a new layout
  saveLayout(layout: Omit<LayoutProfile, 'id' | 'createdAt' | 'updatedAt' | 'deviceId'>): LayoutProfile {
    const layouts = this.loadLayouts();
    const deviceId = this.getDeviceId();
    
    const newLayout: LayoutProfile = {
      ...layout,
      id: `layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      deviceId
    };
    
    layouts.push(newLayout);
    this.saveLayouts(layouts);
    
    return newLayout;
  }

  // Update existing layout
  updateLayout(id: string, updates: Partial<LayoutProfile>): LayoutProfile | null {
    const layouts = this.loadLayouts();
    const layoutIndex = layouts.findIndex(layout => layout.id === id);
    
    if (layoutIndex === -1) {
      return null;
    }
    
    layouts[layoutIndex] = {
      ...layouts[layoutIndex],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveLayouts(layouts);
    return layouts[layoutIndex];
  }

  // Delete layout
  deleteLayout(id: string): boolean {
    const layouts = this.loadLayouts();
    const filteredLayouts = layouts.filter(layout => layout.id !== id);
    
    if (filteredLayouts.length < layouts.length) {
      this.saveLayouts(filteredLayouts);
      
      // If deleted layout was active, switch to default
      const activeLayoutId = this.getActiveLayoutId();
      if (activeLayoutId === id) {
        const deviceLayouts = filteredLayouts.filter(layout => layout.deviceId === this.getDeviceId());
        const defaultLayout = deviceLayouts.find(layout => layout.isDefault) || deviceLayouts[0];
        if (defaultLayout) {
          this.setActiveLayout(defaultLayout.id);
        }
      }
      
      return true;
    }
    
    return false;
  }

  // Get active layout ID
  getActiveLayoutId(): string | null {
    return localStorage.getItem(ACTIVE_LAYOUT_KEY);
  }

  // Set active layout
  setActiveLayout(layoutId: string): boolean {
    const layout = this.getLayout(layoutId);
    if (layout) {
      localStorage.setItem(ACTIVE_LAYOUT_KEY, layoutId);
      return true;
    }
    return false;
  }

  // Get current active layout
  getActiveLayout(): LayoutProfile | null {
    const activeId = this.getActiveLayoutId();
    if (activeId) {
      return this.getLayout(activeId);
    }
    
    // If no active layout, use default
    const layouts = this.getLayouts();
    const defaultLayout = layouts.find(layout => layout.isDefault) || layouts[0];
    if (defaultLayout) {
      this.setActiveLayout(defaultLayout.id);
      return defaultLayout;
    }
    
    return null;
  }

  // Duplicate layout
  duplicateLayout(id: string, newName?: string): LayoutProfile | null {
    const sourceLayout = this.getLayout(id);
    if (!sourceLayout) {
      return null;
    }
    
    const duplicatedLayout = {
      name: newName || `${sourceLayout.name} (Copy)`,
      description: sourceLayout.description,
      modules: sourceLayout.modules.map(module => ({
        ...module,
        id: generateModuleId(module.type)
      }))
    };
    
    return this.saveLayout(duplicatedLayout);
  }

  // Export layout for sharing
  exportLayout(id: string): string | null {
    const layout = this.getLayout(id);
    if (!layout) {
      return null;
    }
    
    const exportData = {
      name: layout.name,
      description: layout.description,
      modules: layout.modules,
      exportedAt: new Date(),
      version: '1.0'
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import layout from exported data
  importLayout(exportedData: string): LayoutProfile | null {
    try {
      const data = JSON.parse(exportedData);
      
      if (!data.modules || !Array.isArray(data.modules)) {
        throw new Error('Invalid layout data');
      }
      
      const importedLayout = {
        name: `${data.name || 'Imported Layout'} (Imported)`,
        description: data.description,
        modules: data.modules.map((module: any) => ({
          ...module,
          id: generateModuleId(module.type) // Generate new IDs
        }))
      };
      
      return this.saveLayout(importedLayout);
    } catch (error) {
      console.error('Failed to import layout:', error);
      return null;
    }
  }

  // Update module in active layout
  updateModuleInActiveLayout(moduleId: string, updates: Partial<ModuleConfig>): boolean {
    const activeLayout = this.getActiveLayout();
    if (!activeLayout) {
      return false;
    }
    
    const updatedModules = activeLayout.modules.map(module =>
      module.id === moduleId ? { ...module, ...updates } : module
    );
    
    const updatedLayout = this.updateLayout(activeLayout.id, {
      modules: updatedModules
    });
    
    return updatedLayout !== null;
  }

  // Add module to active layout
  addModuleToActiveLayout(module: Omit<ModuleConfig, 'id'>): boolean {
    const activeLayout = this.getActiveLayout();
    if (!activeLayout) {
      return false;
    }
    
    const newModule: ModuleConfig = {
      ...module,
      id: generateModuleId(module.type)
    };
    
    const updatedLayout = this.updateLayout(activeLayout.id, {
      modules: [...activeLayout.modules, newModule]
    });
    
    return updatedLayout !== null;
  }

  // Remove module from active layout
  removeModuleFromActiveLayout(moduleId: string): boolean {
    const activeLayout = this.getActiveLayout();
    if (!activeLayout) {
      return false;
    }
    
    const filteredModules = activeLayout.modules.filter(module => module.id !== moduleId);
    
    const updatedLayout = this.updateLayout(activeLayout.id, {
      modules: filteredModules
    });
    
    return updatedLayout !== null;
  }
}

export const layoutManager = LayoutManager.getInstance();
