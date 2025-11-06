# CodeSupplyChat

**CodeSupplyChat** is an AI-powered conversational assistant built on the Google Gemini API. It provides fast, context-aware responses through a modern web interface designed for scalability, extensibility, and ease of use.

---

## Features

* Real-time conversational AI using Gemini API
* Clean, responsive UI built with Next.js / React
* Support for rich context & multi-turn dialogs
* Extensible architecture for plugging in new data sources, tools or integrations
* Environment-based configuration (API keys, deployment settings)
* Cross-platform readiness (web / potentially mobile)

---

## Getting Started

### Prerequisites

* Node.js (v16 or higher recommended)
* pnpm / npm / yarn
* A Google Cloud / Gemini API key / credentials
* (Optional) environment setup for deployment

### Installation

```bash
# Clone the repository
git clone https://github.com/SourcedCMD/Sourced-AI-Chat.git
cd Sourced-AI-Chat

# Install dependencies
pnpm install   # or `npm install` / `yarn install`

# Copy and configure environment variables
cp .env.example .env.local
# Set your Gemini API key and other config in .env.local
```

### Running Locally

```bash
# Start in development mode
pnpm dev     # or `npm run dev` / `yarn dev`

# Open http://localhost:3000 in your browser
```

### Building & Deployment

```bash
pnpm build
pnpm start
```

You can deploy to Vercel, Netlify, or another host that supports Next.js.

---

## Configuration

| Name                  | Description                                     |
| --------------------- | ----------------------------------------------- |
| `GEMINI_API_KEY`      | Your Google Gemini API key / credential         |
| `NEXT_PUBLIC_API_URL` | (If applicable) URL where the backend is hosted |
| `APP_NAME`            | Display name used in UI                         |
| …                     | …                                               |

(Adjust based on your `.env` variables.)

---

## Project Structure

```
/app
/components
/hooks
/lib
/pages
/public
/styles
next.config.mjs
package.json
tsconfig.json
```

* `/app`, `/pages`, `/components` — UI layers
* `/lib` — business logic, API wrappers, Gemini-integration
* `/hooks` — custom React hooks
* `/public` — static assets (images, icons)
* `/styles` — styles / CSS / tailwind / modules

---

## Usage

* Open the app in your browser
* Start a new conversation
* Ask questions or send prompts
* The backend communicates with Gemini API to generate responses
* The UI updates dynamically based on your query & conversation history

---

## Contribution

We welcome contributions!
To propose changes:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Make your changes & add tests if needed
4. Submit a pull request

Please follow standard GitHub flow and include clear commit messages.

---

## Acknowledgements

* Gemini API by Google
* Next.js / React / TypeScript ecosystem
