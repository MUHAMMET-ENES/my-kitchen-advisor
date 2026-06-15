\# YURTTAŞ MUTFAKTA



\## Kapsamlı Proje Gereksinim Dokümanı (PRD)



\*\*Proje Sahibi:\*\* Muhammet Enes Karaoğlan

\*\*Tarih:\*\* 14 Haziran 2026

\*\*Durum:\*\* V1 (MVP) - Sürüme Hazır



\---



\# 1. Yönetici Özeti \& Vizyon (Executive Summary)



\*\*Yurttaş Mutfakta\*\*, geleneksel yemek tarifi uygulamalarının lüks ve donanımlı mutfak varsayımlarını yıkan; öğrenci yurtları, apartlar ve kısıtlı donanıma sahip yaşam alanları için özel olarak tasarlanmış, yapay zeka tabanlı bir mutfak asistanıdır.



Projenin vizyonu; kısıtlı bütçe, dar zaman, yetersiz ekipman (sadece kettle veya tost makinesi) ve bulaşık yıkama zorluğu gibi öğrenci hayatının gerçek problemlerini, Büyük Dil Modellerinin (LLM) veri işleme gücünü kullanarak çözmektir.



Uygulama statik bir bilgi deposu değil, kullanıcının o anki durumuna (vizeler, ay sonu parasızlığı, dolapta kalan son malzemeler vb.) göre dinamik kararlar alan proaktif bir araçtır.



\---



\# 2. Problem Tanımı ve Fırsat Alanı



Öğrenci ekosisteminde beslenme ve mutfak yönetimi aşağıdaki kök sorunlar nedeniyle büyük bir stres kaynağıdır:



\## 2.1 Katı Ekipman Kısıtları



İnternetteki "kolay" tarifler bile genellikle ocak, fırın veya mikser gerektirir. Birçok öğrencinin erişimi sadece ısıtıcı cihazlarla (kettle, tost makinesi) sınırlıdır.



\## 2.2 Ay Sonu Bütçe Darboğazı



Öğrencilerin malzeme satın alırken porsiyonlamayı ayarlayamaması bütçeyi hızla tüketir. Ortak yemeklerde maliyetin adil bölüşülememesi sosyal sürtüşmelere yol açar.



\## 2.3 Bulaşık Yükü ve Ortak Alan Problemleri



Yurtlarda mutfak ve lavabo kullanımı zordur. Öğrenciler lezzetten çok minimum bulaşık çıkaran yöntemleri ararlar.



\## 2.4 Zaman ve Enerji Optimizasyonu



Yoğun sınav ve proje dönemlerinde öğrencinin uykusunu getirmeyecek, pratik ve enerji veren besinlere ihtiyacı vardır.



\## 2.5 Gıda İsrafı



Elde kalan az miktardaki uyumsuz malzemenin nasıl değerlendirileceği bilinmediği için gıda çöpe gider.



\---



\# 3. Kullanıcı Personaları (User Personas)



\## Persona 1: "Maratoncu" Deniz



\* \*\*Yaş:\*\* 20

\* \*\*Bölüm:\*\* Bilgisayar Mühendisliği



\### Durum



Finallere çalışıyor veya bir yazılım projesi yetiştiriyor. Gece saat 03:00.



\### İmkanlar



Odasında gizlice kullandığı bir tost makinesi var.



\### İhtiyaç



Uyku getirmeyecek, ağır karbonhidrat içermeyen, hemen hazırlanacak ve en fazla 1 tabak kirletecek bir atıştırmalık.



\### Beklenti



> "Bana ne yapacağımı hızlıca söyle, bulaşıkla uğraştırma."



\---



\## Persona 2: "Ay Sonu" Canan \& Ayşe



\* \*\*Yaş:\*\* 21

\* \*\*Durum:\*\* KYK yurdu öğrencileri



\### Durum



Ayın bitmesine 5 gün var, bütçeleri suyunu çekmiş.



\### İmkanlar



Ortak mutfakta bir elektrikli ocak.



\### Ellerindeki Malzemeler



\* Bayat ekmek

\* Bir miktar peynir

\* 2 yumurta



\### İhtiyaç



\* İsrafı önlemek

\* İki kişiyi doyurmak

\* Maliyeti adil şekilde paylaşmak



\---



\# 4. Ürün Kapsamı ve Epic'ler (Functional Requirements)



\## Epic 1: Akıllı Parametre Girişi



\### US 1.1 - Malzeme Seçimi



Kullanıcı elindeki malzemeleri:



\* Serbest metin

\* Etiket (tag) sistemi



ile sisteme girebilmelidir.



\### US 1.2 - Katı Ekipman Filtresi



Kullanıcı aşağıdaki seçeneklerden birini seçebilmelidir:



\* Sadece Kettle

\* Sadece Tost Makinesi

\* Mikrodalga

\* Ortak Ocak



Sistem seçilen ekipmanın dışına asla çıkmamalıdır.



\### US 1.3 - Kişi Sayısı



Kullanıcı porsiyon ve maliyet hesaplaması için kişi sayısını belirleyebilmelidir.



\---



\## Epic 2: AI Destekli Öğrenci Metrikleri Kartları



\### US 2.1 - Bulaşık Skoru



Çıktıda aşağıdaki bilgiler verilmelidir:



\* Sadece 1 Kupa

\* 2 Tabak + 1 Çatal

\* vb.



\### US 2.2 - Tokluk ve Enerji Endeksi



Tarifin:



\* Kaç saat tok tutacağı

\* Uyku yapıp yapmayacağı



belirtilmelidir.



\### US 2.3 - Finansal Bölüşüm (IBAN Çarpanı)



Sistem:



1\. Tahmini toplam maliyeti hesaplamalı,

2\. Kişi sayısına bölmeli,

3\. Kişi başı tutarı göstermelidir.



\---



\## Epic 3: Gelişmiş Öğrenci Modları



\### US 3.1 - Yokluk (İkame) Asistanı



Örnek:



\* Süt yoksa → Su kullan

\* Kaşar yoksa → Beyaz peynir kullan



gibi alternatifler sunulmalıdır.



\### US 3.2 - Dünden Kalanlar Modu



Örnek:



\* Dünkü sade makarna

\* Kalan pilav

\* Bayat ekmek



yeni tariflere dönüştürülebilmelidir.



\---



\## Epic 4: Sosyal Paylaşım ve Kişiselleştirme



\### US 4.1 - WhatsApp Entegrasyonu



Kullanıcı aşağıdaki bilgileri paylaşabilmelidir:



\* Eksik malzemeler

\* Kişi başı maliyet



tek tıklamayla WhatsApp mesajı olarak gönderilebilmelidir.



\### US 4.2 - Yurttaş Notları (Local Storage)



Kullanıcı:



\* 1–5 yıldız verebilmeli,

\* Kendine özel notlar bırakabilmeli,



Örnek:



> "Bir dahakine tuzu az at."



\---



\# 5. Yapay Zeka Stratejisi ve Prompt Mühendisliği



Projedeki LLM bir metin üreticisi değil, veri işleme ve karar motoru olarak kullanılmaktadır.



\## Sistem Promptu Mimarisi



Model:



> Öğrenci Beslenme ve Bütçe Uzmanı



rolüne sahip olacaktır.



\### Katı Kurallar



\* Seçilen ekipman dışında araç önerme.

\* Lüks malzemeler önerme.

\* Öğrenci bütçesini aşan tarif oluşturma.



\## Kısıtlanmış Çıktı (Constrained Generation)



Frontend'in güvenilir çalışabilmesi için LLM yalnızca doğrulanabilir JSON çıktısı üretmelidir.



\---



\# 6. Veri Modeli ve Beklenen JSON Çıktısı



```json

{

&#x20; "tarif\_meta": {

&#x20;   "tarif\_adi": "String",

&#x20;   "kullanilan\_ekipman": "String",

&#x20;   "kisi\_sayisi": "Integer"

&#x20; },

&#x20; "hazirlanis": {

&#x20;   "adimlar": \[

&#x20;     "Array of Strings"

&#x20;   ],

&#x20;   "puf\_noktasi": "String"

&#x20; },

&#x20; "ogrenci\_metrikleri": {

&#x20;   "bulasik\_skoru": {

&#x20;     "derece": "String",

&#x20;     "kirlenecekler\_listesi": "String"

&#x20;   },

&#x20;   "maliyet\_analizi": {

&#x20;     "tahmini\_toplam\_maliyet\_tl": "Integer",

&#x20;     "kisi\_basi\_dusen\_tl": "Integer"

&#x20;   },

&#x20;   "zaman\_yonetimi": {

&#x20;     "hazirlik\_suresi\_dk": "Integer",

&#x20;     "toplam\_sure\_dk": "Integer"

&#x20;   },

&#x20;   "tokluk\_ve\_enerji": "String"

&#x20; },

&#x20; "sosyal\_paylasim": {

&#x20;   "eksik\_malzemeler": \[

&#x20;     "Array of Strings"

&#x20;   ],

&#x20;   "whatsapp\_sablon\_mesaji": "String"

&#x20; }

}

```



\---



\# 7. Sistem Mimarisi ve Entegrasyon (Decoupled Architecture)



\## Frontend Katmanı



\### Sorumluluklar



\* Mobile-first tasarım

\* JSON parsing

\* Dinamik kartlar

\* İlerleme çubukları

\* Etkileşimli listeler



\### State Management



```text

localStorage

```



kullanılarak:



\* kullanıcı notları,

\* yıldız puanları,

\* tercih bilgileri



saklanacaktır.



\---



\## Backend Katmanı



\### Örnek Endpoint



```http

POST /api/v1/generate-recipe

```



\### Sorumluluklar



\* İstekleri almak

\* Prompt oluşturmak

\* LLM'e göndermek

\* JSON doğrulamak

\* Frontend'e yanıt döndürmek



\### Güvenlik



API anahtarları:



```env

.env

```



dosyasında saklanacaktır.



Hiçbir şekilde istemci tarafına gönderilmeyecektir.



\---



\# 8. Fonksiyonel Olmayan Gereksinimler (NFRs)



\## Performans



\* Minimum kütüphane kullanımı

\* Küçük boyutlu asset'ler

\* API yanıt süresi: 5–8 saniye



\## Erişilebilirlik (A11y)



\* W3C standartlarına uyum

\* Renk körlüğü dostu tasarım

\* Metinsel hata mesajları



\## Hata Yönetimi



Örnek hata mesajı:



> "Yurttaş mutfakta ufak bir kaza oldu, malzemeleri tekrar ocağa koyuyoruz..."



\---



\# 9. Risk Yönetimi ve Darboğazlar



| Risk Faktörü       | Olasılık | Etki   | Önlem                                  |

| ------------------ | -------- | ------ | -------------------------------------- |

| LLM Halüsinasyonu  | Orta     | Yüksek | Sistem promptu ile kısıtlama           |

| API Format Kayması | Düşük    | Yüksek | JSON doğrulama                         |

| Prompt Injection   | Düşük    | Orta   | Input sanitization ve regex filtreleme |



\---



\# 10. Gelecek Yol Haritası (Roadmap)



\## V2 - Barkod \& Fiş Tarama Sistemi



\### Özellikler



\* OCR desteği

\* Fiş tarama

\* Otomatik envanter oluşturma



Desteklenecek marketler:



\* BİM

\* A101

\* ŞOK



\---



\## V2 - Öğrenci Sosyal Pazarı (Takas)



Örnek ilan:



> "Bende yarım paket un var, 2 yumurta ile takas edilir."



Öğrencilerin aynı yurt içerisinde malzeme paylaşımı yapmasını sağlar.



\---



\## V3 - Gamification (Oyunlaştırma)



\### Rozetler



\* Kettle Master

\* Sıfır Atık Şövalyesi

\* Ay Sonu Savaşçısı

\* Bulaşık Ninja'sı



Amaç:



\* Kullanıcı bağlılığını artırmak

\* Sürdürülebilir kullanım alışkanlığı oluşturmak



\---



\# Sonuç



Yurttaş Mutfakta, öğrenci yaşamının gerçek koşullarını merkeze alan; yapay zekayı tarif üretmekten çok karar destek sistemi olarak kullanan, bütçe, ekipman ve zaman kısıtlarını dikkate alan yenilikçi bir öğrenci mutfak asistanıdır.



MVP sürümü, öğrencilerin günlük beslenme problemlerini çözmeye odaklanırken; gelecekte OCR, sosyal takas ağı ve oyunlaştırma sistemleriyle tam kapsamlı bir öğrenci yaşam platformuna dönüşmeyi hedeflemektedir.



