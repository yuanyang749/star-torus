"""Dessert-counter game server.

Laya runs locally. Jev calls the TypeSafe API. Start with the project venv:

  laya/.venv/bin/python laya-jev-preview/server.py
"""

import json
import os
import threading
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

import laya_mlx as laya
from benchmark_dataset import BENCHMARK_ROUNDS, CATEGORIES  

ROOT = Path(__file__).resolve().parent
ENV_PATH = ROOT.parent / "jev-test" / ".env"
DEFAULT_MODEL_DIR = Path.home() / "Documents" / "LLM_models" / "laya-typed-decisions-mlx"
MODEL_DIR = Path(os.environ.get("LAYA_MODEL_DIR", str(DEFAULT_MODEL_DIR)))
JEV_URL = "https://api.typesafe.ai/v1/systemone"
JEV_MODEL = "jev-1.13.0"
HOST = "127.0.0.1"
PORT = 8765

ROUNDS = [
    {"text": "Serve the red strawberry with a green leafy cap.", "zh": "把顶着绿叶的红草莓递过去。", "gold": "strawberry"},
    {"text": "Hand over the bunch of purple grapes.", "zh": "把那串紫葡萄递过去。", "gold": "grape"},
    {"text": "The round orange citrus, not the berry and not the grapes.", "zh": "要圆圆的橘子，不要草莓，也不要葡萄。", "gold": "orange"},
    {"text": "A sweet red berry covered in seeds.", "zh": "一颗甜甜的、表面有籽的红莓。", "gold": "strawberry"},
    {"text": "Purple fruit that grows in a cluster.", "zh": "一串长成一挂的紫色水果。", "gold": "grape"},
    {"text": "Serve the orange.", "zh": "把橘子递过去。", "gold": "orange"},
    {"text": "Skip the grapes and the orange. Give the strawberry.", "zh": "不要葡萄和橘子，给草莓。", "gold": "strawberry"},
    {"text": "Not the red berry, and not the citrus. Serve the grapes.", "zh": "不要红莓，也不要柑橘，把葡萄递过去。", "gold": "grape"},
    {"text": "The picture shows grapes, but the fruit to hand over is the orange.", "zh": "图上画的是葡萄，但要递出去的是橘子。", "gold": "orange"},
    {"text": "Green leaves on a red seeded berry. Serve that berry.", "zh": "红莓上有绿叶，把那颗莓递过去。", "gold": "strawberry"},
    {"text": "A cluster of small purple grapes.", "zh": "一小串紫葡萄。", "gold": "grape"},
    {"text": "The citrus that is orange, not a strawberry.", "zh": "那种橙色的柑橘，不是草莓。", "gold": "orange"},
]

QUESTIONS = {
    "fruit": {
        "type": "choice",
        "instructions": "Which fruit should be handed over? Choose the fruit itself, not a picture or a fruit the request rejects.",
        "criteria": {
            "strawberry": "the red seeded berry with a green leafy cap",
            "grape": "the purple fruit that grows in a bunch",
            "orange": "the round orange citrus",
        },
    }
}

FLAVORS = ("strawberry", "grape", "orange")
FILES = {
    "/": ROOT / "index.html",
    "/index.html": ROOT / "index.html",
    "/benchmark": ROOT / "benchmark.html",
    "/benchmark.html": ROOT / "benchmark.html",
    "/html2canvas.min.js": ROOT / "html2canvas.min.js",
    "/slime-pink.png": ROOT / "slime-pink.png",
    "/slime-mint.png": ROOT / "slime-mint.png",
    "/slime-grape.png": ROOT / "slime-grape.png",
}

laya_lock = threading.Lock()
agent = None


def load_jev_key():
    if os.environ.get("JEV_API_KEY"):
        return os.environ["JEV_API_KEY"]
    if not ENV_PATH.is_file():
        return ""
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() in ("JEV_API_KEY", "Jev_API_KEY"):
            return value.strip().strip('"').strip("'")
    return ""


JEV_KEY = load_jev_key()


def normalize(choice):
    text = str(choice or "").strip().lower()
    if text in FLAVORS:
        return text
    for name in FLAVORS:
        if name in text:
            return name
    return text


def extract_choice(data):
    answers = data.get("answers")
    if answers is None and isinstance(data.get("result"), dict):
        answers = data["result"].get("answers")
    if not isinstance(answers, dict) or not answers:
        raise ValueError("response has no answers")
    fruit = answers.get("fruit")
    if fruit is None:
        fruit = next(iter(answers.values()))
    if isinstance(fruit, str):
        return normalize(fruit)
    if not isinstance(fruit, dict):
        raise ValueError("answer was not a choice")
    return normalize(fruit.get("choice") or fruit.get("label") or fruit.get("value"))


def ask_laya(text):
    with laya_lock:
        started = time.perf_counter()
        result = agent.predict(text, QUESTIONS)
        elapsed = (time.perf_counter() - started) * 1000
    return extract_choice(result), round(elapsed)


def ask_jev(text):
    if not JEV_KEY:
        raise RuntimeError("没有找到 JEV_API_KEY")
    payload = json.dumps({"state": text, "model": JEV_MODEL, "questions": QUESTIONS}).encode()

    last_error = None
    # 针对跨国公网网络波动与 SSL EOF 抖动，执行最多 3 次自动重试
    for attempt in range(3):
        started = time.perf_counter()
        request = urllib.request.Request(
            JEV_URL,
            data=payload,
            headers={"Authorization": f"Bearer {JEV_KEY}", "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(request, timeout=25) as response:
                data = json.loads(response.read().decode())
            elapsed = (time.perf_counter() - started) * 1000
            return extract_choice(data), round(elapsed)
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", "replace")[:240]
            last_error = RuntimeError(f"Jev HTTP {error.code}: {detail}")
            if error.code in (400, 401, 403):
                raise last_error from error
            print(f"[JEV RETRY {attempt+1}/3] HTTP {error.code}, 稍后重试...", flush=True)
            time.sleep(0.3 * (attempt + 1))
        except Exception as error:
            last_error = error
            print(f"[JEV RETRY {attempt+1}/3] {error}, 稍后重试...", flush=True)
            time.sleep(0.3 * (attempt + 1))

    raise last_error or RuntimeError("Jev 请求在重试 3 次后失败")


def decide(model, round_index):
    if model not in ("laya", "jev"):
        raise ValueError("model 只能是 laya 或 jev")
    if not isinstance(round_index, int) or not 0 <= round_index < len(ROUNDS):
        raise ValueError("这一轮不存在")
    card = ROUNDS[round_index]
    choice, elapsed = ask_laya(card["text"]) if model == "laya" else ask_jev(card["text"])
    return {
        "ok": True,
        "model": model,
        "choice": choice,
        "ms": elapsed,
        "gold": card["gold"],
    }


def benchmark_decide(model, round_index):
    if model not in ("laya", "jev"):
        raise ValueError("model 只能是 laya 或 jev")
    if not isinstance(round_index, int) or not 0 <= round_index < len(BENCHMARK_ROUNDS):
        raise ValueError("题目索引不存在")
    card = BENCHMARK_ROUNDS[round_index]
    started = time.perf_counter()
    try:
        choice, elapsed = ask_laya(card["text"]) if model == "laya" else ask_jev(card["text"])
        ok = True
        err_msg = None
    except Exception as error:
        elapsed = round((time.perf_counter() - started) * 1000)
        choice = "error"
        ok = False
        err_msg = str(error)
        print(f"[BENCHMARK DECIDE FAIL] {model} #{round_index+1}: {error}", flush=True)

    return {
        "ok": ok,
        "model": model,
        "round": round_index,
        "choice": choice,
        "ms": elapsed,
        "gold": card["gold"],
        "category": card["category"],
        "category_zh": card["category_zh"],
        "error": err_msg,
    }


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        if path == "/api/rounds":
            self.send_json(200, {"rounds": [{"text": item["zh"]} for item in ROUNDS]})
            return
        if path == "/api/benchmark/rounds":
            self.send_json(200, {
                "total": len(BENCHMARK_ROUNDS),
                "categories": CATEGORIES,
                "rounds": [
                    {
                        "id": item["id"],
                        "category": item["category"],
                        "category_zh": item["category_zh"],
                        "text": item["text"],
                        "zh": item["zh"],
                        "gold": item["gold"],
                    }
                    for item in BENCHMARK_ROUNDS
                ],
            })
            return
        file_path = FILES.get(path)
        if file_path is None or not file_path.is_file():
            self.send_error(404)
            return
        data = file_path.read_bytes()
        if file_path.suffix == ".html":
            kind = "text/html; charset=utf-8"
        elif file_path.suffix == ".js":
            kind = "application/javascript; charset=utf-8"
        else:
            kind = "image/png"
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/api/decide":
            length = int(self.headers.get("Content-Length", "0"))
            try:
                body = json.loads(self.rfile.read(length).decode() or "{}")
                payload = decide(body.get("model"), body.get("round"))
                print(f"{payload['model']} {payload['choice']} {payload['ms']}ms gold={payload['gold']}", flush=True)
                self.send_json(200, payload)
            except Exception as error:
                print(f"decide failed: {error}", flush=True)
                self.send_json(200, {"ok": False, "error": str(error)})
            return

        if path == "/api/benchmark/decide":
            length = int(self.headers.get("Content-Length", "0"))
            try:
                body = json.loads(self.rfile.read(length).decode() or "{}")
                payload = benchmark_decide(body.get("model"), body.get("round"))
                print(f"[BENCHMARK] {payload['model']} #{payload['round']+1} {payload['choice']} ({payload['ms']}ms) gold={payload['gold']} cat={payload['category']}", flush=True)
                self.send_json(200, payload)
            except Exception as error:
                print(f"benchmark decide failed: {error}", flush=True)
                self.send_json(200, {"ok": False, "error": str(error)})
            return

        self.send_error(404)


def main():
    global agent
    if not (MODEL_DIR / "model.safetensors").is_file():
        raise SystemExit(f"找不到 Laya 权重: {MODEL_DIR}")
    print("loading laya…", flush=True)
    agent = laya.load(str(MODEL_DIR), dtype="float16", device="gpu")
    ask_laya("Serve the orange.")
    print(f"laya ready, jev key={'yes' if JEV_KEY else 'no'}", flush=True)
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"http://{HOST}:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
