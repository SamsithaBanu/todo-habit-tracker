self.addEventListener("push", (event) => {
    let data = { title: "Habit Tracker", body: "You have an update." };
    try {
        data = event.data.json();
    } catch (e) {
        // payload wasn't JSON — fall back to defaults above
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow("/"));
});