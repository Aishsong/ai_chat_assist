# Chat Bot with RAG and Entity Extraction

## 项目概述

本项目实现了一个智能聊天机器人系统，集成了下列功能：
- **增强检索 (RAG, Retrieval Augmented Generation)**：利用文档检索功能为聊天回复提供上下文信息。
- **实体抽取**：自动从用户输入中抽取关键实体，例如订单号、电话号码和地址。
- **流式响应**：支持 Server-Sent Events (SSE) 流式输出，实时传递回复内容。

项目主要分为两个部分：
- **后端 (backend)**：基于 FastAPI 构建的 Python 服务，提供聊天、流式回复、历史记录查询以及文档向量索引等接口。
- **前端 (frontend)**：基于 React 和 TypeScript 构建的用户界面，包含聊天面板与实体展示面板，与后端进行交互。

## 目录

- [项目概述](#项目概述)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [后端设置](#后端设置)
  - [依赖要求](#依赖要求)
  - [安装步骤](#安装步骤)
  - [环境变量](#环境变量)
  - [文档索引](#文档索引)
- [前端设置](#前端设置)
- [API 接口](#api-接口)
- [部署](#部署)
- [贡献指南](#贡献指南)
- [许可证](#许可证)
- [联系方式](#联系方式)
- [致谢](#致谢)

## 功能特性

- **上下文增强回复**：聊天接口会结合文档检索结果作为上下文，提高回复准确性。
- **实体抽取**：自动识别输入中的订单号、电话号码和地址等关键信息。
- **实时流式返回**：利用 SSE 技术实现聊天回复的实时输出。
- **向量文档索引**：通过 OpenAI Embedding API 对文档生成嵌入向量，并保存为索引文件。
- **历史记录存储**：使用 SQLAlchemy 将每次对话记录存入数据库（默认 SQLite）。

## 项目结构
project-root/
├── backend/
│ ├── app.py # FastAPI 主服务及接口定义
│ ├── crud.py # 数据库操作（保存和查询聊天记录）
│ ├── database.py # 数据库连接与 session 管理
│ ├── models.py # ORM 模型定义（如 ChatHistory）
│ ├── utils.py # 工具函数（聊天生成、文档检索、实体抽取）
│ ├── index_docs.py # 生成文档向量索引的脚本
│ ├── requirements.txt # 后端依赖列表
│ ├── vector_index.pkl # 文档向量索引文件（由 index_docs.py 生成）
│ └── init.py # 后端包初始化文件
└── frontend/
├── package.json # 前端依赖与脚本配置
├── public/
│ └── index.html # HTML 模板
└── src/
├── index.tsx # React 入口文件
├── App.tsx # 主 App 组件（包含聊天与实体板块）
├── api.ts # 前后端通信 API 封装
├── react-app-env.d.ts# TypeScript 环境声明文件
└── components/
├── ChatBox.tsx # 聊天面板组件，负责发送消息和显示对话
└── EntityPanel.tsx # 实体展示面板组件，显示抽取的实体信息

## 后端设置

### 依赖要求

- Python 3.8 及以上版本
- FastAPI、Uvicorn、SQLAlchemy、OpenAI SDK、Numpy、Pydantic 等（详见 `backend/requirements.txt`）

### 安装步骤

1. **克隆仓库**

   ```bash
   git clone git@github.com:Aishsong/ai_chat_assist.git
   cd your_repository/backend
   ```

2. **创建虚拟环境并安装依赖**

   ```bash
   python3 -m venv venv
   source venv/bin/activate    # Windows 下使用 `venv\Scripts\activate`
   cd backend
   pip install -r requirements.txt
   (推荐使用国内镜像源
   pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple)
   ```

3. **配置环境变量**
   (已配置可忽略此步)
   在 `backend` 目录下创建 `.env` 文件或直接设置系统环境变量，至少配置以下变量：

   ```env
   OPENAI_API_KEY=your_openai_api_key
   DATABASE_URL=your_database_url
   ```

4. **启动后端服务**

   使用 Uvicorn 启动服务：

   ```bash
   cd 根目录
   uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
   ```

   服务启动后，可访问 [http://127.0.0.1:8000](http://127.0.0.1:8000) 进行测试。

### 文档索引

使用文档检索功能前，请运行 `index_docs.py` 对文本文档进行索引：

```bash
python index_docs.py path/to/your/txt_documents_folder
```

执行后将在 `backend` 下生成 `vector_index.pkl` 索引文件。

## 前端设置

### 依赖要求

- Node.js (v14+ 推荐)
- npm 或 yarn

### 安装步骤

1. **进入前端目录**

   ```bash
   cd your_repository/frontend
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

   或者使用 yarn：

   ```bash
   yarn install
   ```

3. **启动前端项目**

   ```bash
   npm start
   ```

   启动后，打开浏览器并访问 [http://localhost:3000](http://localhost:3000) 即可看到聊天界面。

## API 接口

### 1. 聊天接口

- **URL**: `/chat`
- **方法**: `POST`
- **描述**: 接收用户消息，并返回生成的聊天回复、检索到的文档信息及抽取的实体。
- **请求示例**

  ```json
  {
    "conversation_id": "default",
    "message": "你的消息内容"
  }
  ```

- **响应示例**

  ```json
  {
    "reply": "AI生成的回复",
    "retrieval": "文档检索的上下文信息",
    "entities": {
      "order_number": "抽取的订单号",
      "phone_number": "抽取的电话号码",
      "address": "抽取的地址"
    }
  }
  ```

### 2. 流式聊天接口

- **URL**: `/chat_stream`
- **方法**: `POST`
- **描述**: 以 SSE (Server-Sent Events) 流的形式逐步返回聊天回复。前端可监听并实时显示流数据。
  
### 3. 聊天记录查询接口

- **URL**: `/history`
- **方法**: `GET`
- **描述**: 根据可选的 `conversation_id` 查询历史聊天记录。

## 部署

### 后端部署

- **使用 Docker**

  如需使用 Docker 部署，请编写相应的 Dockerfile。构建和运行示例命令：

  ```bash
  docker build -t chat-bot-backend .
  docker run -p 8000:8000 chat-bot-backend
  ```

- **云平台部署**

  可将后端服务部署至 Heroku、AWS、Azure 等云平台。

### 前端部署

1. **构建生产版本**

   ```bash
   npm run build
   ```

2. **部署**

   将生成的静态文件部署到 Netlify、Vercel、GitHub Pages 或其他静态托管服务。

## 贡献指南

欢迎对本项目进行贡献！如果你想贡献代码，请按照以下流程操作：

1. Fork 仓库
2. 创建新分支：
   ```bash
   git checkout -b feature/YourFeature
   ```
3. 修改并提交代码：
   ```bash
   git commit -m "添加新功能描述"
   ```
4. 推送分支并创建 Pull Request
5. 请确保代码符合项目规范并通过所有测试

## 许可证

本项目基于 [MIT License](LICENSE) 开源，详细信息请查看 LICENSE 文件。

## 联系方式

如果有任何疑问或建议，请联系：
- **项目负责人**
- **邮箱**1070841955@qq.com

## 致谢

- 感谢 OpenAI 提供的 API 服务。
- 感谢 FastAPI、React、SQLAlchemy 以及其他开源社区的所有贡献者。
- 感谢所有测试和使用本项目的开发者和用户。

