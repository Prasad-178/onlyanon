# OnlyAnon Setup Guide

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon/service keys

### Run Database Schema
Go to **SQL Editor** in Supabase and run the contents of `supabase/migrations/001_initial_schema.sql`

This creates 4 tables:

| Table | Purpose |
|-------|---------|
| `creators` | Twitter-verified creators (via Privy) |
| `offerings` | Q&A products with prices in SOL/USDC |
| `questions` | Anonymous questions (NO fan data stored) |
| `replies` | Creator responses to questions |

## 2. Privy Setup

1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app
3. Enable **Twitter/X** in Login Methods
4. Enable **Solana** in Embedded Wallets
5. Copy your App ID

## 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## 4. Run the App

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Creators** login with Twitter → Privy creates Solana wallet
2. **Creators** create offerings with prices in SOL or USDC
3. **Fans** connect wallet, ask questions, pay via ShadowWire (anonymous)
4. **Fans** receive access code (XXXX-XXXX-XXXX) - their ONLY link to the question
5. **Creators** see questions in dashboard, reply
6. **Fans** check replies using access code at `/check`

**Privacy**: Fan wallet addresses are hidden via ShadowWire external transfers. No fan data is stored.
