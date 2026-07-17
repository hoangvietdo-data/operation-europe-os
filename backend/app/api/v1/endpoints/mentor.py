from app.models.user import User
from app.api.deps import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.chat import ChatRequest, ChatResponse
from app.models.ai_provider import AIProvider
from app.models.user_setting import UserSetting
import random
import asyncio

import openai
import google.generativeai as genai
import anthropic
import groq

router = APIRouter()

MOCK_RESPONSES = [
    "That is a great question. For European Master's programs, focus heavily on your motivation letter and matching your background to the course curriculum.",
    "Make sure your CV is in EuroPass format. German universities specifically look for academic rigor and clear formatting.",
]

def call_openai(api_key: str, model: str, base_url: str, request: ChatRequest) -> str:
    # Works for OpenAI, DeepSeek, and Custom Endpoints
    client_args = {"api_key": api_key}
    if base_url:
        client_args["base_url"] = base_url
        
    client = openai.OpenAI(**client_args)
    messages = [{"role": "system", "content": "You are a Senior Product Designer and AI Mentor specializing in European Master's admissions."}]
    for msg in request.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})
    
    response = client.chat.completions.create(
        model=model,
        messages=messages
    )
    return response.choices[0].message.content

def call_gemini(api_key: str, model: str, request: ChatRequest) -> str:
    genai.configure(api_key=api_key)
    genai_model = genai.GenerativeModel(model)
    
    messages = []
    for msg in request.history:
        role = "model" if msg.role == "assistant" else "user"
        messages.append({"role": role, "parts": [msg.content]})
        
    messages.append({"role": "user", "parts": [request.message]})
    response = genai_model.generate_content(messages)
    return response.text

def call_anthropic(api_key: str, model: str, request: ChatRequest) -> str:
    client = anthropic.Anthropic(api_key=api_key)
    messages = []
    for msg in request.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})
    
    response = client.messages.create(
        model=model,
        max_tokens=1024,
        system="You are a Senior Product Designer and AI Mentor specializing in European Master's admissions.",
        messages=messages
    )
    return response.content[0].text

def call_groq(api_key: str, model: str, request: ChatRequest) -> str:
    client = groq.Groq(api_key=api_key)
    messages = [{"role": "system", "content": "You are a Senior Product Designer and AI Mentor specializing in European Master's admissions."}]
    for msg in request.history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})
    
    response = client.chat.completions.create(
        model=model,
        messages=messages
    )
    return response.choices[0].message.content


@router.post("/chat", response_model=ChatResponse)
async def chat_with_mentor(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settings = db.query(UserSetting).first()
    providers = db.query(AIProvider).filter(AIProvider.user_id == current_user.id, AIProvider.user_id == current_user.id).all()
    
    if not providers:
        await asyncio.sleep(1.5)
        return {"reply": "[Mock Mode] " + random.choice(MOCK_RESPONSES)}
        
    active_provider = None
    if settings and settings.auto_rotate_ai:
        active_provider = random.choice(providers)
    else:
        active_provider = db.query(AIProvider).filter(AIProvider.user_id == current_user.id, AIProvider.is_active == True).first()
        if not active_provider:
            active_provider = providers[0]

    try:
        p_name = active_provider.provider_name.lower()
        if p_name in ["openai", "deepseek", "custom"]:
            reply_text = call_openai(active_provider.api_key, active_provider.default_model, active_provider.base_url, request)
        elif p_name == "gemini":
            reply_text = call_gemini(active_provider.api_key, active_provider.default_model, request)
        elif p_name == "anthropic":
            reply_text = call_anthropic(active_provider.api_key, active_provider.default_model, request)
        elif p_name == "groq":
            reply_text = call_groq(active_provider.api_key, active_provider.default_model, request)
        else:
            raise HTTPException(status_code=400, detail="Unsupported AI Provider")
            
        return {"reply": f"[via {active_provider.default_model}] " + reply_text}
    except Exception as e:
        print(f"Error calling {active_provider.provider_name}: {e}")
        return {"reply": f"[Error connecting to {active_provider.provider_name}] Please check your API key."}
