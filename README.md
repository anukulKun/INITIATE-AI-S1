# INITIATE AI S1

INITIATE AI S1 is a unified AI + DeFi platform built for the Initia hackathon. It combines a visual workflow builder, AI agent execution, secure DeFi actions, username resolution, and on-chain contract handling into one product flow.

The goal is simple: let a user describe intent, build or trigger an agent workflow, and execute trusted blockchain actions without jumping between separate tools.

## What The Platform Does

INITIATE AI S1 supports three core experiences:

1. AI workflows
	- Build logic visually with drag-and-drop workflow nodes.
	- Compile workflows into executable agent actions.
	- Run agent-style tasks from the unified dashboard.

2. DeFi actions
	- Send secure transfers.
	- Create and contribute to group payment flows.
	- Create, deposit into, and withdraw from savings pots.

3. Identity and tracking
	- Resolve `.init` usernames for easier payments.
	- Track transactions and activity in one dashboard.
	- Enforce JWT auth, validation, rate limiting, and fraud-aware checks.

## Why This Stack

- Next.js 16: gives the frontend a modern app router, fast rendering, and an easy path for dashboards and forms.
- React Flow: used for the workflow editor because the product needs a real node-based builder, not just static forms.
- Tailwind CSS + shadcn/ui: keeps the interface fast to build, consistent, and easy to extend.
- Framer Motion: adds polished motion to make the product feel like a real demo, not a prototype.
- Node.js + Express: a lightweight API layer for auth, orchestration, validation, and DeFi routes.
- Groq SDK: powers the AI-assisted parts of the experience, including agent-style logic.
- ethers v6: handles contract and chain interactions from the backend.
- Solidity + Hardhat: used for the deployed smart contract and repeatable contract workflow.
- InterwovenKit: provides the wallet and Initia-style wallet UX integration layer.

## Repo Layout

- [frontend](frontend): Next.js app with auth, dashboard, and workflow UI.
- [backend](backend): API server for auth, AI orchestration, DeFi routes, and username resolution.
- [contracts](contracts): Hardhat workspace, contract source, tests, and deployment scripts.
- [docker](docker): containerization assets for local and deployment use.

## Custom Work

- Added the core contract at [contracts/contracts_src/INITIATEAIS1Core.sol](contracts/contracts_src/INITIATEAIS1Core.sol) for the Initia-native module behavior.
- Added backend orchestration services for agents, fraud, audits, payments, and resolution.

## Quick Start

### Backend

1. Go to [backend](backend).
2. Copy [backend/.env.example](backend/.env.example) to [backend/.env](backend/.env).
3. Install dependencies with `npm install`.
4. Start the server with `npm run dev`.

### Frontend

1. Go to [frontend](frontend).
2. Copy [frontend/.env.example](frontend/.env.example) to [frontend/.env.local](frontend/.env.local).
3. Install dependencies with `npm install`.
4. Start the app with `npm run dev`.

### Contracts

1. Go to [contracts](contracts).
2. Install dependencies with `npm install`.
3. Compile the contract with `npx hardhat compile`.

## Deployment Flow

1. Deploy the smart contract with the Hardhat script in [contracts/scripts](contracts/scripts).
2. Deploy the backend to Render and set the production environment variables.
3. Deploy the frontend to Vercel and point it at the backend URL.
4. Update the backend `FRONTEND_URL` after the frontend is live.

## Implemented Coverage

- Workflow compiler and agent runtime.
- DeFi transfer, group payment, and savings pot API flows.
- `.init` username resolution endpoint and debounced frontend hook.
- JWT auth, request validation, rate limiting, encryption, and fraud checks.
- Unified dashboard and transaction visibility.
- Docker compose setup.
- Unit test baseline.


