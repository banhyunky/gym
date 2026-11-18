// 화면 파일을 폰에 저장해 두고 오프라인에서도 쓸 수 있게 하는 서비스워커 (데이터는 건드리지 않음)
// 전략: 항상 최신 파일을 먼저 받아오고, 인터넷이 안 될 때만 저장된 파일을 보여줌 (네트워크 우선)
// 화면을 고쳐서 올린 뒤에는 V 숫자를 올리면 예전 캐시를 바로 정리해요.
const V = 'gym-v4';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== location.origin) return;   // 구글 서버 호출은 그대로 통과
  e.respondWith(
    fetch(r, { cache: 'no-store' }).then(res => {
      if (res.ok) caches.open(V).then(c => c.put(r, res.clone()));
      return res;
    }).catch(() => caches.open(V).then(c => c.match(r, { ignoreSearch: true })))
  );
});
