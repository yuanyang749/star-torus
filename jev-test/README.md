# TypeSafe Jev 模型测试指南 (via OpenRouter Decisions API)

本目录为 **TypeSafe AI** 的首个系统一（System One）决策模型 **Jev**（`~typesafe/jev-latest`）的测试套件。

## 核心概念

Jev 是一个**非生成式（Non-Generative）结构化决策模型**：
- **不生成长文本**，不进行多轮闲聊，专为嵌入代码逻辑设计。
- 输入 `state`（待判断材料，支持文本/JSON） + `questions`（判断题字典）。
- 返回确定性的结构化答案、概率分布与置信度。

### 三大决策原语 (Primitives)

1. **`noul`（是/否概率）**：返回 0 ~ 1 之间的浮点数（Yes 的概率）。
2. **`choice`（多选一）**：从预设的选项中选出最高概率项，并返回各选项的概率分布与置信度。
3. **`score`（梯级评分）**：根据有序量规（Rubric）返回加权得分。

---

## 运行方式

### 1. Node.js 测试脚本 (推荐)
无需安装任何外部依赖，利用 Node.js 18+ 原生 `fetch`：
```bash
node test_jev.mjs
```

### 2. Python 测试脚本
基于 Python 原生 `urllib`，零依赖：
```bash
python3 test_jev.py
```

---

## 接口说明

- **Endpoint**: `https://openrouter.ai/api/alpha/decisions`
- **Method**: `POST`
- **Header**:
  - `Authorization: Bearer <OPENROUTER_API_KEY>`
  - `Content-Type: application/json`
- **Model**: `~typesafe/jev-latest` (指向 `typesafe/jev-1.13-xxx`)
- **计费**: 输入约 $0.042 / 1M tokens，输出免费。
