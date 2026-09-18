import os
import json
import time
import urllib.request
import urllib.error
from pathlib import Path

# Load .env
env_path = Path(__file__).parent / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

api_key = os.environ.get("OPENROUTER_API_KEY")
if not api_key:
    raise RuntimeError("OPENROUTER_API_KEY not found in environment or .env file")

ENDPOINT = "https://openrouter.ai/api/alpha/decisions"
MODEL = "~typesafe/jev-latest"

def call_jev(title: str, state: str, questions: dict):
    print("\n" + "=" * 54)
    print(f"🚀 测试用例: {title}")
    print("=" * 54)
    print(f"📝 [Input State]:\n\"{state}\"\n")
    print(f"❓ [Questions]: {list(questions.keys())}")

    payload = {
        "model": MODEL,
        "state": state,
        "questions": questions
    }

    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/typesafe-ai",
            "X-Title": "Jev Python Test Suite"
        }
    )

    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req) as resp:
            elapsed_ms = (time.perf_counter() - t0) * 1000
            data = json.loads(resp.read().decode("utf-8"))

            print(f"\n⏱️  网络与推理总耗时: {elapsed_ms:.0f}ms")
            print(f"🏷️  模型版本: {data.get('model')} (Provider: {data.get('provider')})")
            usage = data.get("usage", {})
            print(f"💰 Token 消耗: 输入 {usage.get('input_tokens')} | 输出 {usage.get('output_tokens')} | 费用: ${usage.get('cost', 0):.7f}")
            print("\n🎯 [Jev 判断结果]:")

            for qid, ans in data.get("answers", {}).items():
                atype = ans.get("type")
                if atype == "noul":
                    prob = ans.get("noul", 0)
                    pct = prob * 100
                    bar = "█" * round(prob * 10) + "░" * (10 - round(prob * 10))
                    res_tag = "✅ YES" if prob >= 0.5 else "❌ NO"
                    print(f"  • [Noul: 是/否概率] {qid}: {res_tag} ({pct:.1f}%) [{bar}]")
                elif atype == "choice":
                    c = ans.get("choice")
                    conf = f"(置信度: {ans.get('confidence', 0)*100:.1f}%)" if "confidence" in ans else ""
                    print(f"  • [Choice: 分类选择] {qid}: 👉 \"{c}\" {conf}")
                    if "probabilities" in ans:
                        print(f"    概率分布: {ans['probabilities']}")
                elif atype == "score":
                    sc = ans.get("score")
                    conf = f"(置信度: {ans.get('confidence', 0)*100:.1f}%)" if "confidence" in ans else ""
                    print(f"  • [Score: 梯级评分] {qid}: 得分 {sc} / 各档概率: {ans.get('probabilities')} {conf}")

    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error {e.code}: {e.read().decode('utf-8')}")

if __name__ == "__main__":
    print("🔥 TypeSafe Jev (Python SDK/Direct Call) 测试")
    call_jev(
        title="中英文混合意图分类与紧急度评估",
        state="线上服务一直报 connection refused，请问这是怎么回事？明天要上线了紧急求助！",
        questions={
            "is_emergency": {
                "type": "noul",
                "instructions": "Does this require emergency on-call intervention?"
            },
            "category": {
                "type": "choice",
                "instructions": "Which team should investigate?",
                "criteria": {
                    "ops": "Infrastructure, networking, connection refused errors",
                    "billing": "Payment and credit issues",
                    "product": "Feature questions"
                }
            }
        }
    )
