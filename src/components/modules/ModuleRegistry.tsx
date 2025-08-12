// Module registry for the modular POS system
import { ModuleConfig, ModuleSize, getModuleSize } from '../../types/modules';
import { SearchModule } from './SearchModule';
import { KeypadModule } from './KeypadModule';
import { BasketItemsModule } from './BasketItemsModule';
import { BasketSummaryModule } from './BasketSummaryModule';
import { ProductDetailsModule } from './ProductDetailsModule';
import { RecommendationsModule } from './RecommendationsModule';
import { QuickActionsModule } from './QuickActionsModule';
import { RecentTransactionsModule } from './RecentTransactionsModule';

// Module component registry
export const moduleRegistry = {
  'search': SearchModule,
  'keypad': KeypadModule,
  'basket-items': BasketItemsModule,
  'basket-summary': BasketSummaryModule,
  'product-details': ProductDetailsModule,
  'recommendations': RecommendationsModule,
  'quick-actions': QuickActionsModule,
  'recent-transactions': RecentTransactionsModule,
};

// Render a module component
export const renderModule = (module: ModuleConfig, isEditMode: boolean) => {
  const size = getModuleSize(module);
  const ModuleComponent = moduleRegistry[module.type];
  
  if (!ModuleComponent) {
    return (
      <div style={{ 
        padding: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#666',
        textAlign: 'center'
      }}>
        <div>
          <div>Unknown module type:</div>
          <div style={{ fontWeight: 'bold', marginTop: '8px' }}>{module.type}</div>
        </div>
      </div>
    );
  }
  
  return (
    <ModuleComponent 
      module={module} 
      size={size} 
      isEditMode={isEditMode}
    />
  );
};
