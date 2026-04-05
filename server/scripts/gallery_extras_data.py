"""4 ảnh Wikimedia bổ sung cho mỗi nhân vật (cộng ảnh chính trong figures.json = 5)."""

from __future__ import annotations

# fmt: off
EXTRAS: dict[str, list[dict[str, str]]] = {
    "shakyamuni": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Gandhara_Buddha_%28tnm%29.jpeg/960px-Gandhara_Buddha_%28tnm%29.jpeg", "alt_vi": "Tượng Phật phong cách Gandhara (bảo tàng).", "commons_file": "File:Gandhara Buddha (tnm).jpeg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Buddha_in_Sarnath_Museum_%28Dhammachakra_Mudra%29.jpg/960px-Buddha_in_Sarnath_Museum_%28Dhammachakra_Mudra%29.jpg", "alt_vi": "Tượng Phật ấn chuyển pháp luân (bảo tàng Sarnath).", "commons_file": "File:Buddha in Sarnath Museum (Dhammachakra Mudra).jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Buddha_Gaya%2C_Bodh_Gaya%2C_Bihar.jpg/960px-Buddha_Gaya%2C_Bodh_Gaya%2C_Bihar.jpg", "alt_vi": "Tượng Phật tại Bodh Gaya (Bihar, Ấn Độ).", "commons_file": "File:Buddha Gaya, Bodh Gaya, Bihar.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Buddha_%28Seated%29_-_Google_Art_Project.jpg/960px-Buddha_%28Seated%29_-_Google_Art_Project.jpg", "alt_vi": "Tượng Phật ngồi (Google Art Project).", "commons_file": "File:Buddha (Seated) - Google Art Project.jpg"},
    ],
    "amitabha": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Amida_Buddha%2C_Kamakura.jpg/960px-Amida_Buddha%2C_Kamakura.jpg", "alt_vi": "Tượng Amida (Kamakura, Nhật Bản).", "commons_file": "File:Amida Buddha, Kamakura.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Byodo-in_Uji_Japan-01s5s.jpg/960px-Byodo-in_Uji_Japan-01s5s.jpg", "alt_vi": "Chùa Bình Đẳng viện (Byōdō-in), điện Phượng Hoàng — tượng Amida.", "commons_file": "File:Byodo-in Uji Japan-01s5s.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Chion-in_Amida_Hall_Kyoto_Japan.jpg/960px-Chion-in_Amida_Hall_Kyoto_Japan.jpg", "alt_vi": "Điện Amida, Chion-in (Kyoto).", "commons_file": "File:Chion-in Amida Hall Kyoto Japan.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Amitabha_Buddha_statue_Kamakura.jpg/960px-Amitabha_Buddha_statue_Kamakura.jpg", "alt_vi": "Tượng Phật A Di Đà (Kamakura).", "commons_file": "File:Amitabha Buddha statue Kamakura.jpg"},
    ],
    "avalokiteshvara": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Guanyin_of_1000_hands_and_1000_eyes.jpg/960px-Guanyin_of_1000_hands_and_1000_eyes.jpg", "alt_vi": "Quán Âm thiên thủ thiên nhãn (tượng).", "commons_file": "File:Guanyin of 1000 hands and 1000 eyes.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Guanyin%2C_Guanyin_of_South_Sea.jpg/960px-Guanyin%2C_Guanyin_of_South_Sea.jpg", "alt_vi": "Quán Âm Nam Hải.", "commons_file": "File:Guanyin, Guanyin of South Sea.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Kannon_Minamisanjou.jpg/960px-Kannon_Minamisanjou.jpg", "alt_vi": "Quan Âm (Kannon) tại Minamisanjō.", "commons_file": "File:Kannon Minamisanjou.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Guanyin%2C_Flaying_Dragon_Statue.jpg/960px-Guanyin%2C_Flaying_Dragon_Statue.jpg", "alt_vi": "Tượng Quán Âm (phong cách điêu khắc).", "commons_file": "File:Guanyin, Flaying Dragon Statue.jpg"},
    ],
    "kshitigarbha": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Ksitigarbha_Bodhisattva_statue.jpg/960px-Ksitigarbha_Bodhisattva_statue.jpg", "alt_vi": "Tượng Địa Tạng Bồ Tát.", "commons_file": "File:Ksitigarbha Bodhisattva statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Jizo_Bosatsu.jpg/960px-Jizo_Bosatsu.jpg", "alt_vi": "Tượng Jizō Bồ Tát.", "commons_file": "File:Jizo Bosatsu.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Hase-dera_%28Kamakura%29_Jizo.jpg/960px-Hase-dera_%28Kamakura%29_Jizo.jpg", "alt_vi": "Jizō tại Hase-dera (Kamakura).", "commons_file": "File:Hase-dera (Kamakura) Jizo.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Ksitigarbha_statue.jpg/960px-Ksitigarbha_statue.jpg", "alt_vi": "Tượng Kṣitigarbha.", "commons_file": "File:Ksitigarbha statue.jpg"},
    ],
    "maitreya": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Maitreya_Bodhisattva_Statue.jpg/960px-Maitreya_Bodhisattva_Statue.jpg", "alt_vi": "Tượng Di Lặc Bồ Tát.", "commons_file": "File:Maitreya Bodhisattva Statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Laughing_Buddha_by_EO_365.jpg/960px-Laughing_Buddha_by_EO_365.jpg", "alt_vi": "Tượng Phật Di Lặc cười.", "commons_file": "File:Laughing Buddha by EO 365.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Maitreya_Buddha_statue.jpg/960px-Maitreya_Buddha_statue.jpg", "alt_vi": "Tượng Phật Di Lặc.", "commons_file": "File:Maitreya Buddha statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Budai_Hotei.jpg/960px-Budai_Hotei.jpg", "alt_vi": "Bố Đại / Hotei (Di Lặc).", "commons_file": "File:Budai Hotei.jpg"},
    ],
    "manjushri": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Manjushri_statue.jpg/960px-Manjushri_statue.jpg", "alt_vi": "Tượng Văn Thù Bồ Tát.", "commons_file": "File:Manjushri statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Manjushri_Bodhisattva_statue_Wutaishan.jpg/960px-Manjushri_Bodhisattva_statue_Wutaishan.jpg", "alt_vi": "Văn Thù tại Ngũ Đài sơn.", "commons_file": "File:Manjushri Bodhisattva statue Wutaishan.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Manjushri_sword.jpg/960px-Manjushri_sword.jpg", "alt_vi": "Văn Thù cầm kiếm trí.", "commons_file": "File:Manjushri sword.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Manjushri%2C_Monju_Bosatsu.jpg/960px-Manjushri%2C_Monju_Bosatsu.jpg", "alt_vi": "Monju Bosatsu (Văn Thù).", "commons_file": "File:Manjushri, Monju Bosatsu.jpg"},
    ],
    "samantabhadra": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Samantabhadra_statue_Emei.jpg/960px-Samantabhadra_statue_Emei.jpg", "alt_vi": "Phổ Hiền tại Nga Mi sơn.", "commons_file": "File:Samantabhadra statue Emei.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Samantabhadra_Bodhisattva.jpg/960px-Samantabhadra_Bodhisattva.jpg", "alt_vi": "Tượng Phổ Hiền Bồ Tát.", "commons_file": "File:Samantabhadra Bodhisattva.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Fugen_Elephant.jpg/960px-Fugen_Elephant.jpg", "alt_vi": "Phổ Hiền cưỡi voi (Fugen).", "commons_file": "File:Fugen Elephant.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Samantabhadra%2C_Wutaishan.jpg/960px-Samantabhadra%2C_Wutaishan.jpg", "alt_vi": "Phổ Hiền (Ngũ Đài sơn).", "commons_file": "File:Samantabhadra, Wutaishan.jpg"},
    ],
    "bhaisajyaguru": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Medicine_Buddha_statue.jpg/960px-Medicine_Buddha_statue.jpg", "alt_vi": "Tượng Dược Sư Phật.", "commons_file": "File:Medicine Buddha statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Bhaisajyaguru_Buddha.jpg/960px-Bhaisajyaguru_Buddha.jpg", "alt_vi": "Tượng Bhaiṣajyaguru.", "commons_file": "File:Bhaisajyaguru Buddha.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Medicine_Buddha_Tibet.jpg/960px-Medicine_Buddha_Tibet.jpg", "alt_vi": "Dược Sư (Tây Tạng).", "commons_file": "File:Medicine Buddha Tibet.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Yakushi_Nyorai.jpg/960px-Yakushi_Nyorai.jpg", "alt_vi": "Dược Sư Như Lai (Yakushi, Nhật Bản).", "commons_file": "File:Yakushi Nyorai.jpg"},
    ],
    "vairochana": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Vairocana_Buddha_statue.jpg/960px-Vairocana_Buddha_statue.jpg", "alt_vi": "Tượng Đại Nhật / Vairocana.", "commons_file": "File:Vairocana Buddha statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Vairocana_mandala.jpg/960px-Vairocana_mandala.jpg", "alt_vi": "Tranh mandala Vairocana.", "commons_file": "File:Vairocana mandala.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Borobudur_Vairocana.jpg/960px-Borobudur_Vairocana.jpg", "alt_vi": "Phật tại Borobudur (liên quan Pháp thân).", "commons_file": "File:Borobudur Vairocana.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Vairocana_statue_China.jpg/960px-Vairocana_statue_China.jpg", "alt_vi": "Tượng Vairocana (Trung Hoa).", "commons_file": "File:Vairocana statue China.jpg"},
    ],
    "mahasthamaprapta": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Mahasthamaprapta_Bodhisattva_statue.jpg/960px-Mahasthamaprapta_Bodhisattva_statue.jpg", "alt_vi": "Tượng Đại Thế Chí Bồ Tát.", "commons_file": "File:Mahasthamaprapta Bodhisattva statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Seishi_Bosatsu.jpg/960px-Seishi_Bosatsu.jpg", "alt_vi": "Đại Thế Chí (Seishi Bosatsu).", "commons_file": "File:Seishi Bosatsu.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahasthamaprapta_Kamakura.jpg/960px-Mahasthamaprapta_Kamakura.jpg", "alt_vi": "Đại Thế Chí (Kamakura).", "commons_file": "File:Mahasthamaprapta Kamakura.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Mahasthamaprapta_lotus.jpg/960px-Mahasthamaprapta_lotus.jpg", "alt_vi": "Đại Thế Chí cầm sen.", "commons_file": "File:Mahasthamaprapta lotus.jpg"},
    ],
    "tara": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Green_Tara_statue.jpg/960px-Green_Tara_statue.jpg", "alt_vi": "Tượng Tara Xanh.", "commons_file": "File:Green Tara statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/White_Tara_statue.jpg/960px-White_Tara_statue.jpg", "alt_vi": "Tượng Tara Trắng.", "commons_file": "File:White Tara statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tara_Bodhisattva_Nepal.jpg/960px-Tara_Bodhisattva_Nepal.jpg", "alt_vi": "Tara (Nepal).", "commons_file": "File:Tara Bodhisattva Nepal.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Tara_thangka.jpg/960px-Tara_thangka.jpg", "alt_vi": "Thangka Tara.", "commons_file": "File:Tara thangka.jpg"},
    ],
    "akshobhya": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Akshobhya_Buddha.jpg/960px-Akshobhya_Buddha.jpg", "alt_vi": "Tượng Phật A Sổ Bà (Akṣobhya).", "commons_file": "File:Akshobhya Buddha.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Akshobhya_mandala.jpg/960px-Akshobhya_mandala.jpg", "alt_vi": "Mandala Akṣobhya.", "commons_file": "File:Akshobhya mandala.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Five_Dhyani_Buddhas_Akshobhya.jpg/960px-Five_Dhyani_Buddhas_Akshobhya.jpg", "alt_vi": "Ngũ Phật — Akṣobhya.", "commons_file": "File:Five Dhyani Buddhas Akshobhya.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Akshobhya_statue_Tibet.jpg/960px-Akshobhya_statue_Tibet.jpg", "alt_vi": "Akṣobhya (Tây Tạng).", "commons_file": "File:Akshobhya statue Tibet.jpg"},
    ],
    "ratnasambhava": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Ratnasambhava_Buddha.jpg/960px-Ratnasambhava_Buddha.jpg", "alt_vi": "Tượng Ratnasambhava.", "commons_file": "File:Ratnasambhava Buddha.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Ratnasambhava_mandala.jpg/960px-Ratnasambhava_mandala.jpg", "alt_vi": "Mandala Ratnasambhava.", "commons_file": "File:Ratnasambhava mandala.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Five_Dhyani_Buddhas_Ratnasambhava.jpg/960px-Five_Dhyani_Buddhas_Ratnasambhava.jpg", "alt_vi": "Ngũ Phật — Ratnasambhava.", "commons_file": "File:Five Dhyani Buddhas Ratnasambhava.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ratnasambhava_statue.jpg/960px-Ratnasambhava_statue.jpg", "alt_vi": "Tượng Bảo Sinh Phật.", "commons_file": "File:Ratnasambhava statue.jpg"},
    ],
    "amoghasiddhi": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Amoghasiddhi_Buddha_statue.jpg/960px-Amoghasiddhi_Buddha_statue.jpg", "alt_vi": "Tượng Amoghasiddhi.", "commons_file": "File:Amoghasiddhi Buddha statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Amoghasiddhi_mandala.jpg/960px-Amoghasiddhi_mandala.jpg", "alt_vi": "Mandala Amoghasiddhi.", "commons_file": "File:Amoghasiddhi mandala.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Five_Dhyani_Buddhas_Amoghasiddhi.jpg/960px-Five_Dhyani_Buddhas_Amoghasiddhi.jpg", "alt_vi": "Ngũ Phật — Amoghasiddhi.", "commons_file": "File:Five Dhyani Buddhas Amoghasiddhi.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Amoghasiddhi_green_Buddha.jpg/960px-Amoghasiddhi_green_Buddha.jpg", "alt_vi": "Phật xanh (Amoghasiddhi).", "commons_file": "File:Amoghasiddhi green Buddha.jpg"},
    ],
    "acala": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Fudo_Myoo_statue.jpg/960px-Fudo_Myoo_statue.jpg", "alt_vi": "Tượng Fudō Myōō (Bất Động Minh Vương).", "commons_file": "File:Fudo Myoo statue.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Acala_wisdom_king.jpg/960px-Acala_wisdom_king.jpg", "alt_vi": "Minh vương Acala.", "commons_file": "File:Acala wisdom king.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Fudo_with_sword.jpg/960px-Fudo_with_sword.jpg", "alt_vi": "Fudō cầm kiếm.", "commons_file": "File:Fudo with sword.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Acala_fire_mandala.jpg/960px-Acala_fire_mandala.jpg", "alt_vi": "Acala với hỏa luân.", "commons_file": "File:Acala fire mandala.jpg"},
    ],
    "prajnaparamita": [
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Prajnaparamita_statue_Indonesia.jpg/960px-Prajnaparamita_statue_Indonesia.jpg", "alt_vi": "Tượng Bát Nhã (Indonesia).", "commons_file": "File:Prajnaparamita statue Indonesia.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Prajnaparamita_book.jpg/960px-Prajnaparamita_book.jpg", "alt_vi": "Bát Nhã cầm kinh.", "commons_file": "File:Prajnaparamita book.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Prajnaparamita_Nepal.jpg/960px-Prajnaparamita_Nepal.jpg", "alt_vi": "Prajñāpāramitā (Nepal).", "commons_file": "File:Prajnaparamita Nepal.jpg"},
        {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Prajnaparamita_lotus.jpg/960px-Prajnaparamita_lotus.jpg", "alt_vi": "Bát Nhã với hoa sen.", "commons_file": "File:Prajnaparamita lotus.jpg"},
    ],
}
# fmt: on

CREDIT_VI = "Ảnh: Wikimedia Commons — xem trang tệp trên Commons để biết tác giả và giấy phép sử dụng."
CREDIT_EN = "Image: Wikimedia Commons — see the file page on Commons for author and license."
