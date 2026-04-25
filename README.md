## Initia Hackathon Submission

**Project Name**: INITIATE AI S1

### Project Overview

INITIATE AI S1 is a unified AI + DeFi automation platform deployed on its own Initia appchain. It gives users a drag-and-drop workflow canvas to compose DeFi agent logic — transfers, group payments, savings pots, and cross-chain bridging — and compiles those visual graphs into a Groq-powered agent runtime that executes real on-chain transactions. The platform is built for anyone who wants to automate crypto payment flows without writing code or manually signing every step.

The goal is simple: let a user describe intent, build or trigger an agent workflow, and execute trusted blockchain actions without jumping between separate tools.

### Implementation Detail

- **The Custom Implementation**: The core custom work is the workflow compiler —  a system that takes a React Flow node graph (with nodes like `SendPayment`, `BridgeAsset`, `ResolveUsername`, `CreateGroup`) and compiles it into a  structured Groq system prompt with a full DeFi action registry. The backend agent runtime then maps LLM decisions to the correct contract call on
  `INITIATEAIS1Core.sol`, which implements three escrow-safe modules: SecureTransfer, GroupPayment, and SavingsPot. Fraud checks, encrypted remarks, and a full audit log are enforced on every payment flow.

- **The Native Feature**: All three Initia-native features are implemented.
  **Auto-signing / Session UX** via InterwovenKit lets the agent execute a full multi-step workflow — bridge, resolve username, send payment — without prompting the user to sign every transaction individually, which is what makes autonomous agent execution actually viable. 
  **Interwoven Bridge** is a first-class canvas node so users can pull assets from external chains without leaving the builder.
  **.init Username Resolution** is wired into every payment node so users send to `alice.init` instead of a raw `0x` address.

### How to Run Locally

1. Clone the repo and set up environment files:
   `cp backend/.env.example backend/.env` and
   `cp frontend/.env.example frontend/.env.local`, then fill in your keys.
2. Start the backend: `cd backend && npm install && npm run dev`
3. Start the frontend: `cd frontend && npm install && npm run dev`
4. Open `http://localhost:3000`, connect your Initia wallet via InterwovenKit,
   and open the Workflow Canvas to build and compile your first agent.


## Rollup Deployment Note

The custom Initia rollup (`initiate-ai-s1`, chain ID `207170159898403`) is 
deployed locally using Weave/Hardhat. To run the full stack:

1. Start the local rollup: `npx hardhat node` in `contracts/`
2. Deploy the contract: `npx hardhat run scripts/deploy.js --network localhost`
3. Expose it publicly: `ngrok http 8545` and update `INITIA_RPC_URL` in backend

The contract is deployed at: `0xb1108b62ac49caE97b3dABB1304AAA319dfE79eb`
Deployment tx: `0x8e5c65c8533f9b02eccbee5e5eab65d51375b68d3f211fc4573dd729d3681db7`