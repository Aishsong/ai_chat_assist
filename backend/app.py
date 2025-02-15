import asyncio
import openai
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from sqlalchemy.orm import Session
import uvicorn
import os

from . import crud, models, utils, database

# 只创建一次 FastAPI 实例，并直接配置标题
app = FastAPI(title="Chat Bot with RAG and Entity Extraction")

# 配置 CORS：允许所有源、所有方法和所有请求头（可根据需要限制）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 建议在生产环境中指定允许的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建所有数据库表（如果不存在）
models.Base.metadata.create_all(bind=database.engine)

# Pydantic 模型：请求和响应格式
class ChatRequest(BaseModel):
    conversation_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str
    retrieval: str
    entities: Dict[str, str]

# FastAPI 依赖注入，获取数据库 session 
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    """
    聊天接口：并行调用检索和实体抽取工具，然后调用 ChatCompletion 生成回复，最后存储聊天记录
    """
    try:
        # 并行跑：文档检索和实体抽取
        retrieval_task = asyncio.create_task(utils.retrieve_documents(request.message))
        entity_task = asyncio.create_task(utils.extract_entities(request.message))
        
        retrieval_result = await retrieval_task
        entities_result = await entity_task
        
        # 生成聊天回复，将检索到的上下文信息传入
        chat_reply = await utils.chat_completion(request.message, context=retrieval_result)
        
        # 将对话存入数据库
        crud.create_chat_history(db, request.conversation_id, request.message, chat_reply)
        
        return ChatResponse(reply=chat_reply, retrieval=retrieval_result, entities=entities_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def history(conversation_id: str = None, db: Session = Depends(get_db)):
    """
    查询聊天历史记录（可按 conversation_id 筛选）
    """
    histories = crud.get_chat_history(db, conversation_id)
    return histories

@app.post("/chat_stream")
async def chat_stream(request: ChatRequest):
    """
    SSE 流式接口：将 OpenAI 的流式返回逐步推送到前端（注意：这里只是一个简化示例）
    """
    async def event_generator():
        retrieval_task = asyncio.create_task(utils.retrieve_documents(request.message))
        entity_task = asyncio.create_task(utils.extract_entities(request.message))
        retrieval_result = await retrieval_task
        messages = [
            {"role": "system", "content": f"请结合以下上下文信息回答问题：{retrieval_result}"},
            {"role": "user", "content": request.message}
        ]
        try:
            # 流式调用 ChatCompletion API
            response = await asyncio.to_thread(
                openai.ChatCompletion.create,
                model="gpt-3.5-turbo",
                messages=messages,
                stream=True,
                temperature=0.7,
            )
            for chunk in response:
                if 'choices' in chunk:
                    delta = chunk['choices'][0]['delta']
                    if 'content' in delta:
                        content = delta['content']
                        yield f"data: {content}\n\n"
            # 等待实体抽取完成，最终推送实体数据（可约定前缀标识）
            entities_result = await entity_task
            yield f"data: [ENTITIES]{entities_result}\n\n"
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)