import json
from typing import Dict, Any, List, Optional
from app.core.config import settings
from pydantic import BaseModel
import os

class AIProvider:
    def extract_intent(self, text: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        raise NotImplementedError
    
    def chat(self, message: str, history: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        raise NotImplementedError

class MockAIProvider(AIProvider):
    def __init__(self):
        self.mock_response = None
        self.should_fail = False

    def extract_intent(self, text: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        if self.should_fail:
            raise Exception("AI Provider Error")
            
        if self.mock_response is not None:
            return self.mock_response
            
        return {
            "is_chat": True,
            "chat_response": f"Mock chatbot response to: {text}",
            "extracted_intent": None
        }

    def chat(self, message: str, history: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        return f"Mock chat response to: {message}"

class ExtractedIntent(BaseModel):
    currency: str
    max_total_amount: float
    allowed_categories: List[str]
    banned_categories: List[str]
    max_quantity: Optional[int]
    recurring_payment_allowed: bool

class GeminiAIProvider(AIProvider):
    def __init__(self):
        import os
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not set in the environment.")

    def _call_gemini(self, prompt: str, timeout: float = 20.0, max_retries: int = 2) -> str:
        """Internal helper to call the Gemini API with retries."""
        import httpx
        import time
        # Updated to gemini-3.6-flash as per the Google API recommendation
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={self.api_key}"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                with httpx.Client(timeout=timeout) as client:
                    response = client.post(url, json=payload)
                if response.status_code == 200:
                    result = response.json()
                    return result["candidates"][0]["content"]["parts"][0]["text"]
                last_error = f"Gemini API error {response.status_code}: {response.text}"
            except Exception as e:
                last_error = str(e)
                
            if attempt < max_retries:
                time.sleep(1.5)
                
        raise Exception(last_error)

    def extract_intent(self, text: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        history_text = ""
        if history:
            for msg in history[-5:]:
                role = "User" if msg["role"] == "user" else "PayGuard AI"
                history_text += f"{role}: {msg['content']}\n"
        
        prompt = f"""
        You are PayGuard AI, an assistant helping users configure Payment Intent Contracts.
        You must decide whether to reply conversationally (if you need more information) OR output the final extracted intent JSON.
        
        Conversation History:
        {history_text}
        
        User's latest message: {text}
        
        If the user is missing required fields (like currency or budget), or just chatting, output your conversational response.
        If the user has provided enough information to formulate a payment rule, output the intent object.
        
        You MUST output ONLY a valid JSON object matching exactly this schema:
        {{
            "is_chat": true or false,
            "chat_response": "Your conversational response here (if is_chat is true), otherwise null",
            "extracted_intent": {{ // Include this ONLY if is_chat is false
                "currency": "INR", // 3 letter currency code
                "max_total_amount": 50000.0, // float
                "allowed_categories": [], // list of strings
                "banned_categories": [], // list of strings
                "max_quantity": null, // int or null
                "recurring_payment_allowed": false // boolean
            }}
        }}
        
        Do not return any markdown formatting. Return ONLY the raw JSON string.
        """
        
        try:
            raw_text = self._call_gemini(prompt).strip()
            
            # Clean up markdown formatting if present
            clean_text = raw_text
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            elif clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
                
            try:
                return json.loads(clean_text.strip())
            except json.JSONDecodeError:
                # If Gemini ignored the JSON instruction and just replied conversationally, use its raw text
                return {
                    "is_chat": True,
                    "chat_response": raw_text,
                    "extracted_intent": None
                }
                
        except Exception as e:
            print(f"Failed to communicate with Gemini API: {e}")
            return {
                "is_chat": True,
                "chat_response": "I'm having trouble connecting to my AI brain right now. Please try again later.",
                "extracted_intent": None
            }

    def chat(self, message: str, history: List[Dict[str, str]], context: Dict[str, Any]) -> str:
        """
        Finance-expert chatbot with full access to the user's live account context.
        """
        history_text = ""
        for msg in history[-10:]:
            role = "User" if msg["role"] == "user" else "PayGuard AI"
            history_text += f"{role}: {msg['content']}\n"

        # Format context into a readable block
        ctx_lines = []
        if context.get("summary"):
            s = context["summary"]
            ctx_lines.append(f"=== ACCOUNT SUMMARY ===")
            ctx_lines.append(f"Total Transactions: {s.get('total_transactions', 0)}")
            ctx_lines.append(f"Approved: {s.get('approved', 0)} | Blocked: {s.get('blocked', 0)} | Pending: {s.get('pending', 0)}")
            ctx_lines.append(f"Total Volume Processed: ₹{s.get('total_volume', 0):,.2f}")
            ctx_lines.append(f"Active Intent Rules: {s.get('active_intents', 0)}")
            ctx_lines.append(f"Total Intent Rules: {s.get('total_intents', 0)}")

        if context.get("recent_transactions"):
            ctx_lines.append("\n=== RECENT TRANSACTIONS (last 10) ===")
            for tx in context["recent_transactions"][:10]:
                status = tx.get("status", "UNKNOWN")
                amount = tx.get("total_amount", 0)
                currency = tx.get("currency", "INR")
                merchant = tx.get("merchant_name", "Unknown")
                created = tx.get("created_at", "")[:10]
                ctx_lines.append(f"- [{status}] {currency} {amount:,.2f} @ {merchant} on {created} | Intent: {tx.get('intent_id', 'N/A')}")

        if context.get("intents"):
            ctx_lines.append("\n=== ACTIVE INTENT RULES ===")
            for intent in context["intents"]:
                status = intent.get("status", "UNKNOWN")
                currency = intent.get("currency", "INR")
                max_amt = intent.get("max_total_amount", 0)
                allowed = ", ".join(intent.get("allowed_categories", [])) or "Any"
                banned = ", ".join(intent.get("banned_categories", [])) or "None"
                recurring = "Yes" if intent.get("recurring_payment_allowed") else "No"
                ctx_lines.append(
                    f"- [{status}] {intent.get('id', 'N/A')} | Currency: {currency} | Max: ₹{max_amt:,.2f} | "
                    f"Allowed: {allowed} | Banned: {banned} | Recurring: {recurring}"
                )

        context_block = "\n".join(ctx_lines) if ctx_lines else "No account data available."

        system_prompt = f"""You are PayGuard AI — a highly advanced, deeply knowledgeable financial intelligence assistant built into the PayGuard platform. You are an expert in ALL areas of finance, payments, and fintech.

YOUR FINANCE DOMAIN EXPERTISE covers (but is not limited to):
- Payment systems: UPI, NEFT, RTGS, IMPS, SWIFT, ACH, SEPA, Razorpay, Stripe, PayPal
- Financial instruments: equities, bonds, mutual funds, derivatives, options, futures, ETFs, REITs
- Banking: retail banking, corporate banking, trade finance, treasury management, correspondent banking
- Risk management: credit risk, market risk, liquidity risk, operational risk, VaR, stress testing
- Compliance & Regulation: RBI guidelines, PCI-DSS, AML, KYC, FATF, Basel III, GDPR, SEBI regulations
- Corporate Finance: DCF valuation, WACC, capital structure, M&A, IPO, PE/VC
- Financial accounting: IFRS, Ind AS, balance sheets, P&L, cash flow statements, ratio analysis
- Taxation: GST, TDS, capital gains tax, income tax slabs, advance tax
- Economic concepts: monetary policy, fiscal policy, inflation, interest rates, forex, BOP
- Fintech: blockchain, DeFi, NFTs, CBDC, digital lending, BNPL, InsurTech, RegTech
- Credit scoring, fraud detection, payment orchestration, reconciliation

LIVE ACCOUNT CONTEXT (use this to answer questions about the user's PayGuard account):
{context_block}

IMPORTANT RULES:
1. When asked about the user's account, transactions, balances, or intents — always use the Live Account Context above.
2. When asked general finance questions — answer from your deep domain expertise.
3. Be concise but thorough. Use numbers from the context when relevant.
4. If data isn't in the context, say so clearly and offer to help configure it.
5. Format answers clearly — use bullet points, numbers, or tables where helpful.
6. Never hallucinate account data. If something isn't in the context, admit it.
7. Respond in the same language the user uses.

Conversation History:
{history_text}

User: {{message}}
PayGuard AI:"""

        try:
            return self._call_gemini(system_prompt, timeout=25.0).strip()
        except Exception as e:
            print(f"Chat Gemini error: {e}")
            return "I'm having trouble reaching my AI engine right now. Please try again in a moment."

def get_ai_provider() -> AIProvider:
    import os
    provider = os.getenv("AI_PROVIDER", "").lower()
    
    if provider == "mock":
        return MockAIProvider()
        
    api_key = os.getenv("GEMINI_API_KEY", "")
    if api_key and len(api_key) > 30:
        return GeminiAIProvider()
        
    return MockAIProvider()

ai_provider = get_ai_provider()
