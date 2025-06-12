self.addEventListener("push", event => {
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: "Nueva notificación", body: event.data.text() };
  }

  // Siempre muestra la notificación nativa
  const notificationPromise = self.registration.showNotification(
    data.title || "Notificación",
    {
      body: data.body || "",
      data
    }
  );

  // Envía mensaje a todas las ventanas para el toast in-app
  const messagePromise = self.clients.matchAll({ includeUncontrolled: true, type: "window" })
    .then(clients => {
      for (const client of clients) {
        client.postMessage({
          type: "IN_APP_PUSH",
          payload: data
        });
      }
    });

  event.waitUntil(Promise.all([notificationPromise, messagePromise]));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // Cambia la ruta si lo deseas
  );
});
