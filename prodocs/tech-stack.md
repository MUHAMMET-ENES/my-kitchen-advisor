\# YURTTAŞ MUTFAKTA - Teknoloji Yığını ve AI Kullanım Raporu (Tech Stack \& AI Usage)



\*\*Proje Sahibi:\*\* Muhammet Enes Karaoğlan  

\*\*Tarih:\*\* 14 Haziran 2026  



Bu doküman, "Yurttaş Mutfakta" projesinin geliştirilme sürecinde tercih edilen teknolojileri, bu seçimlerin ardındaki mühendislik gerekçelerini ve yapay zekanın (AI) sadece bir ürün özelliği olarak değil, aynı zamanda bir "Geliştirici Asistanı" olarak nasıl konumlandırıldığını detaylandırmaktadır.



\---



\## 1. Mimari Yaklaşım (Decoupled Architecture)



Proje, güncel endüstri standartlarına ve Up School bitirme projesi kriterlerine uygun olarak Frontend ve Backend olmak üzere iki bağımsız katmana (decoupled) ayrılmıştır. Bu yaklaşımın temel gerekçeleri:



\*   \*\*Ölçeklenebilirlik (Scalability):\*\* İlerleyen aşamalarda uygulamanın mobil versiyonu (iOS/Android) geliştirilmek istendiğinde, backend API'si hiçbir değişikliğe uğramadan doğrudan mobil istemcilere hizmet verebilecektir.

\*   \*\*Güvenlik (Security):\*\* LLM servisleri ve diğer üçüncü parti API anahtarları, istemci tarafında (tarayıcıda) ifşa edilme riski olmadan backend sunucusunda (`.env` izolasyonu ile) güvenle saklanmaktadır.

\*   \*\*Sorumlulukların Ayrılığı (Separation of Concerns):\*\* Arayüz geliştirme süreçleri ile iş mantığı/veri işleme süreçleri birbirini engellemeden paralel olarak yönetilebilmektedir.



\---



\## 2. Kullanılan Teknolojiler ve Seçim Gerekçeleri



\### 2.1. Frontend (Arayüz Katmanı)

Öğrenci yurtlarındaki internet kısıtlamaları ve cihaz çeşitliliği göz önüne alınarak, arayüzün son derece hızlı, hafif ve mobil öncelikli (mobile-first) olması hedeflenmiştir.



\*   \*\*HTML5 / CSS3 / JavaScript (Vanilla / ES6+):\*\* 

&#x20;   \*   \*Gerekçe:\* MVP (Minimum Uygulanabilir Ürün) sürecinde hız kazanmak ve gereksiz kütüphane bağımlılıklarından kaçınmak için temel web teknolojileri tercih edilmiştir. Tarayıcı üzerinde en hızlı yükleme (load time) ve yorumlama bu sayede sağlanmıştır.

\*   \*\*CSS Flexbox \& CSS Grid:\*\*

&#x20;   \*   \*Gerekçe:\* Dinamik içeriklerin (AI tarafından üretilen metrik kartları) farklı ekran boyutlarında bozulmadan, esnek ve modern bir yapıda gösterilmesi için kullanılmıştır.

\*   \*\*LocalStorage API:\*\*

&#x20;   \*   \*Gerekçe:\* "Yurttaş Notları" ve "Favoriler" gibi kişiselleştirme özelliklerinin, karmaşık veritabanı kurgularına ve kullanıcı giriş (login) sistemlerine ihtiyaç duyulmadan, kullanıcının kendi cihazında güvenle ve anında saklanması için tercih edilmiştir.



\### 2.2. Backend (API Katmanı)

Backend, asenkron işlemleri (LLM API'sine istek atma ve bekleme) en verimli şekilde yönetebilecek bir altyapıya ihtiyaç duymaktadır.



\*   \*\*Python (FastAPI) \*veya\* Node.js (Express) \[Projede kullanılan spesifik dil belirtilmelidir]:\*\*

&#x20;   \*   \*Gerekçe:\* RESTful API oluşturmak için endüstri standardı olan, hızlı prototiplemeye olanak sağlayan ve geniş bir ekosisteme sahip olması sebebiyle tercih edilmiştir. JSON veri formatının işlenmesi ve rotaların (routes) yönetilmesi konusunda yüksek performans sunar.

\*   \*\*CORS (Cross-Origin Resource Sharing) Yönetimi:\*\*

&#x20;   \*   \*Gerekçe:\* Bağımsız bir domain'de barındırılan Frontend'in, Backend API'si ile güvenli bir şekilde iletişim kurabilmesi (veri alışverişi yapabilmesi) için zorunlu güvenlik politikaları uygulanmıştır.

\*   \*\*dotenv (`.env`):\*\*

&#x20;   \*   \*Gerekçe:\* Ortam değişkenlerinin yönetimi. API anahtarlarının kaynak koda gömülmesini engelleyerek repo güvenliğini sağlamıştır.



\### 2.3. Yapay Zeka (LLM) Servisleri

\*   \*\*Gemini API / OpenRouter:\*\*

&#x20;   \*   \*Gerekçe:\* Güçlü mantıksal çıkarım yapabilme, yüksek token limitleri ve JSON formatında yapılandırılmış çıktı üretebilme yetenekleri nedeniyle "Karar Motoru" olarak sisteme entegre edilmiştir.



\### 2.4. Versiyon Kontrolü ve Dağıtım (Deployment)

\*   \*\*Git \& GitHub:\*\* Kaynak kod yönetimi, versiyonlama ve dökümantasyon (README, PRD vb.) süreçleri için kullanılmıştır. `.gitignore` dosyası ile hassas verilerin (.env, node\_modules vb.) repoya sızması engellenmiştir.

\*   \*\*Vercel / Netlify (Frontend Dağıtımı):\*\* Sürekli entegrasyon (CI/CD) imkanı ve statik varlıkların hızlı sunumu (CDN) için tercih edilmiştir.

\*   \*\*Render / Railway (Backend Dağıtımı):\*\* API'nin sürekli erişilebilir olması ve sunucu konfigürasyonlarıyla vakit kaybetmeden hızlı canlıya alım imkanı sunması nedeniyle kullanılmıştır.



\---



\## 3. Geliştirme Sürecinde AI Kullanımı (AI-Assisted Development)



Yapay zeka sadece uygulamanın çekirdek bir özelliği olarak değil, aynı zamanda projenin kısıtlı sürede (hackathon temposu) ayağa kaldırılmasını sağlayan stratejik bir "Pair Programmer" (Eş Geliştirici) olarak kullanılmıştır.



\### 3.1. Mimari Kararlar ve Kapsam Daraltma

\*   \*Nasıl Kullanıldı?\* Projenin başlangıç aşamasında, fikirlerin fizibilite analizi ve MVP kapsamının belirlenmesinde AI ile çalışıldı. Karmaşık veritabanı kurulumları yerine, LocalStorage kullanımının daha efektif olacağı kararı AI ile yapılan teknik istişareler sonucunda alındı.



\### 3.2. Gelişmiş Prompt Mühendisliği (Prompt Engineering)

\*   \*Nasıl Kullanıldı?\* Uygulamanın en kritik bileşeni olan "Sistem Promptu"nun kurgulanmasında AI'dan destek alındı. LLM'in halüsinasyon görmesini engelleyecek, belirli ekipman sınırlarının dışına çıkmasını yasaklayacak ve çıktının hatasız bir JSON nesnesi olmasını garanti edecek kurallar (constraints) seti, AI ile optimize edilerek tasarlandı.



\### 3.3. Dökümantasyon ve İskelet Kod Üretimi (Scaffolding)

\*   \*Nasıl Kullanıldı?\* Zorunlu GitHub dökümanlarının (PRD.md, tech-stack.md vb.) yapılandırılması, proje vizyonunun endüstri standardında yazıya dökülmesi ve Frontend/Backend klasör mimarisinin temel iskelet kodlarının (boilerplate) hızla oluşturulmasında AI asistanından faydalanıldı. Bu durum geliştirme hızını (development velocity) dramatik ölçüde artırdı.



\### 3.4. Hata Ayıklama (Debugging) ve Optimizasyon

\*   \*Nasıl Kullanıldı?\* Backend tarafında CORS politikalarından kaynaklanan hataların çözümü ve LLM API'sinden dönen JSON verilerinin Frontend'de doğru ayrıştırılması (parsing) süreçlerindeki potansiyel hatalar AI kullanılarak hızlıca tespit edildi ve kod refactor (iyileştirme) işlemleri gerçekleştirildi.

