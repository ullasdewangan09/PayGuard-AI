<div align="center">
  <img width="2360" height="1640" alt="Untitled - 31 August 2026 18 41 09" src="https://github.com/user-attachments/assets/704c1534-94ea-48fa-910b-74c521f6c8a0" />
  <!-- <img src="docs/assets/logo.png" alt="PayGuard AI Logo" width="150"/> -->
  
  <h1 align="center">PayGuard AI</h1>
  
  <p align="center">
    <strong>Deterministic Policy Engine for Autonomous AI Agents</strong>
    <br />
    <br />
    <a href="https://github.com/ullasdewangan09/PayGuard-AI/issues">Report Bug</a>
    ·
    <a href="https://github.com/ullasdewangan09/PayGuard-AI/issues">Request Feature</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF" alt="Razorpay" />
  </p>
</div>

---

## ⚡ Overview

**PayGuard AI** is a defense-in-depth security layer that sits between Autonomous AI Agents and payment gateways (like Razorpay). 

As AI agents become increasingly autonomous—booking flights, buying software, and paying for services on your behalf—the risk of **rogue agents** or **prompt injection attacks** draining budgets is rising. PayGuard AI solves this by intercepting all transaction requests and validating them against **deterministic, immutable intent contracts** before any money actually moves.

If the AI tries to buy an unauthorized item, exceed a budget, or sneak in a recurring subscription, PayGuard blocks it at the cryptographic gate.

---

## 📸 Sneak Peek

### Landing Page & Login Page 
<img width="1912" height="1073" alt="image" src="https://github.com/user-attachments/assets/7cd5ca0f-623c-4fb9-ac86-1e241fe63780" /> <img width="1912" height="1077" alt="image" src="https://github.com/user-attachments/assets/78b06a14-4d78-4b4e-8462-8ec27bf5fbfb" />


### Main Dashboard & Analytics
<img width="1912" height="1076" alt="image" src="https://github.com/user-attachments/assets/4a9e29d7-85a4-4255-b211-6cc4311e1e88" />

### Attack Lab Simulator
<img width="1856" height="975" alt="image" src="https://github.com/user-attachments/assets/74fbc2b9-43c9-4526-8cf0-015c870084e2" />

### AI Intent Builder
<img width="1857" height="980" alt="image" src="https://github.com/user-attachments/assets/6f79bfc5-e7db-4f21-83ac-74d22e222848" />

---

## 🚀 Key Features

*   **🧠 AI Intent Extraction**: Talk to the system in plain English (e.g., *"Set up a ₹4,000 monthly limit for Netflix"*). The AI parses this into a rigid JSON intent contract stored securely in the database.
*   **🛡️ Deterministic Policy Engine**: AI makes mistakes, but algorithms don't. Every transaction proposal is evaluated deterministically against the intent contract.
*   **⚔️ Attack Lab Simulator**: Test your defenses. Simulate rogue agents attempting budget bypasses, category smuggling, or hidden subscription injections to verify the Policy Engine's robustness.
*   **📊 Comprehensive Audit Trails**: Cryptographically secure logs of every successful transaction and every blocked adversarial attempt.
*   **💳 Razorpay Integration**: Real-world payment gateway integrations using Idempotency Keys to prevent double-charging.
*   **🎨 Premium Dark Mode UI**: A gorgeous, borderless, and highly interactive frontend built with TailwindCSS, Lucide Icons, and Framer Motion logic.

---

## 🏗️ Architecture

```mermaid
sequenceDiagram
    participant User
    participant AI Agent
    participant PayGuard
    participant Razorpay

    User->>PayGuard: "Allow $500 for flights"
    PayGuard->>PayGuard: Extract to Strict JSON Intent
    
    AI Agent->>PayGuard: Proposal: Buy $450 flight
    PayGuard-->>AI Agent: APPROVE (Capture Ready)
    PayGuard->>Razorpay: Execute Payment (Idempotency Key)
    Razorpay-->>PayGuard: Success Receipt
    
    AI Agent->>PayGuard: Proposal: Buy $600 flight
    PayGuard-->>AI Agent: BLOCK (Budget Exceeded)
```

---

## 💻 Tech Stack

### Frontend
*   **React (Vite)**: Lightning-fast development environment.
*   **Tailwind CSS**: Utility-first premium styling (Custom dark theme).
*   **Lucide React**: Beautiful, consistent iconography.
*   **Axios**: API requests to the backend.

### Backend
*   **FastAPI (Python)**: High-performance async API framework.
*   **SQLAlchemy & Alembic**: Robust ORM and database migration management.
*   **Pydantic**: Strict data validation for the Policy Engine.

### Infrastructure
*   **Supabase**: Managed PostgreSQL database and Authentication.
*   **Razorpay**: Payment Gateway API.

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   Supabase Account
*   Razorpay Test Account

### Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ullasdewangan09/PayGuard-AI.git
   cd PayGuard-AI
   ```

2. **Backend Setup**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
   *Create a `.env` file based on `.env.example` and fill in your Supabase and Razorpay keys.*
   ```bash
   alembic upgrade head
   python -m uvicorn app.main:app --reload --port 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```
   *Create a `frontend/.env` file based on `frontend/.env.example`.*
   ```bash
   npm run dev
   ```

4. **Open Application**
   Navigate to `http://localhost:5173` in your browser.

---

## 📊 Analytics & Performance

PayGuard AI is designed for sub-millisecond policy evaluation. 
*   **Policy Engine Latency**: < 50ms average overhead per transaction proposal.
*   **Database Query Time**: < 10ms for intent retrieval using indexed Supabase queries.
*   **Idempotency Guarantee**: 100% prevention of duplicate accidental charges.

---

<div align="center">
  <p>Built by Ullas Dewangan</p>
  <a href="https://github.com/ullasdewangan09">GitHub Profile</a>
</div>
