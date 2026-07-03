// 💡 每次你修改了 index.html 想發布新版時，只要把下面這個版本號往上加（例如改為 v1.2, v1.3）
// 手機和電腦就會偵測到檔案變更，自動在背景觸發更新流程！
const CACHE_NAME = 'ncu-helper-v1.2'; 

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. 安裝 Service Worker (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('新版快取已開啟:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
  // ⚡ 關鍵修正：讓新版 Service Worker 安裝完後「立刻跳過等待狀態」，直接強制上工
  self.skipWaiting();
});

// 2. 啟用與更新 Service Worker (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 檢查如果不是當前最新的快取名稱，就無情地把它刪除，釋放空間
          if (cacheName !== CACHE_NAME) {
            console.log('刪除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // ⚡ 關鍵修正：讓新版 Service Worker 「立刻接管」目前所有打開的網頁分頁
      // 使用者不需要手動關閉全部的分頁也能吃到新檔案
      return self.clients.claim();
    })
  );
});

// 3. 攔截網路請求 (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果快取（Cache Storage）裡面有這個檔案，就直接秒讀快取（實現秒開網頁）
        if (response) {
          return response;
        }
        // 如果快取裡沒有（例如使用者跳轉到外部的 Portal 或 EEClass），就走正常網路請求
        return fetch(event.request);
      })
  );
});