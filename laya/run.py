"""Load the local Laya typed-decisions checkpoint and run one decision.

Checkpoint: aac6fef/laya-typed-decisions-mlx
ModernBERT-large, 421M, 1024-token context. This is the largest published
Laya checkpoint, with twice the context of the base English model.
"""

import json
import os
import time
from pathlib import Path

import mlx.core as mx
import laya_mlx as laya

DEFAULT_MODEL_DIR = Path.home() / "Documents" / "LLM_models" / "laya-typed-decisions-mlx"
MODEL_DIR = Path(os.environ.get("LAYA_MODEL_DIR", str(DEFAULT_MODEL_DIR)))

STATE = "I was billed twice for the same invoice. Please refund the duplicate charge today."
QUESTIONS = {
    "department": {
        "type": "choice",
        "instructions": "Which team should handle this request?",
        "criteria": {
            "billing": "invoices, payments, refunds",
            "technical": "bugs and outages",
            "sales": "new purchases",
        },
    },
    "urgency": {
        "type": "score",
        "instructions": "How urgent is this request?",
        "criteria": ["not urgent", "soon", "critical"],
    },
    "refund": {
        "type": "noul",
        "instructions": "Does the customer ask for money back?",
    },
}


def main() -> None:
    if not (MODEL_DIR / "model.safetensors").is_file():
        raise SystemExit(f"weights missing: {MODEL_DIR / 'model.safetensors'}")

    print(f"device={mx.default_device()}")
    print(f"model={MODEL_DIR}")

    started = time.perf_counter()
    agent = laya.load(str(MODEL_DIR), dtype="float16", device="gpu")
    load_s = time.perf_counter() - started
    print(f"load_s={load_s:.2f}")

    # First call includes graph warmup. The second call is the steady latency.
    agent.predict(STATE, QUESTIONS)
    started = time.perf_counter()
    result = agent.predict(STATE, QUESTIONS)
    infer_ms = (time.perf_counter() - started) * 1000

    answers = result["answers"]
    print(f"infer_ms={infer_ms:.1f}")
    print(json.dumps(answers, ensure_ascii=False, indent=2))

    department = answers["department"]["choice"]
    refund = answers["refund"]["noul"]
    if department != "billing" or refund < 0.5:
        raise SystemExit(
            f"unexpected decision: department={department} refund={refund}"
        )
    print("ok")


if __name__ == "__main__":
    main()
