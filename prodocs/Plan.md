\# YURTTAŞ MUTFAKTA - Geliştirme Planı ve Teknik Adımlar (Plan.md)



\*\*Proje Sahibi:\*\* Muhammet Enes Karaoğlan  

\*\*Tarih:\*\* 14 Haziran 2026  

\*\*Metodoloji:\*\* Agile (Çevik) / Kanban Tabanlı MVP Yaklaşımı  



Bu doküman, Proje Gereksinim Dokümanı'nda (PRD) belirlenen hedeflerin teknik geliştirme adımlarına (Tasks) dönüştürülmüş halidir. Geliştirme süreci Epic'ler (Ana Kapsamlar) ve Kullanıcı Hikayelerine (User Stories) bölünmüş olup, her hikaye için "Kabul Kriterleri" (Acceptance Criteria) ve "Teknik Görevler" (Technical Tasks) tanımlanmıştır.



\---



\## Faz 1: Mimari Kurulum ve İskelet (Infrastructure Setup)



\*\*Kullanıcı Hikayesi (US-1.1):\*\*

> \*Bir geliştirici olarak, projemi Frontend ve Backend (Decoupled) olarak iki bağımsız katmanda yapılandırmak istiyorum; böylece kod tabanlarını izole edebilir, bağımsız olarak test edebilir ve farklı platformlarda canlıya alabilirim.\*



\*\*Kabul Kriterleri (Acceptance Criteria):\*\*

\* Frontend ve Backend için ayrı ana dizinler oluşturulmuş olmalı.

\* Her iki dizin için `.gitignore` yapılandırılmış ve gereksiz dosyaların (node\_modules vb.) repoya girmesi engellenmiş olmalı.

\* Çevresel değişkenler için `.env.example` şablonu oluşturulmalı.



\*\*Teknik Görevler (Tasks):\*\*

\* \[ ] GitHub repository'sinin başlatılması ve ilk commit (`git init`).

\* \[ ] `/frontend`, `/backend` ve `/prodocs` klasör ağacının oluşturulması.

\* \[ ] `.gitignore` dosyasının yazılması.

\* \[ ] Proje anayasasını içeren belgelerin (`PRD.md`, `tech-stack.md`) `/prodocs` klasörüne eklenmesi.



\---



\## Faz 2: Backend API ve Yapay Zeka Karar Motoru (Backend \& AI)



\*\*Kullanıcı Hikayesi (US-2.1 - AI Güvenilirliği):\*\*

> \*Öğrenci bir kullanıcı olarak, girdiğim malzeme ve kısıtlı donanımla (örn: sadece tost makinesi) ilgili yapay zekanın sınırlarımın dışına çıkmamasını istiyorum; böylece ocak veya fırın gerektiren işe yaramaz tarifler görmem.\*



\*\*Kabul Kriterleri:\*\*

\* API, yapay zeka modeline gönderilen istemlerde (prompts) kesin ekipman kısıtlamalarını (constraints) uygulamalıdır.

\* LLM çıktısı serbest metin (markdown) değil, önceden tanımlanmış şemaya uygun, parse edilebilir bir JSON nesnesi olmalıdır.

\* Hatalı JSON dönüşlerinde veya API kesintilerinde sistem çökmemeli, 500 hata kodu ile güvenli bir mesaj dönmelidir.



\*\*Teknik Görevler:\*\*

\* \[ ] RESTful API iskeletinin (FastAPI/Flask veya Express.js) kurulması.

\* \[ ] Frontend domain'ine izin verecek CORS (Cross-Origin Resource Sharing) middleware'inin yapılandırılması.

\* \[ ] LLM Servisine (Gemini / OpenRouter) bağlanacak HTTP istemcisinin entegrasyonu ve `.env` üzerinden API anahtarlarının okunması.

\* \[ ] \*\*Prompt Engineering:\*\* Sistemin karakterini belirleyen ve JSON formatını zorunlu kılan katı System Prompt'unun yazılması.

\* \[ ] `POST /api/v1/generate-recipe` uç noktasının (endpoint) oluşturulması. İstemci verisinin doğrulanması (Validation), LLM'e iletilmesi ve dönen JSON'ın parse edilerek istemciye iletilmesi.



\---



\## Faz 3: Frontend ve Arayüz Geliştirme (UI/UX)



\*\*Kullanıcı Hikayesi (US-3.1 - Veri Girişi):\*\*

> \*Öğrenci bir kullanıcı olarak, malzeme ve ekipman bilgilerimi karmaşık menülerde kaybolmadan girebileceğim temiz, anlaşılır ve mobil öncelikli (mobile-first) bir form arayüzü görmek istiyorum; böylece saniyeler içinde tarif talebi oluşturabilirim.\*



\*\*Kullanıcı Hikayesi (US-3.2 - Metriklerin Gösterimi):\*\*

> \*Öğrenci bir kullanıcı olarak, üretilen tarifin maliyetini ve bulaşık skorunu sıradan bir metin yerine renkli, dikkat çekici görsel kartlar (UI Cards) olarak görmek istiyorum; böylece tarifin benim o anki durumuma uygunluğunu hızla değerlendirebilirim.\*



\*\*Kabul Kriterleri:\*\*

\* Arayüz mobil cihazlarda yatay kaydırma çubuğu çıkarmamalı (Tam Responsive).

\* API çağrısı yapıldığında kullanıcıya asenkron işlemin devam ettiğini gösteren bir yükleme (Loading state/Spinner) animasyonu gösterilmeli.

\* Dönen JSON verisindeki tüm alanlar ilgili HTML bileşenlerine (DOM) başarılı ve eksiksiz biçimde yerleştirilmeli.



\*\*Teknik Görevler:\*\*

\* \[ ] HTML5 iskeletinin ve CSS Grid/Flexbox yapılarının kurulması.

\* \[ ] Kullanıcı girdilerini alacak form elemanlarının (Malzeme Text Input, Ekipman Radio Button) oluşturulması.

\* \[ ] Fetch API (veya Axios) kullanılarak Backend `generate-recipe` uç noktasına veri gönderim (POST) işlevinin yazılması.

\* \[ ] Dönen JSON verisini parçalayarak arayüze (DOM Manipulation) basacak JavaScript fonksiyonlarının yazılması.

\* \[ ] Hata durumlarında arayüzde "Tarif oluşturulamadı, lütfen tekrar deneyin" uyarılarının gösterimi.



\---



\## Faz 4: Kişiselleştirme ve Local Storage Yönetimi



\*\*Kullanıcı Hikayesi (US-4.1 - Not Tutma):\*\*

> \*Kısıtlı zamanı olan bir kullanıcı olarak, favori tariflerime üye olma zorunluluğu (Login/Register) olmadan kendime özel ipucu notları ekleyebilmek istiyorum; böylece sistemi başucu asistanım olarak kullanabilirim.\*



\*\*Kabul Kriterleri:\*\*

\* Veritabanı ve üyelik sistemi gereksinimi olmaksızın veriler kalıcı olmalı.

\* Sayfa yenilendiğinde (Refresh) veya tarayıcı yeniden başlatıldığında kaydedilen notlar ekranda tekrar listelenmeli.



\*\*Teknik Görevler:\*\*

\* \[ ] Arayüzdeki tarif sonuç kartına "Not Ekle / Favoriye Al" metin kutusu ve butonunun eklenmesi.

\* \[ ] Girilen notları ve tarifin ID/İsmini tarayıcının `window.localStorage.setItem()` metodu ile JSON.stringify yapılarak yerel hafızaya yazılması.

\* \[ ] Sayfa yüklendiğinde (`window.onload`), `localStorage.getItem()` ile kayıtlı notların kontrol edilip UI'a aktarılması.



\---



\## Faz 5: Sürekli Dağıtım (CI/CD) ve Teslim



\*\*Kullanıcı Hikayesi (US-5.1 - Dağıtım ve Test):\*\*

> \*Bir ürün yöneticisi ve değerlendirici (Jüri) olarak, projenin canlı bir URL üzerinden kesintisiz çalıştığını, GitHub deposunun tam ve eksiksiz dökümante edildiğini görmek istiyorum; böylece değerlendirmeyi gerçek kullanıcı koşullarında yapabilirim.\*



\*\*Kabul Kriterleri:\*\*

\* Frontend ve Backend için iki ayrı canlı (Live) URL üretilmeli.

\* Frontend'in canlı URL'inden atılan istek, Backend'in canlı URL'i tarafından CORS engeline takılmadan karşılanmalı.

\* Demo videosu 5 dakikayı geçmemeli ve çekim esnasında AI sesi kullanılmamalıdır.



\*\*Teknik Görevler:\*\*

\* \[ ] Backend uygulamasının platforma (Render / Railway) pushlanması ve Canlı API URL'inin elde edilmesi.

\* \[ ] Frontend kodlarındaki Local API URL'lerinin, Canlı API URL'i ile değiştirilmesi.

\* \[ ] Frontend kodunun platforma (Vercel / Netlify) yüklenmesi.

\* \[ ] Sistem testlerinin yapılması (Yanlış malzeme girme, boş bırakma, hız testleri).

\* \[ ] Maksimum 5 dakikalık (Problem -> Çözüm -> Mimari -> Canlı Demo -> Tech Stack -> Kapanış adımlarını izleyen) ekran kayıtlı sunum videosunun hazırlanması.

\* \[ ] Tüm dosyaların GitHub'a son commitlerinin atılması ve Teslim Formunun (14 Haziran Pazar 23:59 öncesinde) doldurulup iletilmesi.

