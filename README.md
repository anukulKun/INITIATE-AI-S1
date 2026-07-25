<div align="center">

# initflow

**Drag-and-drop DeFi automation powered by AI agents — built on Initia**

**Compose workflows. Execute on-chain. Skip the signing ceremony.**

No code. No manual transactions. No juggling ten different tools.

[Live App](https://initflow.vercel.app) &nbsp;·&nbsp;
[Docs](#api) &nbsp;·&nbsp;
[Discord](#)

</div>

<p align="center">
  <a href="https://github.com/anukulKun/initflow/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-000000.svg" /></a>
  <a href="https://github.com/anukulKun/initflow"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-76%25-3178C6?logo=typescript&logoColor=white" /></a>
  <a href="https://initflow.vercel.app"><img alt="Live app" src="https://img.shields.io/badge/Live-initflow.vercel.app-000000" /></a>
</p>

---

## What is initflow?

DeFi today means manually signing every transaction, switching between five different tools, and hoping your bridge didn't stall at step 3. For anyone who manages recurring payments, splits bills with a group, or moves assets across chains — it's genuinely painful.

initflow is a unified AI + DeFi automation platform deployed on its own Initia appchain. You drag-and-drop a workflow — transfers, group payments, savings pots, cross-chain bridges — and the platform compiles it into an AI agent that executes real on-chain transactions autonomously. No code. No per-step signing. No babysitting.

## Why initflow?

**DeFi UX hasn't caught up to DeFi capability.** Power users deal with fragmented tooling. Everyone else avoids it entirely.

1. **Visual workflow builder.** Compose agent logic by connecting nodes on a canvas — `SendPayment → ResolveUsername → BridgeAsset` — instead of writing scripts or calling contracts manually.

2. **Autonomous agent execution.** Groq-powered agent runtime maps the compiled graph to actual contract calls. Session UX via InterwovenKit means multi-step workflows run without prompting you to sign every single transaction.

3. **Human-readable addresses.** Every payment node supports `.init` username resolution. Send to `alice.init`, not `0x4f3a...`.

4. **Safe by default.** `InitflowCore.sol` enforces escrow-safe logic across all three modules — SecureTransfer, GroupPayment, and SavingsPot — with fraud checks, encrypted remarks, and a full audit log on every payment flow.

5. **Interwoven Bridge as a first-class node.** Pull assets from external chains directly inside the workflow canvas, without leaving the builder.

## How it works

```
User builds a workflow on the canvas
(SendPayment, BridgeAsset, ResolveUsername, CreateGroup, SavingsPot nodes)
        │
        ▼
Workflow compiler turns the React Flow node graph
into a structured Groq system prompt + DeFi action registry
        │
        ▼
Backend agent runtime receives the compiled prompt
        │
        ▼
Agent maps LLM decisions → contract calls on InitflowCore.sol
(SecureTransfer / GroupPayment / SavingsPot modules)
        │
        ▼
InterwovenKit session UX executes the full multi-step flow
without per-transaction signing prompts
        │
        ▼
Audit log + encrypted remarks written on-chain
```

---

## Quick start

### With Docker

```bash
git clone https://github.com/anukulKun/initflow.git
cd initflow
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# fill in your keys, then:
docker compose up --build
```

App → `http://localhost:3000`

### Without Docker

**Backend** (one terminal):

```bash
cd backend
npm install
npm run dev
```

**Frontend** (another terminal):

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`, connect your Initia wallet via InterwovenKit, and open the Workflow Canvas to build and compile your first agent.

---

## Smart contracts

The core logic lives in `InitflowCore.sol`, which implements three escrow-safe modules:

| Module | What it does |
|---|---|
| `SecureTransfer` | Single or scheduled transfers with fraud checks and encrypted remarks |
| `GroupPayment` | Split payments across a defined group, settled on-chain |
| `SavingsPot` | Locked savings with configurable release conditions |

**Local rollup setup:**

```bash
# Start the local Initia rollup (chain ID: 207170159898403)
npx hardhat node

# Deploy the contract
npx hardhat run scripts/deploy.js --network localhost

# Expose for backend access
ngrok http 8545
# Then update INITIA_RPC_URL in backend/.env
```

Contract address: `0xb1108b62ac49caE97b3dABB1304AAA319dfE79eb`  
Deployment tx: `0x8e5c65c8...`

---

## Repo structure

| Folder | What it does |
|---|---|
| [`frontend/`](frontend) | Workflow canvas UI — Next.js, React Flow, InterwovenKit |
| [`backend/`](backend) | Agent runtime — Node.js, Groq SDK, contract call dispatcher |
| [`contracts/`](contracts) | `InitflowCore.sol` — SecureTransfer, GroupPayment, SavingsPot |
| [`docker/`](docker) | Docker Compose configuration |
| [`.initia/`](.initia) | Initia appchain configuration |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React Flow (workflow canvas), InterwovenKit |
| Backend | Node.js, Groq SDK, DeFi action registry |
| Smart contracts | Solidity — `InitflowCore.sol` |
| Chain | Custom Initia appchain (chain ID `207170159898403`) |
| Wallet / session | InterwovenKit (auto-signing / session UX) |
| Bridge | Interwoven Bridge (native Initia) |
| Username resolution | `.init` username system (native Initia) |

---

## Initia-native features used

All three Initia-native features are implemented:

- **Auto-signing / Session UX (InterwovenKit)** — lets the agent run full multi-step workflows (bridge → resolve username → send payment) without interrupting the user for signatures at every step. This is what makes autonomous execution actually viable.
- **Interwoven Bridge** — implemented as a first-class canvas node so users can pull assets from external chains without leaving the workflow builder.
- **.init Username Resolution** — wired into every payment node. Users send to `alice.init` instead of raw `0x` addresses.

---

## Contributing

PRs welcome. Bug fixes and small improvements are the best place to start. For larger features, open an issue first so we can align on direction.

Before submitting a PR:

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run build
```

---

## License

Licensed under the [MIT License](LICENSE).
