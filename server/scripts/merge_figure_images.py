"""Merge pre-resolved Commons image URLs into figures.json — run: python server/scripts/merge_figure_images.py"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIGURES = ROOT / "knowledge" / "figures.json"

# Đã kiểm tra qua Wikimedia API (thumb 720–960px); credit: trang tệp Commons
IMAGES: dict[str, dict[str, str]] = {
    "shakyamuni": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Gautama_Buddha_first_sermon_in_Sarnath.jpg/960px-Gautama_Buddha_first_sermon_in_Sarnath.jpg",
        "commons_file": "File:Gautama Buddha first sermon in Sarnath.jpg",
        "alt_vi": "Tượng Phật Thích Ca thuyết pháp lần đầu (Sarnath, Ấn Độ).",
    },
    "amitabha": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Interior_view_of_the_Buddhist_temple_Amidado_with_a_golden_statue_of_the_Buddha_seated_Kiyomizu-dera_Kyoto_Japan.jpg/960px-Interior_view_of_the_Buddhist_temple_Amidado_with_a_golden_statue_of_the_Buddha_seated_Kiyomizu-dera_Kyoto_Japan.jpg",
        "commons_file": "File:Interior view of the Buddhist temple Amidado with a golden statue of the Buddha seated Kiyomizu-dera Kyoto Japan.jpg",
        "alt_vi": "Tượng Phật A Di Đà trong điện Amida (Kiyomizu-dera, Kyoto).",
    },
    "avalokiteshvara": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Bodhisattva_Guanyin-EO_1616-IMG_9206-gradient.jpg/960px-Bodhisattva_Guanyin-EO_1616-IMG_9206-gradient.jpg",
        "commons_file": "File:Bodhisattva Guanyin-EO 1616-IMG 9206-gradient.jpg",
        "alt_vi": "Tượng Quán Thế Âm (Quan Âm) Bồ Tát.",
    },
    "kshitigarbha": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Jizo_statue_at_Z%C5%8Dj%C5%8D-ji.jpg/960px-Jizo_statue_at_Z%C5%8Dj%C5%8D-ji.jpg",
        "commons_file": "File:Jizo statue at Zōjō-ji.jpg",
        "alt_vi": "Tượng Jizō / Địa Tạng tại chùa Zōjō-ji (Tokyo).",
    },
    "maitreya": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Budai_Icon.svg/960px-Budai_Icon.svg.png",
        "commons_file": "File:Budai Icon.svg",
        "alt_vi": "Biểu tượng Bố Đại / Di Lặc (minh họa phong cách dân gian).",
    },
    "manjushri": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_statue_of_Manjushri_Bodhisattva%2C_Macang_Monastery.jpg/960px-The_statue_of_Manjushri_Bodhisattva%2C_Macang_Monastery.jpg",
        "commons_file": "File:The statue of Manjushri Bodhisattva, Macang Monastery.jpg",
        "alt_vi": "Tượng Văn Thù Bồ Tát (tu viện Mã Tàng).",
    },
    "samantabhadra": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Samantabhadra_Bodhisattva_-_Left.jpeg/960px-Samantabhadra_Bodhisattva_-_Left.jpeg",
        "commons_file": "File:Samantabhadra Bodhisattva - Left.jpeg",
        "alt_vi": "Tượng Phổ Hiền Bồ Tát.",
    },
    "bhaisajyaguru": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/8/80/Korean_Bhaisajyaguru.jpg",
        "commons_file": "File:Korean Bhaisajyaguru.jpg",
        "alt_vi": "Tượng Dược Sư Phật (truyền thống Triều Tiên).",
    },
    "vairochana": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/e/ec/Statue_of_Vairocana_Buddha_in_T%C5%8Ddai-ji.jpg",
        "commons_file": "File:Statue of Vairocana Buddha in Tōdai-ji.jpg",
        "alt_vi": "Tượng Đại Nhật Như Lai tại Tōdai-ji (Nara, Nhật Bản).",
    },
    "mahasthamaprapta": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Mahasthamaprapta.jpg",
        "commons_file": "File:Mahasthamaprapta.jpg",
        "alt_vi": "Tượng Đại Thế Chí Bồ Tát.",
    },
    "tara": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/037_Green_Tara_Thangka_%2834342913234%29.jpg/960px-037_Green_Tara_Thangka_%2834342913234%29.jpg",
        "commons_file": "File:037 Green Tara Thangka (34342913234).jpg",
        "alt_vi": "Thangka Tara Xanh (Độ Mẫu).",
    },
    "akshobhya": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Akshobhya-Dhyani_Buddha.jpg/960px-Akshobhya-Dhyani_Buddha.jpg",
        "commons_file": "File:Akshobhya-Dhyani Buddha.jpg",
        "alt_vi": "Biểu tượng Phật A Sổ Bà (Akshobhya).",
    },
    "ratnasambhava": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Borobudur_-_Buddha_Statue_-_020_Vara_Mudra%2C_Ratnasambhava_%2811678762125%29.jpg/960px-Borobudur_-_Buddha_Statue_-_020_Vara_Mudra%2C_Ratnasambhava_%2811678762125%29.jpg",
        "commons_file": "File:Borobudur - Buddha Statue - 020 Vara Mudra, Ratnasambhava (11678762125).jpg",
        "alt_vi": "Tượng Ratnasambhava (Bảo Sinh) tại Borobudur.",
    },
    "amoghasiddhi": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Amoghasiddhi-Dhyanibuddha.jpg/960px-Amoghasiddhi-Dhyanibuddha.jpg",
        "commons_file": "File:Amoghasiddhi-Dhyanibuddha.jpg",
        "alt_vi": "Biểu tượng Phật Amoghasiddhi (Bất Không Thành Tựu).",
    },
    "acala": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Acala_statue_at_Ikebata_Mitake-jinja.jpg/960px-Acala_statue_at_Ikebata_Mitake-jinja.jpg",
        "commons_file": "File:Acala statue at Ikebata Mitake-jinja.jpg",
        "alt_vi": "Tượng Bất Động Minh Vương (Acala) tại đền Mitake.",
    },
    "prajnaparamita": {
        "url": "https://upload.wikimedia.org/wikipedia/commons/3/33/Prajnaparamita_Java.jpg",
        "commons_file": "File:Prajnaparamita Java.jpg",
        "alt_vi": "Tượng Bát Nhã Ba La Mật Đa (Java, Indonesia).",
    },
}

CREDIT_VI = (
    "Ảnh: Wikimedia Commons — xem trang tệp trên Commons để biết tác giả và giấy phép sử dụng."
)
CREDIT_EN = "Image: Wikimedia Commons — see the file page on Commons for author and license."

def main() -> None:
    data = json.loads(FIGURES.read_text(encoding="utf-8"))
    for fig in data:
        fid = fig["id"]
        if fid not in IMAGES:
            continue
        img = IMAGES[fid].copy()
        img["credit_vi"] = CREDIT_VI
        img["credit_en"] = CREDIT_EN
        fig["image"] = img
    FIGURES.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Updated", len(data), "figures with image metadata.")


if __name__ == "__main__":
    main()
