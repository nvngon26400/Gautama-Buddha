"""One-off helper: resolve Wikimedia Commons File: -> thumb URL. Run from repo root: python server/scripts/commons_resolve_images.py"""
from __future__ import annotations

import json
import sys
import urllib.parse
import urllib.request

UA = {"User-Agent": "GautamaBuddhaApp/1.0 (educational; https://github.com)"}


def api(params: dict[str, str]) -> dict:
    q = urllib.parse.urlencode(params)
    url = f"https://commons.wikimedia.org/w/api.php?{q}"
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def image_thumb(title: str, width: int = 720) -> str | None:
    """title e.g. File:Foo.jpg"""
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


def first_file_title(search: str) -> str | None:
    d = api(
        {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": search,
            "srnamespace": "6",
            "srlimit": "3",
        }
    )
    hits = d.get("query", {}).get("search") or []
    return hits[0]["title"] if hits else None


# Search query per figure id (Commons)
QUERIES: dict[str, str] = {
    "shakyamuni": "Gautama Buddha statue Sarnath",
    "amitabha": "Amitabha Buddha Japan statue",
    "avalokiteshvara": "Guanyin statue bodhisattva",
    "kshitigarbha": "Ksitigarbha Jizo statue",
    "maitreya": "Maitreya Buddha laughing Budai",
    "manjushri": "Manjushri bodhisattva statue",
    "samantabhadra": "Samantabhadra elephant bodhisattva",
    "bhaisajyaguru": "Bhaisajyaguru Medicine Buddha",
    "vairochana": "Vairocana Buddha statue",
    "mahasthamaprapta": "Mahasthamaprapta bodhisattva",
    "tara": "Green Tara thangka",
    "akshobhya": "Akshobhya Buddha",
    "ratnasambhava": "Ratnasambhava Buddha",
    "amoghasiddhi": "Amoghasiddhi Buddha",
    "acala": "Fudo Myoo Acala statue",
    "prajnaparamita": "Prajnaparamita statue Java",
}


def main() -> None:
    sys.stdout.reconfigure(encoding="utf-8")
    out: dict[str, dict[str, str | None]] = {}
    for fid, q in QUERIES.items():
        title = first_file_title(q)
        url = image_thumb(title) if title else None
        out[fid] = {"file": title, "thumburl": url}
        print(fid, "->", title, "\n   ", url[:90] + "..." if url and len(url) > 90 else url)
    print("\nJSON:", json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
