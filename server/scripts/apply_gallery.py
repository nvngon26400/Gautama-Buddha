"""Gắn mảng `images` (5 ảnh) vào figures.json — ưu tiên tìm trên Wikimedia Commons API.

Chạy từ thư mục repo:  python server/scripts/apply_gallery.py

Nếu API lỗi / giới hạn tốc độ, ảnh thiếu được lấp bằng bản sao ảnh chính (cùng URL).
"""
from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIGURES_PATH = ROOT / "knowledge" / "figures.json"

UA = {"User-Agent": "GautamaBuddhaGallery/1.0 (educational; local script)"}

QUERIES: dict[str, str] = {
    "shakyamuni": "Gautama Buddha statue",
    "amitabha": "Amitabha Buddha statue Japan",
    "avalokiteshvara": "Guanyin Avalokiteshvara statue",
    "kshitigarbha": "Ksitigarbha Jizo statue",
    "maitreya": "Maitreya Budai laughing Buddha",
    "manjushri": "Manjushri bodhisattva statue",
    "samantabhadra": "Samantabhadra bodhisattva statue elephant",
    "bhaisajyaguru": "Bhaisajyaguru Medicine Buddha statue",
    "vairochana": "Vairocana Buddha statue",
    "mahasthamaprapta": "Mahasthamaprapta bodhisattva",
    "tara": "Green Tara statue Buddhism",
    "akshobhya": "Akshobhya Buddha statue",
    "ratnasambhava": "Ratnasambhava Buddha statue",
    "amoghasiddhi": "Amoghasiddhi Buddha statue",
    "acala": "Fudo Myoo Acala statue",
    "prajnaparamita": "Prajnaparamita statue Java",
}

CREDIT_VI = "Ảnh: Wikimedia Commons — xem trang tệp trên Commons để biết tác giả và giấy phép sử dụng."
CREDIT_EN = "Image: Wikimedia Commons — see the file page on Commons for author and license."


def api(params: dict[str, str]) -> dict:
    q = urllib.parse.urlencode(params)
    url = f"https://commons.wikimedia.org/w/api.php?{q}"
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read().decode())


def search_file_titles(q: str, limit: int = 15) -> list[str]:
    d = api(
        {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": q,
            "srnamespace": "6",
            "srlimit": str(limit),
        }
    )
    hits = d.get("query", {}).get("search") or []
    return [h["title"] for h in hits]


def thumb_url(title: str, width: int = 960) -> str | None:
    d = api(
        {
            "action": "query",
            "format": "json",
            "titles": title,
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": str(width),
        }
    )
    pages = d.get("query", {}).get("pages", {})
    p = next(iter(pages.values()))
    if p.get("missing"):
        return None
    ii = (p.get("imageinfo") or [{}])[0]
    return ii.get("thumburl") or ii.get("url")


def build_five_images(fig: dict) -> list[dict]:
    fid = fig["id"]
    base = dict(fig["image"])
    out: list[dict] = [base]
    seen: set[str] = {base.get("url", "")}

    q = QUERIES.get(fid, fig.get("name_vi", fid))
    try:
        titles = search_file_titles(q, 20)
        time.sleep(0.35)
    except OSError:
        titles = []

    for title in titles:
        if len(out) >= 5:
            break
        try:
            u = thumb_url(title)
            time.sleep(0.25)
        except OSError:
            u = None
        if not u or u in seen:
            continue
        seen.add(u)
        out.append(
            {
                "url": u,
                "alt_vi": f"{fig['name_vi']} — minh họa từ Wikimedia Commons ({len(out) + 1}).",
                "commons_file": title,
                "credit_vi": CREDIT_VI,
                "credit_en": CREDIT_EN,
            }
        )

    n = 2
    while len(out) < 5:
        out.append(
            {
                **base,
                "alt_vi": (base.get("alt_vi") or fig["name_vi"]) + f" ({n})",
            }
        )
        n += 1

    return out[:5]


def main() -> None:
    data = json.loads(FIGURES_PATH.read_text(encoding="utf-8"))
    for fig in data:
        fig["images"] = build_five_images(fig)
        print(fig["id"], "->", len(fig["images"]), "slides")
    FIGURES_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote", FIGURES_PATH)


if __name__ == "__main__":
    main()
