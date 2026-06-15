# YURTTAŞ MUTFAKTA - Tasarım Sistemi (DesignSystem.md)

**Proje Sahibi:** Muhammet Enes Karaoğlan  
**Tarih:** 14 Haziran 2026  

Bu doküman, "Yurttaş Mutfakta" uygulamasının görsel kimliğini, renk paletini, tipografisini ve kullanıcı arayüzü (UI) bileşen kurallarını tanımlar. 

Tasarım felsefesi, yapay zeka uygulamalarının klişeleşmiş "karanlık ve soğuk (dark/neon)" temalarından tamamen arındırılmıştır. Bunun yerine uygulamanın bir "mutfak" olduğunu hissettiren; iştah açıcı, göz yormayan, samimi, sıcak ve organik pastel tonlar (bej, krem, sarı) tercih edilmiştir.

---

## 1. Renk Paleti (Color Palette)

Renk isimlendirmeleri mutfak kültüründen ilham alınarak organik ve sıcak bir hissiyat yaratacak şekilde belirlenmiştir.

### 🍞 Arka Plan ve Zemin Renkleri (Backgrounds)
Saf ve çiğ bir beyaz yerine, hamur veya süt rengini andıran, uzun süre ekrana bakıldığında gözü yormayan sıcak tonlar:

* **Sıcak Süt (Ana Zemin - Body BG):** `#FDFBF7`
    * *Kullanım:* Uygulamanın en alt katmanı. Ferah, temiz ve güneş alan bir mutfak hissi verir.
* **Yulaf Beji (Kart Zemini - Surface):** `#F4EFE6`
    * *Kullanım:* İçerisinde tariflerin ve metriklerin yer aldığı UI kartlarının ve form alanlarının arka planı.
* **Kesme Tahtası (Çizgi & Ayırıcılar):** `#E5DCC5`
    * *Kullanım:* Kartları birbirinden ayıran yumuşak kenar çizgileri (border) için.

### 🍋 Vurgu Renkleri (Accents & UI Colors)
İştah açıcı, tatlı ve enerjik pastel tonlar:

* **Tereyağı Sarısı (Primary Accent):** `#FDE047`
    * *Kullanım:* Ana eylem butonları (Örn: "Tarif Üret"), yıldız puanlamaları ve önemli vurgular. Sıcak ve davetkardır.
* **Taze Nane Yeşili (Success):** `#A3E635` veya `#86EFAC`
    * *Kullanım:* Bulaşık skorunun "Minimum" çıktığı başarılı durumlar ve bütçe dostu ibareleri. Doğallığı temsil eder.
* **Domates Kırmızısı / Kiremit (Warning/Error):** `#F87171` veya `#E28743`
    * *Kullanım:* Eksik malzeme uyarıları veya bütçe aşımlarında kullanılır. Rahatsız edici bir kırmızı değil, pişmiş bir domates veya fırın tuğlası sıcaklığındadır.

### 🫘 Metin Renkleri (Typography Colors)
Keskin ve göz yoran saf siyah (`#000000`) yerine, kahve tonları barındıran yumuşak renkler kullanılmıştır:

* **Kahve Çekirdeği (Ana Metin):** `#4B3832` Veya `#3E2723` (Başlıklar ve okunması gereken ana gövde metinleri).
* **Tarçın / Soluk Kahve (Pasif Metin):** `#8D6E63` (Alt başlıklar, placeholder'lar ve ikincil öneme sahip notlar).

---

## 2. Tipografi (Typography)

Teknik ve köşeli fontlar yerine; yuvarlak hatlı, okunması çok keyifli, şirin ve "yemek kitabı" hissiyatı veren font aileleri seçilmiştir.

### Ana Font (Başlıklar ve Butonlar): `Nunito` veya `Fredoka`
* *Gerekçe:* `Nunito`, harf uçları yuvarlatılmış (rounded), son derece tatlı, samimi ve arkadaş canlısı bir fonttur. Öğrenci dostu ve sıcak bir karakter çizer.
* **H1 (Ana Başlık):** 32px (2rem), Extra Bold (800), Satır yüksekliği 1.2
* **H2 (Kart Başlıkları):** 24px (1.5rem), Bold (700), Satır yüksekliği 1.3

### İkincil Font (Gövde Metni ve Tarif Adımları): `Lora` veya `Quicksand`
* *Gerekçe:* Tarif adımlarının uzun metinler olabileceği göz önüne alınarak gözü kaydırmayan, çok rahat okunan fontlar seçilmiştir. `Lora` kullanılırsa modern bir yemek kitabı/dergi hissi verir; `Quicksand` kullanılırsa baştan sona sevimli ve modern bir bütünlük sağlanır.
* **Body (Gövde Metni):** 16px (1rem), Medium (500), Satır yüksekliği 1.6 (Havadar ve okuması kolay).

---

## 3. Bileşen Kuralları (Component Guidelines)

UI bileşenleri, keskin ve agresif köşelerden tamamen arındırılmış, "organik" formlarda tasarlanmıştır.

### 3.1. Butonlar (Buttons)
* **Form (Şekil):** Tamamen yuvarlatılmış hap formunda (Pill-shaped, `border-radius: 9999px`) olmalıdır. Keskin köşeler mutfak konseptine aykırıdır.
* **Hover (Üzerine Gelme):** Butonun üzerine gelindiğinde rengi çok hafif koyulaşmalı ve "Tereyağı Sarısı" buton, sanki basılan yumuşak bir hamurmuş gibi hissiyat vermelidir.
* **Gölge (Drop Shadow):** Çok yumuşak, geniş alana yayılan uçuk kahverengi/bej gölgeler (`box-shadow: 0 10px 15px -3px rgba(75, 56, 50, 0.1)`) kullanılmalıdır.

### 3.2. Formlar ve Input Alanları
* **Tasarım:** Arama çubukları ve malzeme giriş alanları, arka plan rengi `Sıcak Süt` olan, etrafı kalın ve yumuşak `Kesme Tahtası` rengiyle çevrili kutular olmalıdır.
* **Odak (Focus):** Kullanıcı bir alana tıkladığında çerçeve rengi `Tereyağı Sarısı`na dönüşerek kullanıcının nerede olduğunu tatlı bir şekilde belli etmelidir.
* **Genişlik ve Boşluk (Padding):** İç boşluklar geniş ve ferah (`16px`) tutulmalıdır.

### 3.3. Metrik Kartları ve Görsel Hiyerarşi
* Kartlar, tariflerin üzerine yazıldığı "küçük not kağıtları" veya "tarif defteri sayfaları" gibi görünmelidir.
* Kartların iç boşluğu (padding) en az `24px` olmalı, köşeleri `20px` yuvarlatılmalı (soft-rounded) ve arka plandan çok ince, pastel bir gölgeyle ayrılmalıdır.
* Keskin çerçeve (border) kullanımından kaçınılmalı, renkler birbirinin içine yumuşak geçişlerle oturmalıdır.

### 3.4. Animasyonlar ve Mikro Etkileşimler (Micro-interactions)
* Yükleme (Loading) esnasında yapay zeka/robotik çarklar dönmesi yerine; sallanan bir aşçı şapkası, kaynayan küçük bir tencere veya kızaran bir ekmek dilimi gibi şirin (cute) SVG animasyonları kullanılmalıdır.
* Tarif üretilirken ekranda beliren metinler: *"Malzemeler tezgaha diziliyor..."*, *"Öğrenci bütçesi hesaplanıyor..."*, *"En az bulaşık çıkaracak yöntem bulunuyor..."* gibi samimi bir dille yazılmalıdır.
