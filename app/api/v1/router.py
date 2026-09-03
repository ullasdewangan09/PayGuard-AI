from fastapi import APIRouter
from app.api.v1.endpoints import ai, evaluations, intents, orders, receipts, transactions, webhooks, auth, audit, profile, security

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(intents.router, prefix="/intents", tags=["intents"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(receipts.router, prefix="/receipts", tags=["receipts"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
