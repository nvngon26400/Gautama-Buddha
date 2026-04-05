"""
Buddhist Iconography API — vision analysis (OpenAI) + local knowledge + Wikipedia summaries.
"""

from __future__ import annotations

import base64
import json
import os
from pathlib import Path
from typing import Any
from urllib.parse import quote

from dotenv import load_dotenv

_SERVER_DIR = Path(__file__).resolve().parent
load_dotenv(_SERVER_DIR / ".env")

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

KNOWLEDGE_PATH = Path(__file__).resolve().parent / "knowledge" / "figures.json"

app = FastAPI(title="Buddhist Iconography API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_figures() -> list[dict[str, Any]]:
    with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
        return json.load(f)


FIGURES: list[dict[str, Any]] = load_figures()
FIGURE_BY_ID: dict[str, dict[str, Any]] = {x["id"]: x for x in FIGURES}


class ImplementModel(BaseModel):
    name_vi: str = Field(default="", description="Tên pháp khí bằng tiếng Việt")
    meaning_vi: str = Field(default="", description="Ý nghĩa gợi ý")


class MudraModel(BaseModel):
    name_vi: str
    meaning_vi: str


class FigureGuessModel(BaseModel):
    figure_id: str = Field(
        description="Một trong các id: shakyamuni, amitabha, avalokiteshvara, kshitigarbha, maitreya, manjushri, samantabhadra, bhaisajyaguru, hoặc unknown"
    )
    name_vi: str
    confidence: float = Field(ge=0, le=1)
    notes_vi: str
    visual_evidence_vi: list[str] = Field(
        default_factory=list,
        description="3–8 ý quan sát cụ thể từ ảnh (tư thế, tay, đầu, áo, pháp khí, bối cảnh)",
    )

    @field_validator("visual_evidence_vi", mode="before")
    @classmethod
    def coerce_visual_evidence(cls, v: Any) -> list[str]:
        if v is None:
            return []
        if isinstance(v, str):
            parts = [s.strip() for s in v.replace(";", "\n").split("\n") if s.strip()]
            return parts if parts else [v.strip()] if v.strip() else []
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        return []


class VisionAnalysisModel(BaseModel):
    figure: FigureGuessModel
    mudra: MudraModel
    implements: list[ImplementModel]
    mindfulness_bridge_vi: str
    caveats_vi: str


async def fetch_wikipedia_extract(title: str, lang: str) -> str | None:
    safe = quote(title.replace(" ", "_"), safe="")
    url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{safe}"
    async with httpx.AsyncClient(timeout=12.0) as client:
        r = await client.get(url)
        if r.status_code != 200:
            return None
        data = r.json()
        return data.get("extract")


async def wikipedia_for_figure(fig: dict[str, Any]) -> dict[str, str | None]:
    titles = fig.get("wikipedia_titles") or {}
    vi_title = titles.get("vi")
    en_title = titles.get("en")
    extract_vi = await fetch_wikipedia_extract(vi_title, "vi") if vi_title else None
    extract_en = None
    if not extract_vi and en_title:
        extract_en = await fetch_wikipedia_extract(en_title, "en")
    return {"vi": extract_vi, "en": extract_en}


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/figures")
async def list_figures() -> list[dict[str, Any]]:
    """Danh sách nhân vật trong kho tri thức cục bộ (không gọi Wikipedia)."""
    return [
        {
            "id": f["id"],
            "name_vi": f["name_vi"],
            "summary_vi": f["summary_vi"],
        }
        for f in FIGURES
    ]


@app.get("/api/figures/{figure_id}")
async def get_figure(figure_id: str, include_wiki: bool = True) -> dict[str, Any]:
    fig = FIGURE_BY_ID.get(figure_id)
    if not fig:
        raise HTTPException(status_code=404, detail="unknown_figure_id")
    out = dict(fig)
    if include_wiki:
        out["wikipedia"] = await wikipedia_for_figure(fig)
    return out


def _vision_discriminators() -> str:
    """Gợi ý phân biệt giữa các nhân vật trong kho — giúp model ít nhầm hơn."""
    return """
Gợi ý phân biệt (ưu tiên chỉ kết luận khi khớp dấu hiệu):
- shakyamuni: tượng nam, tóc bọc uẩn (snail curls), áo cà sa; thường Bhumisparsha (chạm đất), Dharmachakra (chuyển pháp luân), Dhyana; ít cầm bình/liên như Quán Âm.
- amitabha: Đại thừa, tương đồng Phật giác ngộ; thường Dhyana/Ấn tiếp dẫn; đôi khi cầm bình nhỏ tùy trường phái — nếu chỉ thấy tọa thiền chung chung và không có Quán Âm/Bồ Tát từ bi rõ → confidence vừa/thấp hoặc unknown.
- avalokiteshvara (Quán Âm): hay có bình cam lồ / cành dương / tượng nữ hiền từ hoặc nhiều tay (thiên thủ); biểu tượng từ bi cứu khổ.
- kshitigarbha: đầu trọc hoặc mũ đặc trưng, cầm tích trượng, ngọc như ý; hay gắn địa ngục/độ sinh — khác Quán Âm (bình/liên).
- maitreya: bụng phệ, tươi cười, túi vải; khác Phật Thích Ca trang nghiêm.
- manjushri: kiếm trí tuệ, kinh sách, có khi cưỡi sư tử (tùy ảnh).
- samantabhadra: voi trắng, hoa sen, hạnh nguyện rộng.
- bhaisajyaguru (Dược Sư): lưu ly / màu xanh dược, cầm bình dược; khác A Di Đà thuần tọa thiền nếu không rõ dấu hiệu dược.
Khi ảnh mờ, chỉ một phần tượng, hoặc tranh minh họa không đủ dấu hiệu → figure_id \"unknown\", confidence ≤ 0.4.
"""


def vision_prompt() -> str:
    allowed = ", ".join(sorted(FIGURE_BY_ID.keys())) + ", unknown"
    disc = _vision_discriminators()
    return f"""Ảnh đính kèm: tượng hoặc tranh Phật/Bồ Tát (có thể mờ, xiên, hoặc minh họa).

Làm theo thứ tự (suy nghĩ kỹ trước khi chốt figure_id):
1) Liệt kê CHỈ những gì nhìn thấy rõ: tư thế, số cánh tay, tay trái/phải, vật cầm, mũ/tóc, màu sắc nổi bật, bối cảnh.
2) So khớp với gợi ý phân biệt bên dưới. Nếu nhiều khả năng, chọn khả năng mạnh nhất hoặc \"unknown\".
3) Không liệt kê pháp khí nếu không nhìn thấy trong ảnh. Không đoán tên mudra nếu tay không rõ — dùng \"Không xác định\".

{disc}

Trả về ĐÚNG một JSON object (không markdown, không tiền tố ```), schema:
{{
  "figure": {{
    "figure_id": "một trong: {allowed}",
    "name_vi": "tên hiển thị tiếng Việt",
    "confidence": số 0-1 (thấp nếu mơ hồ)",
    "notes_vi": "2-4 câu: tóm tắt lập luận + điểm còn mơ hồ",
    "visual_evidence_vi": ["mỗi phần tử là một quan sát cụ thể từ ảnh", "..."]
  }},
  "mudra": {{ "name_vi": "...", "meaning_vi": "..." }},
  "implements": [{{ "name_vi": "...", "meaning_vi": "..." }}],
  "mindfulness_bridge_vi": "2-5 câu nối biểu tượng với chánh niệm đời thường, không tiên tri, không thần bí hóa.",
  "caveats_vi": "1-2 câu về giới hạn ảnh và học tập."
}}
Quy tắc: visual_evidence_vi phải là các câu ngắn bám sát ảnh; nếu không chắc → figure_id \"unknown\", confidence thấp."""


async def analyze_with_openai(image_bytes: bytes, mime: str) -> tuple[VisionAnalysisModel, str, float]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY chưa được cấu hình trên server.",
        )
    from openai import OpenAI

    b64 = base64.standard_b64encode(image_bytes).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"

    model = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o")
    temperature = float(os.environ.get("OPENAI_TEMPERATURE", "0.25"))

    system = (
        "Bạn là học giả nghệ thuật Phật giáo và biểu tượng học. "
        "Luôn ưu tiên quan sát hình ảnh trước, tránh khẳng định khi thiếu bằng chứng. "
        "Trả lời theo yêu cầu JSON; ngôn ngữ: tiếng Việt."
    )

    client = OpenAI(api_key=api_key)
    completion = client.chat.completions.create(
        model=model,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": vision_prompt()},
                    {"type": "image_url", "image_url": {"url": data_url, "detail": "high"}},
                ],
            },
        ],
        max_tokens=2200,
    )
    raw = completion.choices[0].message.content
    if not raw:
        raise HTTPException(status_code=502, detail="empty_model_response")
    try:
        data = json.loads(raw)
        return VisionAnalysisModel.model_validate(data), model, temperature
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"invalid_model_json: {e!s}") from e


def merge_kb_with_guess(guess: FigureGuessModel) -> dict[str, Any]:
    base = FIGURE_BY_ID.get(guess.figure_id)
    if not base:
        return {
            "figure": guess.model_dump(),
            "knowledge": None,
        }
    return {
        "figure": guess.model_dump(),
        "knowledge": {
            "id": base["id"],
            "name_vi": base["name_vi"],
            "summary_vi": base["summary_vi"],
            "mudras_common_vi": base["mudras_common_vi"],
            "implements_vi": base["implements_vi"],
            "mindfulness_hint_vi": base["mindfulness_hint_vi"],
        },
    }


@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...)) -> dict[str, Any]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="file_must_be_image")
    body = await file.read()
    if len(body) > 12 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="image_too_large_max_12mb")

    mime = file.content_type
    try:
        parsed, model_used, temp_used = await analyze_with_openai(body, mime)
    except HTTPException as e:
        if e.status_code == 503:
            return {
                "ok": False,
                "vision": False,
                "message_vi": str(e.detail),
                "hint_vi": "Chạy server với biến môi trường OPENAI_API_KEY hoặc dùng tab Thư viện để xem tri thức cục bộ.",
            }
        raise

    merged = merge_kb_with_guess(parsed.figure)
    wiki: dict[str, str | None] | None = None
    if parsed.figure.figure_id in FIGURE_BY_ID:
        wiki = await wikipedia_for_figure(FIGURE_BY_ID[parsed.figure.figure_id])

    return {
        "ok": True,
        "vision": True,
        "model_used": model_used,
        "temperature": temp_used,
        "analysis": parsed.model_dump(),
        "merged": merged,
        "wikipedia": wiki,
    }
