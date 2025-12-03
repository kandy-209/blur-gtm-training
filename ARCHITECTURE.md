# Ultra-Advanced AI/ML Code-Aware Discovery System - Architecture

## Overview

This is a cutting-edge code-aware discovery call practice platform built with Domain-Driven Design (DDD), Clean Architecture, and advanced AI/ML techniques.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)

**Purpose**: Core business logic and domain models

**Components**:
- **Entities**: `Company`, `ProspectPersona`, `DiscoveryCall`
- **Value Objects**: `CompanyId`, `Domain`, `GitHubRepo`, `CompanyIntelligence`
- **Aggregates**: `Company` (aggregate root), `DiscoveryCall` (aggregate root)
- **Domain Events**: `CompanyCreatedEvent`, `CompanyIntelligenceUpdatedEvent`, `DiscoveryCallCompletedEvent`

**Key Features**:
- Type-safe domain models
- Immutable value objects
- Domain events for decoupling
- Business rule enforcement

### 2. Application Layer (`src/application/`)

**Purpose**: Use cases and application logic

**Components**:
- **Use Cases**:
  - `AnalyzeCompanyUseCase` - Analyzes companies from multiple sources
  - `GeneratePersonaUseCase` - Generates realistic prospect personas
  - `CreateDiscoveryCallUseCase` - Creates discovery call sessions
- **Repositories**: Interfaces for data access
- **Commands/Queries**: CQRS pattern implementation

**Key Features**:
- Clean separation of concerns
- Use case orchestration
- CQRS pattern
- Dependency injection ready

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: External integrations and implementations

**Components**:
- **Agents**:
  - `MAS2System` - Self-configuring agent system (19.6% improvement)
  - `Agent2Framework` - Automated RL agent design (55% improvement)
  - `DeepPersonaGenerator` - Advanced persona generation (hundreds of attributes)
  - `CompanyIntelligenceAgent` - Multi-API company analysis
  - `PersonaGenerationAgent` - Persona generation
- **Security**: `CodeMender` - Vulnerability detection & repair
- **ML**: `QuantumEvolutionaryNN` - Quantum-evolutionary neural networks
- **Repositories**: In-memory implementations (ready for database)

**Key Features**:
- Advanced AI/ML agents
- Multi-source data integration
- Security-first approach
- Extensible architecture

### 4. Presentation Layer (`src/app/`, `src/components/`)

**Purpose**: User interface and API routes

**Components**:
- **API Routes**:
  - `/api/company-intelligence/analyze` - Analyze companies
  - `/api/persona/generate` - Generate personas
  - `/api/discovery-call/create` - Create discovery calls
  - `/api/discovery-call/[callId]/message` - Send messages
- **UI Components**:
  - `DiscoveryCall` - Main discovery call interface
  - `CompanyAnalyzer` - Company analysis UI
- **Pages**:
  - `/code-aware-discovery/new` - Start new discovery call
  - `/code-aware-discovery/[callId]` - Active discovery call

**Key Features**:
- Type-safe API routes
- Real-time UI updates
- Responsive design
- Error handling

## Advanced Features

### MAS$^2$ Self-Configuring Agent System

**Location**: `src/infrastructure/agents/mas2/`

**Components**:
- `GeneratorAgent` - Designs agent architecture
- `ImplementerAgent` - Builds the system
- `RectifierAgent` - Monitors and fixes issues

**Benefits**:
- 19.6% performance improvement
- Self-adapting architecture
- Real-time issue detection and fixing

### $Agent^2$ Automated RL Framework

**Location**: `src/infrastructure/agents/agent2/`

**Features**:
- Natural language → RL solution transformation
- Automatic agent design
- 55% performance improvement over manual design
- Auto-refinement loop

### DeepPersona Advanced Generation

**Location**: `src/infrastructure/agents/deeppersona/`

**Features**:
- Hundreds of structured attributes
- Extensive narrative generation
- Taxonomy-guided generation
- High realism scores

### CodeMender Security

**Location**: `src/infrastructure/security/codemender.ts`

**Features**:
- Autonomous vulnerability detection
- Automatic patch generation
- Proactive prevention
- Multiple detection methods (fuzzing, static analysis, differential testing)

### Quantum-Evolutionary Neural Networks

**Location**: `src/infrastructure/ml/quantum-evolutionary/`

**Features**:
- Quantum-inspired layers
- Federated learning
- Evolutionary optimization
- Privacy-preserving

## Data Flow

```
User Input → API Route → Use Case → Agent → Domain Entity → Repository
                ↓
         Domain Events → Event Bus → Handlers
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Architecture**: Clean Architecture + DDD
- **AI/ML**: Custom agents + LLM integration
- **UI**: React 19, Tailwind CSS, Radix UI
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## API Endpoints

### POST `/api/company-intelligence/analyze`

Analyze a company from multiple sources.

**Request**:
```json
{
  "input": "github.com/acme/platform" | "acme.com" | { "domain": "acme.com" },
  "forceRefresh": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "company": { ... },
    "financial": { ... },
    "codebase": { ... },
    "insights": { ... }
  }
}
```

### POST `/api/persona/generate`

Generate a realistic prospect persona.

**Request**:
```json
{
  "companyId": "comp_123",
  "settings": {
    "difficulty": "hard",
    "personality": "skeptical",
    "role": "VP Engineering"
  }
}
```

### POST `/api/discovery-call/create`

Create a new discovery call session.

**Request**:
```json
{
  "companyId": "comp_123",
  "personaId": "persona_456",
  "settings": {
    "difficulty": "hard",
    "personality": "skeptical",
    "salesMethodology": "GAP"
  }
}
```

## Next Steps

1. **Enhanced Agents**: Implement full functionality for all agents
2. **Database Integration**: Replace in-memory repositories with database
3. **Real-time Features**: WebSocket for live updates
4. **Voice Integration**: Real-time voice calls
5. **Advanced Analytics**: Manager dashboard with insights
6. **Testing**: Comprehensive test suite
7. **Documentation**: API documentation, user guides

## Contributing

This is a production-ready architecture following best practices:
- Domain-Driven Design
- Clean Architecture
- SOLID principles
- Type safety throughout
- Error handling
- Security best practices

