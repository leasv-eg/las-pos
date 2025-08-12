import React, { useState } from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';

interface KeypadModuleProps extends ModuleProps {
  onInput?: (value: string) => void;
  onAction?: (action: string) => void;
}

const ModuleContainer = styled.div<{ size: ModuleSize }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
`;

const Display = styled.div<{ size: ModuleSize }>`
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px 8px';
      case 'small': return '8px 12px';
      case 'medium': return '12px 16px';
      case 'large': return '16px 20px';
      default: return '12px 16px';
    }
  }};
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
  text-align: right;
  font-family: 'Courier New', monospace;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '12px';
      case 'small': return '16px';
      case 'medium': return '20px';
      case 'large': return '24px';
      default: return '20px';
    }
  }};
  font-weight: bold;
  color: #333;
  min-height: ${({ size }) => {
    switch (size) {
      case 'micro': return '20px';
      case 'small': return '30px';
      case 'medium': return '40px';
      case 'large': return '50px';
      default: return '40px';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const KeypadGrid = styled.div<{ size: ModuleSize }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  flex: 1;
`;

const KeypadButton = styled.button<{ 
  size: ModuleSize; 
  isWide?: boolean; 
  isAction?: boolean;
}>`
  height: ${({ size }) => {
    switch (size) {
      case 'micro': return '25px';
      case 'small': return '35px';
      case 'medium': return '45px';
      case 'large': return '55px';
      default: return '45px';
    }
  }};
  border: 2px solid #e0e0e0;
  background: ${props => props.isAction ? '#1976d2' : 'white'};
  color: ${props => props.isAction ? 'white' : '#333'};
  border-radius: 6px;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '18px';
      default: return '16px';
    }
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  grid-column: ${props => props.isWide ? 'span 2' : 'span 1'};
  
  &:hover {
    background: ${props => props.isAction ? '#1565c0' : '#f5f5f5'};
    border-color: ${props => props.isAction ? '#1565c0' : '#1976d2'};
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const KeypadModule: React.FC<KeypadModuleProps> = ({
  module,
  size,
  isEditMode,
  onInput,
  onAction
}) => {
  const [display, setDisplay] = useState('0');

  const handleButtonClick = (value: string) => {
    if (isEditMode) return;

    if (value === 'C') {
      setDisplay('0');
      onAction?.('clear');
    } else if (value === '⌫') {
      setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      onAction?.('backspace');
    } else if (value === 'OK') {
      onAction?.('enter');
      onInput?.(display);
    } else {
      setDisplay(prev => prev === '0' ? value : prev + value);
      onInput?.(display === '0' ? value : display + value);
    }
  };

  const getButtons = () => {
    switch (size) {
      case 'micro':
        return [
          ['1', '2', '3'],
          ['4', '5', '6'], 
          ['7', '8', '9'],
          ['C', '0', 'OK']
        ];
      case 'small':
        return [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['C', '0', '⌫'],
          ['OK', 'OK', 'OK'] // OK spans 3 columns
        ];
      default:
        return [
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['.', '0', '⌫'],
          ['C', 'QTY', 'OK']
        ];
    }
  };

  const buttons = getButtons();

  return (
    <ModuleContainer size={size}>
      {size !== 'micro' && (
        <Display size={size}>
          {display}
        </Display>
      )}
      
      <KeypadGrid size={size}>
        {buttons.flat().map((button, index) => {
          if (button === 'OK' && size === 'small' && index % 3 !== 0) {
            return null; // Skip duplicate OK buttons for spanning
          }
          
          const isWide = button === 'OK' && size === 'small';
          const isAction = ['C', '⌫', 'OK', 'QTY'].includes(button);
          
          return (
            <KeypadButton
              key={`${button}-${index}`}
              size={size}
              isWide={isWide}
              isAction={isAction}
              onClick={() => handleButtonClick(button)}
              disabled={isEditMode}
            >
              {button}
            </KeypadButton>
          );
        })}
      </KeypadGrid>
    </ModuleContainer>
  );
};
