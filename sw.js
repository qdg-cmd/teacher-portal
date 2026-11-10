// 선생님의 교무실 포털 - PWA 캐시 워커 v4
const CACHE_NAME = 'teacher-portal-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Network-First 전략: 최신 업데이트 실시간 반영 (오프라인일 때만 캐시 사용)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // HTML 페이지 및 apps.json은 무조건 네트워크에서 최신 버전을 먼저 가져옵니다
  if (
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('apps.json') ||
    url.pathname.endsWith('index.html') ||
    url.pathname.endsWith('/')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 아이콘 등 정적 리소스는 캐시 우선
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
