from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.intent import IntentContractCreate

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")

class AIIntentRequest(BaseModel):
    text: str = Field(..., description="The natural language user request to interpret.")
    history: Optional[list[ChatMessage]] = Field(default_factory=list, description="Previous conversation history")

class AIIntentResponse(BaseModel):
    intent: Optional[IntentContractCreate] = Field(None, description="The strictly structured intent extracted from the request.")
    interpretation: str = Field(..., description="Human-readable explanation of what the AI interpreted.")
    success: bool = Field(..., description="Whether extraction and strict validation was successful.")
    error: Optional[str] = Field(None, description="Error message if validation failed.")

class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's chat message.")
    history: Optional[List[ChatMessage]] = Field(default_factory=list, description="Conversation history")

class ChatResponse(BaseModel):
    reply: str = Field(..., description="The AI's response.")
    success: bool = True
    error: Optional[str] = None
