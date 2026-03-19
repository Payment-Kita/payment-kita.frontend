# Payment-Kita Frontend

Cross-chain stablecoin payment gateway dashboard built with Svelte, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Svelte + SvelteKit
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: wagmi, viem, Web3Modal

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── atoms/        # Buttons, Inputs, etc.
│   │   ├── molecules/    # Cards, Forms, etc.
│   │   └── organisms/    # Headers, Sidebars, etc.
│   ├── stores/           # Svelte stores
│   ├── services/         # API services
│   └── utils/            # Utilities
├── routes/               # SvelteKit routes
├── app.css               # Tailwind imports
└── app.html
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```env
PUBLIC_API_URL=http://localhost:8080
PUBLIC_WS_URL=ws://localhost:8080
PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```
