# Yield Delta Frontend Development Guide for Claude

> **Specialized Agent Ecosystem** - Complete reference for developing Yield Delta Protocol frontend

## 📋 Project Overview

| Property            | Value                         |
| ------------------- | ----------------------------- |
| **Project Type**    | Next.js 14 Frontend App      |
| **Package Manager** | `npm` / `yarn` / `bun`        |
| **Framework**       | Next.js with TypeScript      |
| **Styling**         | Tailwind CSS                  |
| **Architecture**    | DeFi Protocol Frontend        |

## 🤖 Specialized Agent Registry

The following specialized agents are available for this project:

### Core Development Agents

#### **css-debug-specialist** 
- **Purpose**: Debug CSS layout issues, analyze styling problems, identify conflicting rules, and solve responsive design problems
- **Specializes in**: CSS debugging, Tailwind CSS troubleshooting, cross-browser compatibility issues
- **Use when**: Layout issues, responsive design problems, styling conflicts, CSS specificity problems

#### **frontend-developer**
- **Purpose**: React component implementation, TypeScript development, Next.js features, and modern web development practices
- **Specializes in**: Implementing UI designs, managing state, integrating APIs, React patterns
- **Use when**: Building components, implementing features, TypeScript development, API integration

#### **ui-design-specialist**
- **Purpose**: UI/UX design implementation, design system creation, accessibility improvements, and visual design
- **Specializes in**: Component design, user experience optimization, design system consistency
- **Use when**: Design implementation, accessibility improvements, visual design work, component styling

### Backend & Infrastructure Agents

#### **backend-developer**
- **Purpose**: API design, database integration, server-side logic, authentication, and performance optimization
- **Specializes in**: Node.js, Python, modern backend architectures, API development
- **Use when**: API development, server-side logic, database work, authentication systems

#### **smart-contract-developer**
- **Purpose**: Smart contract development, blockchain integration, DeFi protocol implementation
- **Specializes in**: Solidity, smart contract security, DeFi patterns, blockchain integration
- **Use when**: Contract development, blockchain integration, DeFi functionality, security audits

#### **devops-engineer**
- **Purpose**: Deployment automation, CI/CD pipelines, infrastructure management, monitoring
- **Specializes in**: Docker, cloud deployment, monitoring, performance optimization
- **Use when**: Deployment issues, CI/CD setup, infrastructure problems, performance monitoring

### AI & ML Agent

#### **ai-ml-specialist**
- **Purpose**: AI model integration, machine learning implementations, data analysis, predictive features
- **Specializes in**: AI/ML integration, data processing, predictive analytics, model optimization
- **Use when**: AI feature implementation, data analysis, machine learning integration, predictive modeling

## 🎯 Agent Usage Guidelines

### When to Use Specific Agents

#### CSS & Styling Issues
```bash
# Use css-debug-specialist for:
- Layout problems not displaying correctly
- Responsive design breaking on certain devices  
- Tailwind CSS classes not working as expected
- CSS specificity and inheritance issues
- Cross-browser compatibility problems
```

#### Component Development
```bash
# Use frontend-developer for:
- Building React components
- TypeScript implementation
- Next.js specific features (App Router, SSR, etc.)
- State management integration
- API integration and data fetching
```

#### Design Implementation
```bash
# Use ui-design-specialist for:
- Converting designs to components
- Improving accessibility
- Design system consistency
- Visual design improvements
- User experience optimization
```

#### Backend Integration
```bash
# Use backend-developer for:
- API endpoint development
- Database schema design
- Authentication implementation
- Server-side logic
- Performance optimization
```

#### Smart Contract Integration
```bash
# Use smart-contract-developer for:
- DeFi protocol integration
- Smart contract interaction
- Blockchain connectivity
- Web3 wallet integration
- Security considerations
```

## 🚀 Agent Collaboration Patterns

### Multi-Agent Workflows

#### **Full-Stack Feature Development**
1. **ui-design-specialist**: Design the component interface
2. **frontend-developer**: Implement the React component
3. **backend-developer**: Create necessary API endpoints
4. **smart-contract-developer**: Handle blockchain interactions
5. **css-debug-specialist**: Resolve any styling issues

#### **Bug Resolution Workflow**
1. **css-debug-specialist**: If it's a styling/layout issue
2. **frontend-developer**: If it's a component logic issue
3. **backend-developer**: If it's an API/server issue
4. **devops-engineer**: If it's a deployment/infrastructure issue

#### **Performance Optimization**
1. **frontend-developer**: Component optimization, code splitting
2. **backend-developer**: API performance, caching
3. **devops-engineer**: Infrastructure scaling, monitoring
4. **css-debug-specialist**: CSS performance, unused styles

## 🔧 Project-Specific Context

### Key Technologies
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **Type Safety**: TypeScript with strict mode
- **Blockchain**: SEI Network integration
- **DeFi**: Yield optimization protocols
- **AI**: ElizaOS integration for intelligent features

### Important Files & Directories
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   └── sections/       # Page sections
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── stores/             # State management
└── types/              # TypeScript type definitions
```

### Key Features
- **Vault Management**: DeFi vault interactions
- **AI Optimization**: ElizaOS-powered features
- **Real-time Data**: Market data integration
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance focus

## 📋 Agent Selection Quick Reference

| Task Type | Primary Agent | Secondary Agent |
|-----------|--------------|-----------------|
| Layout Issues | css-debug-specialist | frontend-developer |
| Component Building | frontend-developer | ui-design-specialist |
| API Integration | frontend-developer | backend-developer |
| Design Implementation | ui-design-specialist | frontend-developer |
| DeFi Features | smart-contract-developer | frontend-developer |
| Performance Issues | frontend-developer | devops-engineer |
| Accessibility | ui-design-specialist | frontend-developer |
| Blockchain Integration | smart-contract-developer | backend-developer |

## 🎯 Best Practices

### Agent Communication
- Always specify which aspect of the project you're working on
- Provide context about the current state of the feature
- Include relevant file paths and component names
- Mention any constraints or requirements

### Collaboration Efficiency  
- Use the most specialized agent for the primary task
- Involve secondary agents for complementary expertise
- Consider the full workflow when planning multi-agent tasks
- Document decisions and handoffs between agents

---

**🚀 Ready to collaborate!** Use the appropriate specialized agent based on your current development needs.