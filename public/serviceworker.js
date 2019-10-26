// ブラウザに対して通知イベントを検知した際に実行される処理を定義
self.addEventListener('push', (e) => {
    var data = e.data.json();
    var title = data.title;
    var options = {
      body : data.body,
      icon: data.icon,
      data: {
        link_to: data.link
      }
    };
    e.waitUntil(self.registration.showNotification(title, options));
  });
  // 通知バーがクリックされた際に実行される処理を定義
  self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.link_to));
  });