
# PDF Chatbot SaaS – Starter Project

Tech stack:
* Frontend: Next.js + React + TailwindCSS
* Backend: Node.js + Express
* Auth: Firebase Auth
* File Storage: Cloudflare R2
* Vector DB: Pinecone
* LLM & Embeddings: OpenAI (BYOK – user supplies key)

## Quick Start

### Prerequisites
* Node.js 18+
* npm or yarn
* OpenAI API key
* Pinecone API key & environment
* Firebase project (Auth enabled)
* Cloudflare R2 bucket credentials

### Setup steps

```bash
git clone <repo>
cd pdf-chatbot-saas
cp .env.example .env
# fill the env values

# Install backend
cd backend
npm install

# Install frontend
cd ../frontend
npm install
```

### Run locally

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

The backend runs on http://localhost:4000 and the frontend on http://localhost:3000 .
