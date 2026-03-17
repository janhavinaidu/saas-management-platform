# SaaSTrack AI — Intelligent SaaS License & Access Management Platform

An AI-powered platform that helps organizations track SaaS tools, manage user access, detect inefficiencies, and automate license optimization decisions using agentic AI systems.

> Not just a dashboard — an intelligent system that observes, analyzes, and optimizes SaaS usage autonomously.

---

## The Problem

Enterprise organizations lose significant budget to SaaS inefficiencies every year:

**Cost leakage** — Companies overpay for unused licenses and run duplicate tools across departments with no centralized visibility into what is actually being used.

**Access and security gaps** — Ex-employees retain active access to critical tools after offboarding. No unified system exists to detect or remediate stale permissions at scale.

**Fragmented data** — Finance, IT, and HR operate disconnected toolsets. There is no single source of truth for SaaS usage, spend, or user activity across the organization.

**Manual operations** — Onboarding and offboarding workflows are repetitive and error-prone. License decisions are made without data, leading to chronic over-provisioning.

SaaSTrack AI solves all four problems in a single platform.

---

## Architecture

```
                        ┌─────────────────────────────────┐
                        │         Next.js Frontend         │
                        │   Dashboard · Analytics · Chat   │
                        └──────────────┬──────────────────┘
                                       │ REST API
                        ┌──────────────▼──────────────────┐
                        │         Django + DRF             │
                        │      Core API + Auth Layer       │
                        └──────────────┬──────────────────┘
                                       │
               ┌───────────────────────┼───────────────────────┐
               │                       │                       │
  ┌────────────▼────────┐ ┌────────────▼────────┐ ┌──────────▼──────────┐
  │    PostgreSQL        │ │    AI Agent Layer    │ │   Cohere Chatbot    │
  │  Users · Tools ·     │ │  LangChain Agents   │ │  Natural Language   │
  │  Licenses · Usage    │ │  LLM Reasoning      │ │  License Queries    │
  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
               │
  ┌────────────▼────────┐
  │       Docker         │
  │   Containerisation   │
  └─────────────────────┘
```

---

## Features

### Phase 1 — SaaS Tracking Dashboard
Central visibility into every SaaS tool across the organization. Displays number of active users per tool, license allocation vs actual usage, subscription costs by department, and real-time activity metrics. Solves the single biggest pain point in enterprise SaaS management — nobody knowing what tools exist or who is using them.

### Phase 2 — User and Access Management
Maps every user to every SaaS tool they have access to. Tracks active vs inactive users, detects accounts that have not been used beyond a configurable threshold, and flags users who retain access after leaving the organization. Role-based access control ensures only authorized administrators can make changes.

### Phase 3 — License Optimization Engine
Analyzes usage patterns to identify wasted spend. Surfaces unused licenses, underutilized subscriptions, and duplicate tools across teams. Generates prioritized recommendations for downgrades, user removal, and consolidation — with estimated cost savings for each action.

### Phase 4 — AI Agent Assistant (Core Differentiator)
A LangChain-powered agentic AI that acts as an enterprise SaaS analyst. Users can ask natural language questions directly:

- *"Which tools are wasting the most money this quarter?"*
- *"Who hasn't used Slack in the last 30 days?"*
- *"What would we save if we downgraded our Figma plan?"*

The agent reasons over live usage data, applies business rules, and returns actionable answers with supporting evidence — not just raw data.

### Phase 5 — Cohere AI Chatbot
A conversational chatbot powered by the Cohere API that scans the entire SaaS dataset and answers queries about total savings, user counts per department, license utilization rates, and any question related to access or spend. Built to make the platform accessible to non-technical stakeholders like finance and HR.

### Phase 6 — Autonomous Optimization (Agentic)
The system moves beyond suggestions into action. AI agents automatically remove inactive users beyond defined thresholds, recommend plan changes based on usage trajectories, and predict future SaaS costs using historical patterns. This is fully agentic decision-making — the system observes, reasons, and acts.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js | Dashboard, analytics views, chat interface |
| Backend | Django + Django REST Framework | Core system, auth, data models, REST API |
| AI agents | LangChain | Agentic reasoning, tool calling, decision chains |
| LLM | OpenAI / Cohere API | Natural language understanding and generation |
| Chatbot | Cohere API | Conversational license and usage queries |
| Database | PostgreSQL | Structured SaaS, user, and usage data |
| Containerisation | Docker | Isolated, reproducible deployments |
| Cloud | AWS / GCP (planned) | Production deployment |

---

## Data Model

```
User
├── id, name, email
├── role (admin / manager / viewer)
└── department

SaaS Tool
├── id, name, category
├── vendor, pricing_model
└── monthly_cost

Subscription
├── tool_id → SaaS Tool
├── plan_type (free / pro / enterprise)
├── total_licenses
└── cost_per_license

License Mapping
├── user_id → User
├── tool_id → SaaS Tool
├── assigned_date
└── status (active / inactive / revoked)

Usage Data
├── user_id → User
├── tool_id → SaaS Tool
├── last_active_date
├── login_frequency
└── activity_score
```

---

## End-to-End Workflow

```
1. Admin logs in and adds SaaS tools or imports existing data
        │
        ▼
2. System maps users to tools via License Mapping
        │
        ▼
3. Usage data is ingested and analyzed continuously
        │
        ▼
4. Optimization engine flags:
   ├── Inactive users (no login > threshold)
   ├── Unused licenses (allocated but never used)
   └── Duplicate tools (same category, multiple subscriptions)
        │
        ▼
5. AI agent generates insights and answers natural language queries
        │
        ▼
6. Dashboard displays cost breakdown, risk flags, and recommendations
        │
        ▼
7. Autonomous agents execute approved actions (Phase 6)
```

---

## Project Structure

```
saastrack-ai/
├── backend/
│   ├── manage.py
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/              # User model, auth, roles
│   │   ├── tools/              # SaaS tool registry
│   │   ├── licenses/           # License mapping + optimization
│   │   ├── usage/              # Activity tracking + analytics
│   │   └── agents/             # LangChain AI agent layer
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── dashboard/          # Main overview
│   │   ├── tools/              # SaaS tool management
│   │   ├── users/              # User access management
│   │   ├── optimize/           # License optimization view
│   │   └── chat/               # AI chatbot interface
│   ├── components/
│   └── package.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker Desktop
- PostgreSQL
- OpenAI or Cohere API key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Add your DATABASE_URL, OPENAI_API_KEY, COHERE_API_KEY

# Run migrations
python manage.py migrate
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

---

## API Reference

### Tools

```http
GET    /api/tools/              # list all SaaS tools
POST   /api/tools/              # register a new tool
GET    /api/tools/:id/          # tool detail + usage stats
DELETE /api/tools/:id/          # remove a tool
```

### Users

```http
GET    /api/users/              # list all users
GET    /api/users/:id/tools/    # tools a user has access to
POST   /api/users/:id/revoke/   # revoke all access for a user
```

### Licenses

```http
GET    /api/licenses/           # all license mappings
GET    /api/licenses/inactive/  # users inactive beyond threshold
GET    /api/licenses/unused/    # licenses allocated but never used
POST   /api/licenses/optimize/  # trigger optimization analysis
```

### AI Agent

```http
POST   /api/agent/query/        # natural language query to AI agent
GET    /api/agent/insights/     # latest AI-generated recommendations
```

### Chatbot

```http
POST   /api/chat/               # send message to Cohere chatbot
GET    /api/chat/history/       # conversation history
```

---

## AI Components

**Rule-based intelligence** detects inactivity thresholds, flags anomalies in usage patterns, and identifies accounts that should be reviewed for access revocation.

**LangChain agents** use tool calling to run live database queries, apply business logic, and chain reasoning steps together to answer complex multi-step questions about SaaS usage and spend.

**Cohere chatbot** provides a natural language interface over the entire dataset — finance teams can ask questions about budget in plain English without needing SQL or dashboard training.

**Future scope** includes time-series forecasting for SaaS cost prediction, anomaly detection for unusual usage spikes, and fully autonomous agent workflows that execute optimization decisions without human approval.

---

## Design Decisions

**Why Django over FastAPI?**
Django's ORM, admin panel, and batteries-included approach accelerated development of the core data models and auth system. DRF provided a clean REST layer without reinventing patterns.

**Why LangChain for the AI layer?**
LangChain's agent and tool-calling primitives made it straightforward to give the LLM access to live database queries. The agent can call multiple tools in sequence — query inactive users, check their tool costs, calculate savings — and synthesize a coherent answer.

**Why Cohere for the chatbot?**
Cohere's API provided strong performance on structured data reasoning tasks at a lower cost than alternatives, making it suitable for scanning and summarizing the full license dataset in real time.

**Why PostgreSQL over NoSQL?**
SaaS license data is highly relational — users map to tools, tools map to subscriptions, subscriptions map to costs. A relational model with foreign keys and joins is the natural fit. NoSQL would complicate the analytics queries significantly.

---

## Resume Bullet Points

- Built an AI-powered SaaS license management platform using Django, PostgreSQL, and LangChain agents that detects unused licenses, inactive users, and duplicate subscriptions with automated optimization recommendations
- Integrated LangChain agentic AI with live database tool calling to answer natural language queries about SaaS spend and access — e.g. "which tools are wasting money this quarter"
- Developed a Cohere API-powered chatbot that scans the full license dataset to calculate total savings, user counts per department, and utilization rates via conversational interface
- Designed a 5-entity relational data model in PostgreSQL mapping users, tools, subscriptions, license assignments, and usage metrics to power cross-cutting analytics
- Containerised the full stack (Django + Next.js + PostgreSQL) using Docker for reproducible local and cloud deployment

---

## License

MIT
