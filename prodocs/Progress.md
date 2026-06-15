# YURTTAŞ MUTFAKTA

## Geliştirme Seyir Defteri ve Karar Kayıtları (Progress.md)

**Geliştirici:** Muhammet Enes Karaoğlan
**Tarih:** 14 Haziran 2026
**Proje Durumu:** MVP (V1.0) Geliştirme ve Dağıtım Fazı

---

## Amaç

Bu doküman, geliştirme döngüsü boyunca gerçekleştirilen işlemleri, mimari kararları (ADR - Architecture Decision Records), karşılaşılan teknik problemleri ve bu problemlere uygulanan mühendislik çözümlerini şeffaf bir şekilde kayıt altına almaktadır.

---

# 🛠 Faz 1: Kapsam Belirleme ve Gereksinim Analizi

## Gerçekleştirilen İşlem

Up School Bitirme Projesi yönergeleri doğrultusunda problem tanımı yapıldı. Genel geçer bir tarif uygulaması yerine, KYK yurtlarındaki fiziksel donanım kısıtlarına (sadece su ısıtıcısı veya tost makinesi) odaklanan bir MVP kapsamı çizildi.

## Alınan Karar: Kapsam Daraltma

### Karar

Uygulamanın veritabanı gerektiren karmaşık özelliklerden (örneğin kullanıcılar arası mesajlaşma ve detaylı profil yönetimi) arındırılması.

### Gerekçe

14 Haziran teslim hedefine ulaşabilmek ve geliştirme odağını Yapay Zeka Entegrasyonu üzerinde tutmak.

---

# 🛠 Faz 2: Mimari Tasarım ve Teknoloji Seçimi

## Gerçekleştirilen İşlem

Frontend ve Backend katmanlarının ayrıştırılması (Decoupled Architecture) işlemleri başlatıldı. API iskeleti oluşturuldu.

## Alınan Karar: State Management ve Veri Saklama

### Karar

Kullanıcıların favori tariflerini saklaması ve kişisel notlar ekleyebilmesi için PostgreSQL veya MongoDB gibi bir veritabanı yerine tarayıcının `localStorage` API'sinin kullanılması.

### Gerekçe

Kullanıcı yetkilendirme (Auth/JWT) süreçlerinin MVP geliştirme hızını düşürme riski bulunuyordu. `localStorage` ile gecikmesiz ve KVKK dostu bir kullanıcı deneyimi sağlandı.

---

## Alınan Karar: UI/UX Tasarım Pivotu

### Karar

Başlangıçta planlanan Dark Mode / Cyberpunk tasarım dilinden vazgeçilerek Pastel, Bej ve Sıcak Mutfak temalı renk paletine geçildi.

### Gerekçe

Hedef kitlenin robotik bir araçtan çok samimi ve iştah açıcı bir mutfak asistanı deneyimi beklediği değerlendirildi.

---

# 🛠 Faz 3: Yapay Zeka (LLM) Entegrasyonu ve Prompt Mühendisliği

## Gerçekleştirilen İşlem

Seçilen LLM servisinin (Gemini veya OpenRouter) Backend API'sine entegrasyonu gerçekleştirildi. Sistem promptu detaylandırıldı.

---

## Karşılaşılan Hata 1: LLM Halüsinasyonu ve Kısıt İhlali

### Sorun

Kullanıcı "Sadece Kettle" ekipmanını seçmesine rağmen yapay zekâ bazı durumlarda:

> "Tavada hafifçe soteleyin"

gibi ocak gerektiren talimatlar üretmekteydi.

### Müdahale

Sistem promptunda Zero-Shot yaklaşımından vazgeçilerek Few-Shot Prompting tekniğine geçildi.

Promptun başına aşağıdaki kural eklendi:

```text
[HARD CONSTRAINT]
Kullanıcının seçtiği ekipman dışında hiçbir ısı kaynağı kullanılamaz.
```

### Sonuç

Kısıt ihlalleri tamamen ortadan kaldırıldı.

---

## Karşılaşılan Hata 2: JSON Parse Exception (Markdown Çakışması)

### Sorun

LLM'den dönen yanıtın Frontend tarafında `JSON.parse()` aşamasında hata vermesi.

### Kök Neden

Model, JSON çıktısını doğrudan düz metin yerine Markdown kod bloğu içerisinde döndürmekteydi.

Örnek:

````markdown
```json
{
  ...
}
```
````

### Çözüm

Backend katmanında bir Sanitizer/Middleware oluşturuldu.

Markdown etiketleri Regex ile temizlenerek JSON doğrulaması yapıldı.

````javascript
const cleanJsonString = llmResponse
  .replace(/```json|```/g, '')
  .trim();

const finalData = JSON.parse(cleanJsonString);
````

### Sonuç

Frontend tarafındaki parse hataları giderildi.

---

# 🛠 Faz 4: Frontend Geliştirme ve API Haberleşmesi

## Gerçekleştirilen İşlem

UI bileşenlerinin geliştirilmesi ve Fetch API üzerinden Backend ile haberleşmenin sağlanması.

---

## Karşılaşılan Hata 3: CORS Politikası İhlali

### Sorun

Frontend uygulamasının Backend sunucusuna yaptığı POST istekleri tarayıcı tarafından güvenlik gerekçesiyle engelleniyordu.

Örnek:

```text
Frontend: localhost:3000
Backend: localhost:5000
```

### Çözüm

Backend tarafına CORS kütüphanesi entegre edildi.

Güvenlik amacıyla:

```javascript
Access-Control-Allow-Origin: *
```

yerine yalnızca izin verilen Frontend domainleri tanımlandı.

### Sonuç

Frontend ve Backend arasındaki iletişim sorunsuz hale getirildi.

---

# 🛠 Faz 5: Dağıtım (Deployment) ve Optimizasyon

## Gerçekleştirilen İşlem

Kod depolarının canlı ortama alınması ve son kullanıcı testlerinin başlatılması.

---

## Alınan Karar: Güvenlik İzolasyonu

### Karar

LLM API anahtarlarının ve diğer hassas bilgilerin GitHub reposuna gönderilmesini engellemek amacıyla:

* `.env` dosyası `.gitignore` içerisine eklendi.
* `.env.example` dosyası rehber olarak repoda bırakıldı.

### Sonuç

API anahtarları yalnızca barındırma platformlarının Environment Variables bölümlerinden yönetildi.

### Kullanılan Platformlar

* Vercel
* Render

---

# Sonraki Adım

## Demo ve Son Testler

Planlanan işlemler:

1. Son kullanıcı testlerinin tamamlanması
2. Hata kayıtlarının gözden geçirilmesi
3. MVP sürümünün doğrulanması
4. 5 dakikalık demo videosunun hazırlanması
5. Proje tesliminin gerçekleştirilmesi

---

# Genel Değerlendirme

Yurttaş Mutfakta projesi, öğrenci yaşamındaki gerçek kısıtları merkeze alan yapay zeka destekli bir mutfak asistanı olarak tasarlanmıştır.

Geliştirme süreci boyunca:

* Kapsam kontrollü biçimde daraltılmış,
* Frontend ve Backend katmanları ayrıştırılmış,
* LLM kaynaklı hatalar sistematik olarak çözülmüş,
* Güvenlik ve performans gereksinimleri korunmuş,
* MVP teslim hedefi doğrultusunda sürdürülebilir teknik kararlar alınmıştır.

Proje, sonraki sürümlerde OCR destekli fiş tarama, öğrenci takas pazarı ve oyunlaştırma sistemleri ile genişletilmeye hazır durumdadır.
