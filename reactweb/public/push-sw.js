self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "Nueva notificación", body: event.data.text() };
  }
  self.registration.showNotification(data.title || "Notificación", {
    body: data.body || "",
    data: data
  });
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Puedes cambiar la ruta si lo deseas
  );
});
