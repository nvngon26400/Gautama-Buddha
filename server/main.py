"""
Buddhist Iconography API — vision analysis (OpenAI, fallback Gemini) + local knowledge + Wikipedia summaries.
"""

from __future__ import annotations

import asyncio
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
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

KNOWLEDGE_PATH = Path(__file__).resolve().parent / "knowledge" / "figures.json"
FIGURES_EN_PATH = Path(__file__).resolve().parent / "knowledge" / "figures_en.json"

try:
    from analytics_store import get_dashboard, record_visit
except ImportError:
    from server.analytics_store import get_dashboard, record_visit


def _cors_allow_origins() -> list[str]:
    """Local dev + optional CORS_EXTRA_ORIGINS (domain tùy chỉnh, v.v.)."""
    origins = ["http://127.0.0.1:5173", "http://localhost:5173"]
    extra = os.environ.get("CORS_EXTRA_ORIGINS", "")
    if extra.strip():
        origins.extend(x.strip() for x in extra.split(",") if x.strip())
    return origins


app = FastAPI(title="Buddhist Iconography API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_allow_origins(),
    allow_origin_regex=r"https://([\w-]+\.)?vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_figures() -> list[dict[str, Any]]:
    with open(KNOWLEDGE_PATH, encoding="utf-8") as f:
        return json.load(f)


FIGURES: list[dict[str, Any]] = load_figures()
FIGURE_BY_ID: dict[str, dict[str, Any]] = {x["id"]: x for x in FIGURES}


def _load_figures_en() -> dict[str, dict[str, Any]]:
    if not FIGURES_EN_PATH.is_file():
        return {}
    try:
        with open(FIGURES_EN_PATH, encoding="utf-8") as f:
            raw = json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}
    return raw if isinstance(raw, dict) else {}


FIGURE_EN: dict[str, dict[str, Any]] = _load_figures_en()


class ImplementModel(BaseModel):
    name_vi: str = Field(default="", description="Tên pháp khí bằng tiếng Việt")
    meaning_vi: str = Field(default="", description="Ý nghĩa gợi ý")


class MudraModel(BaseModel):
    name_vi: str
    meaning_vi: str


class FigureGuessModel(BaseModel):
    figure_id: str = Field(
        description="Một id khớp kho tri thức (figures.json) hoặc unknown nếu không đủ dấu hiệu",
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
    """Fetch VI and EN extracts when titles exist (parallel) so English UI can use en."""
    titles = fig.get("wikipedia_titles") or {}
    vi_title = titles.get("vi")
    en_title = titles.get("en")

    async def one(title: str | None, lang: str) -> str | None:
        if not title:
            return None
        return await fetch_wikipedia_extract(title, lang)

    extract_vi, extract_en = await asyncio.gather(one(vi_title, "vi"), one(en_title, "en"))
    return {"vi": extract_vi, "en": extract_en}


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def _client_ip(request: Request) -> str:
    xff = request.headers.get("x-forwarded-for") or request.headers.get("X-Forwarded-For")
    if xff:
        return xff.split(",")[0].strip()[:128]
    if request.client:
        return (request.client.host or "unknown")[:128]
    return "unknown"


def _require_admin(request: Request) -> None:
    secret = os.environ.get("ADMIN_ANALYTICS_SECRET", "").strip()
    if not secret:
        raise HTTPException(status_code=503, detail="admin_analytics_disabled")
    auth = request.headers.get("authorization") or request.headers.get("Authorization") or ""
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="unauthorized")
    token = auth[7:].strip()
    if token != secret:
        raise HTTPException(status_code=401, detail="unauthorized")


@app.post("/api/analytics/visit")
async def analytics_visit(request: Request) -> dict[str, bool]:
    """Ghi một lượt mở app (gọi từ frontend). IP lấy từ X-Forwarded-For khi có proxy."""
    try:
        record_visit(_client_ip(request), request.headers.get("user-agent"))
    except OSError:
        return {"ok": False}
    return {"ok": True}


@app.get("/api/analytics/dashboard")
async def analytics_dashboard(request: Request, granularity: str = "day") -> dict[str, Any]:
    """Thống kê theo ngày / tuần / tháng / năm + lượt gần đây + top IP (cần Bearer ADMIN_ANALYTICS_SECRET)."""
    _require_admin(request)
    g = granularity if granularity in ("day", "week", "month", "year") else "day"
    try:
        return get_dashboard(g)
    except OSError:
        raise HTTPException(status_code=503, detail="analytics_storage_unavailable") from None


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
- shakyamuni: nam, tóc bọc uẩn, cà sa; Bhumisparsha / Dharmachakra / Dhyana; ít bình/liên như Quán Âm.
- amitabha: Phật Tịnh độ, Dhyana hoặc tiếp dẫn; tương đồng tướng Phật — nếu mơ hồ so với Dược Sư / Đại Nhật → confidence thấp hoặc unknown.
- avalokiteshvara: bình cam lồ, dương liễu, nữ hiền, thiên thủ; từ bi cứu khổ.
- mahasthamaprapta: thường cạnh tam thánh Tây phương; nam, sen/bình, khác Quán Âm nếu không rõ.
- kshitigarbha: trọc/mũ, tích trượng, ngọc như ý; độ chúng sinh — khác Quán Âm.
- maitreya: bụng phệ, cười, túi vải; khác Thích Ca trang nghiêm.
- manjushri: kiếm trí, kinh, sư tử (đôi khi).
- samantabhadra: voi trắng, sen, hạnh nguyện.
- bhaisajyaguru: xanh dược, bình thuốc, lưu ly; khác A Di Đà nếu không có dấu hiệu dược/Tịnh độ rõ.
- vairochana: Pháp thân / trung tâm mandala; ấn giáo pháp hoặc trí khư; tượng lớn điện chính Mật tông.
- tara: nữ, một chân duỗi, utpala/sen xanh; Tạng truyền — khác Quán Âm nếu không rõ.
- akshobhya: xanh lam, Bhumisparsha, phương Đông / Ngũ Phật.
- ratnasambhava: vàng, Varada, phương Nam / Ngũ Phật.
- amoghasiddhi: xanh lục, Abhaya, phương Bắc / Ngũ Phật.
- acala: minh vương giận tướng, lửa, kiếm, dây — khác Phật hiền từ tọa thiền.
- prajnaparamita: nữ, cầm kinh/sen — Bát Nhã hiện thân; khác Tara nếu không rõ.
Khi ảnh mờ, chỉ một phần tượng, hoặc không đủ dấu hiệu → figure_id \"unknown\", confidence ≤ 0.4.
"""


def _vision_discriminators_en() -> str:
    return """
Discriminators (only conclude when evidence matches):
- shakyamuni: male, ushnisha, robes; Bhumisparsha / Dharmachakra / Dhyana; rarely vase/lotus like Avalokiteshvara.
- amitabha: Pure Land Buddha, Dhyana or welcoming; similar Buddha form — if ambiguous vs Medicine / Vairocana → low confidence or unknown.
- avalokiteshvara: vase, willow, feminine compassionate form, thousand arms theme.
- mahasthamaprapta: often with Western Pure Land triad; male, lotus/vase; distinguish from Guanyin if unclear.
- kshitigarbha: shaved head or simple crown, khakkhara, wish-fulfilling jewel; saving beings — not Guanyin.
- maitreya: large belly, laugh, cloth bag; not solemn Shakyamuni.
- manjushri: sword of wisdom, sutra, lion (sometimes).
- samantabhadra: white elephant, lotus, vows.
- bhaisajyaguru: medicine blue, medicine bowl, lapis; not Amitabha without medicine signs.
- vairochana: dharmakaya / mandala center; teaching or wisdom mudra; main hall esoteric statues.
- tara: female, one leg extended, utpala / blue lotus; Tibetan style — not Guanyin if unclear.
- akshobhya: blue, Bhumisparsha, East / Five Buddhas.
- ratnasambhava: gold, Varada, South / Five Buddhas.
- amoghasiddhi: green, Abhaya, North / Five Buddhas.
- acala: wrathful king, fire, sword, rope — not serene seated Buddha.
- prajnaparamita: female, book/lotus — Prajnaparamita embodiment; not Tara if unclear.
If the image is blurry, partial, or insufficient cues → figure_id \"unknown\", confidence ≤ 0.4.
"""


def vision_prompt(locale: str) -> str:
    allowed = ", ".join(sorted(FIGURE_BY_ID.keys())) + ", unknown"
    if locale == "en":
        disc = _vision_discriminators_en()
        return f"""Attached image: a Buddha or bodhisattva statue or painting (may be blurry, tilted, or illustrative).

Steps (think carefully before fixing figure_id):
1) List ONLY what is clearly visible: posture, number of arms, left/right hands, held objects, headgear/hair, salient colors, background.
2) Match the discriminators below. If several possibilities, pick the strongest or \"unknown\".
3) Do not list implements not visible in the image. If hands are unclear, do not guess the mudra — use \"Undetermined\" for name and meaning.

{disc}

Return exactly ONE JSON object (no markdown, no ```), schema (keys MUST match; all string VALUES must be in English):
{{
  "figure": {{
    "figure_id": "one of: {allowed}",
    "name_vi": "display name in English (field name is legacy; content must be English)",
    "confidence": number 0-1 (lower if ambiguous)",
    "notes_vi": "2-4 sentences: reasoning + what remains uncertain (English)",
    "visual_evidence_vi": ["each item: one concrete observation from the image (English)", "..."]
  }},
  "mudra": {{ "name_vi": "English", "meaning_vi": "English" }},
  "implements": [{{ "name_vi": "English", "meaning_vi": "English" }}],
  "mindfulness_bridge_vi": "2-5 sentences linking the iconography to everyday mindfulness (English); no fortune-telling.",
  "caveats_vi": "1-2 sentences on limits of the photo and educational use (English)."
}}
Rules: visual_evidence_vi must be short sentences tied to the image; if unsure → figure_id \"unknown\", low confidence."""

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


def vision_system(locale: str) -> str:
    if locale == "en":
        return (
            "You are a scholar of Buddhist art and iconography. "
            "Prioritize visual evidence; avoid confident claims without support. "
            "Reply in the requested JSON; all user-facing strings must be in English."
        )
    return (
        "Bạn là học giả nghệ thuật Phật giáo và biểu tượng học. "
        "Luôn ưu tiên quan sát hình ảnh trước, tránh khẳng định khi thiếu bằng chứng. "
        "Trả lời theo yêu cầu JSON; ngôn ngữ: tiếng Việt."
    )


def _parse_vision_json(raw: str) -> VisionAnalysisModel:
    if not raw or not str(raw).strip():
        raise ValueError("empty_model_response")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"invalid_model_json: {e}") from e
    try:
        return VisionAnalysisModel.model_validate(data)
    except Exception as e:
        raise ValueError(f"invalid_model_json: {e}") from e


async def _vision_openai(image_bytes: bytes, mime: str, locale: str) -> tuple[VisionAnalysisModel, str, float]:
    from openai import AsyncOpenAI

    api_key = os.environ["OPENAI_API_KEY"]
    b64 = base64.standard_b64encode(image_bytes).decode("ascii")
    data_url = f"data:{mime};base64,{b64}"
    model = os.environ.get("OPENAI_VISION_MODEL", "gpt-4o")
    temperature = float(os.environ.get("OPENAI_TEMPERATURE", "0.25"))
    client = AsyncOpenAI(api_key=api_key)
    completion = await client.chat.completions.create(
        model=model,
        temperature=temperature,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": vision_system(locale)},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": vision_prompt(locale)},
                    {"type": "image_url", "image_url": {"url": data_url, "detail": "high"}},
                ],
            },
        ],
        max_tokens=2200,
    )
    raw = completion.choices[0].message.content
    return _parse_vision_json(raw or ""), model, temperature


async def _vision_gemini(image_bytes: bytes, mime: str, locale: str) -> tuple[VisionAnalysisModel, str, float]:
    import google.generativeai as genai

    api_key = os.environ["GEMINI_API_KEY"]
    model_name = os.environ.get("GEMINI_VISION_MODEL", "gemini-1.5-flash")
    temperature = float(
        os.environ.get("GEMINI_TEMPERATURE", os.environ.get("OPENAI_TEMPERATURE", "0.25"))
    )

    def _sync_call() -> str:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=vision_system(locale),
        )
        response = model.generate_content(
            [
                vision_prompt(locale),
                {"mime_type": mime, "data": image_bytes},
            ],
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                response_mime_type="application/json",
                max_output_tokens=2200,
            ),
        )
        if not response.candidates:
            raise ValueError("empty_or_blocked_gemini_response")
        try:
            text = response.text
        except ValueError as e:
            raise ValueError("empty_or_blocked_gemini_response") from e
        if not text or not text.strip():
            raise ValueError("empty_model_response")
        return text

    raw = await asyncio.to_thread(_sync_call)
    return _parse_vision_json(raw), model_name, temperature


def _figure_display_name(base: dict[str, Any], locale: str) -> str:
    if locale != "en":
        return str(base.get("name_vi") or "")
    for n in base.get("names_other") or []:
        if not n or not isinstance(n, str):
            continue
        if all(ord(c) < 128 or c.isspace() for c in n):
            return n.strip()
    if base.get("names_other"):
        return str(base["names_other"][0])
    return str(base.get("name_vi") or "")


def merge_kb_with_guess(
    guess: FigureGuessModel,
    locale: str,
    wiki: dict[str, str | None] | None,
) -> dict[str, Any]:
    base = FIGURE_BY_ID.get(guess.figure_id)
    if not base:
        return {
            "figure": guess.model_dump(),
            "knowledge": None,
        }
    en_overlay = FIGURE_EN.get(guess.figure_id) or {}
    w = wiki or {}

    if locale == "en":
        display_name = _figure_display_name(base, "en")
        summary = (
            w.get("en")
            or (en_overlay.get("summary") if isinstance(en_overlay.get("summary"), str) else None)
            or base["summary_vi"]
        )
        mudras = en_overlay.get("mudras_common") or base["mudras_common_vi"]
        implements = en_overlay.get("implements") or base.get("implements_vi") or []
        mindfulness = (
            (en_overlay.get("mindfulness_hint") if isinstance(en_overlay.get("mindfulness_hint"), str) else None)
            or base["mindfulness_hint_vi"]
        )
    else:
        display_name = base["name_vi"]
        summary = base["summary_vi"]
        mudras = base["mudras_common_vi"]
        implements = base.get("implements_vi") or []
        mindfulness = base["mindfulness_hint_vi"]

    return {
        "figure": guess.model_dump(),
        "knowledge": {
            "id": base["id"],
            "display_name": display_name,
            "summary": summary,
            "mudras_common": mudras,
            "implements": implements,
            "mindfulness_hint": mindfulness,
        },
    }


def _norm_locale(locale: str | None) -> str:
    return "en" if locale == "en" else "vi"


@app.post("/api/analyze")
async def analyze(
    file: UploadFile = File(...),
    locale: str = Form("vi"),
) -> dict[str, Any]:
    loc = _norm_locale(locale)
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="file_must_be_image")
    body = await file.read()
    if len(body) > 12 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="image_too_large_max_12mb")

    mime = file.content_type or "image/jpeg"

    openai_key = os.environ.get("OPENAI_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not openai_key and not gemini_key:
        msg_vi = "OPENAI_API_KEY hoặc GEMINI_API_KEY chưa được cấu hình trên server."
        msg_en = "OPENAI_API_KEY or GEMINI_API_KEY is not configured on the server."
        hint_vi = "Thêm ít nhất một khóa vào server/.env hoặc dùng tab Thư viện để xem tri thức cục bộ."
        hint_en = "Add at least one API key in server/.env, or use the Library tab for local knowledge."
        return {
            "ok": False,
            "vision": False,
            "locale": loc,
            "message": msg_en if loc == "en" else msg_vi,
            "message_vi": msg_vi,
            "hint": hint_en if loc == "en" else hint_vi,
            "hint_vi": hint_vi,
        }

    openai_err: str | None = None
    parsed: VisionAnalysisModel | None = None
    model_used: str | None = None
    temp_used: float | None = None
    vision_provider: str | None = None
    vision_fallback_note: str | None = None

    if openai_key:
        try:
            parsed, model_used, temp_used = await _vision_openai(body, mime, loc)
            vision_provider = "openai"
        except Exception as e:
            openai_err = str(e)

    if parsed is None and gemini_key:
        try:
            parsed, model_used, temp_used = await _vision_gemini(body, mime, loc)
            vision_provider = "gemini"
            if openai_err:
                snippet = openai_err[:280] + ("…" if len(openai_err) > 280 else "")
                vision_fallback_note = (
                    f"Switched to Gemini because OpenAI was unavailable ({snippet})."
                    if loc == "en"
                    else f"Đã chuyển sang Gemini vì OpenAI không khả dụng ({snippet})."
                )
        except Exception as e:
            gemini_err = str(e)
            if openai_err:
                raise HTTPException(
                    status_code=502,
                    detail=f"OpenAI: {openai_err}; Gemini: {gemini_err}",
                ) from e
            raise HTTPException(status_code=502, detail=f"Gemini: {gemini_err}") from e

    if parsed is None or model_used is None or temp_used is None or vision_provider is None:
        err = openai_err or "unknown error"
        msg_vi = f"Phân tích ảnh thất bại (OpenAI): {err}"
        msg_en = f"Image analysis failed (OpenAI): {err}"
        hint_vi = "Cấu hình GEMINI_API_KEY để tự động dùng Gemini khi OpenAI lỗi, hoặc kiểm tra khóa và mạng."
        hint_en = "Set GEMINI_API_KEY to fall back to Gemini when OpenAI fails, or check keys and network."
        return {
            "ok": False,
            "vision": False,
            "locale": loc,
            "message": msg_en if loc == "en" else msg_vi,
            "message_vi": msg_vi,
            "hint": hint_en if loc == "en" else hint_vi,
            "hint_vi": hint_vi,
        }

    wiki: dict[str, str | None] | None = None
    if parsed.figure.figure_id in FIGURE_BY_ID:
        wiki = await wikipedia_for_figure(FIGURE_BY_ID[parsed.figure.figure_id])
    merged = merge_kb_with_guess(parsed.figure, loc, wiki)

    return {
        "ok": True,
        "vision": True,
        "locale": loc,
        "vision_provider": vision_provider,
        "vision_fallback_note": vision_fallback_note,
        "model_used": model_used,
        "temperature": temp_used,
        "analysis": parsed.model_dump(),
        "merged": merged,
        "wikipedia": wiki,
    }
