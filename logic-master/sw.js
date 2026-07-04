/* ==============================================
   sw.js — Service Worker（PWA用）
   ファイルをブラウザに保存（キャッシュ）して、
   オフラインでも遊べるようにする仕組みです。

   ★ゲームのファイルを更新したときは、下の VERSION の
     数字を上げると、全員のキャッシュが新しくなります。
   ============================================== */

const VERSION = "v2"; // Lv4の難易度調整（ファイルを更新したら数字を上げる）
const CACHE_NAME = "logic-master-" + VERSION;

// キャッシュしておくファイルの一覧
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./css/style.css",
  "./js/questions.js",
  "./js/audio.js",
  "./js/storage.js",
  "./js/main.js",
  "./js/lv1.js",
  "./js/lv2.js",
  "./js/lv3.js",
  "./js/lv4.js",
  "./js/lv5.js",
];

// インストール時：全ファイルをキャッシュに保存
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// 有効化時：古いバージョンのキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 通信時：キャッシュにあればそれを返す（なければネットから取得）
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
