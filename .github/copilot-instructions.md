# LAS POS Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Progressive Web App (PWA) for a Point of Sale (POS) system called LAS POS. The application follows these key principles:

## Architecture Guidelines
- **API-First Design**: All functionality must be accessible via RESTful APIs
- **Multi-Tenant**: Support for Company -> Store Concept -> Store -> Device -> User hierarchy
- **Offline-First**: Must work offline using IndexedDB with 100,000+ transaction capacity
- **PWA**: Progressive Web App with service worker and offline capabilities
- **Responsive**: Support Windows PCs, iPads, and Android tablets

## UI Structure
The main interface has three panels:
1. **Basket Panel (Left)**: Shows current transaction items
2. **Action Pad (Center)**: Keypad mode and search mode
3. **Insight Engine (Right)**: Context-aware recommendations and information

## Technology Stack
- React with TypeScript
- Vite for build tooling
- IndexedDB for offline storage
- Service Workers for PWA functionality
- Responsive CSS/Styled Components

## Security & Data
- Multi-tenant data isolation
- Role-based access control (RBAC)
- Secure authentication (future: Azure AD integration)
- PCI-compliant payment processing

## Key Features
- Offline transaction processing
- Real-time inventory management
- Customer loyalty integration
- Promotions and discount engine
- Training/sandbox mode

When generating code, prioritize:
- Offline-first functionality
- Touch-friendly interfaces
- Fast performance
- Data security and isolation
- API-first architecture
