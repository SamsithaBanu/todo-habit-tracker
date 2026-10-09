import { api } from "@/lib/api";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
    return "serviceWorker" in navigator && "PushManager" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission; // "default" | "granted" | "denied"
}

// Call this only after the user clicks an explicit "Enable notifications" button —
// browsers require a user gesture before they'll show the permission prompt.
export async function enablePushNotifications(): Promise<boolean> {
    if (!isPushSupported()) return false;
    console.log('vapid', VAPID_PUBLIC_KEY)

    console.log("All env:", import.meta.env);

    const registration = await navigator.serviceWorker.register("/service-worker.js");
    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        });
    }

    const raw = subscription.toJSON();
    console.log('raw', raw)
    await api.post("/api/push/subscribe", {
        endpoint: raw.endpoint,
        p256dh: raw.keys?.p256dh,
        auth: raw.keys?.auth,
    });

    return true;
}

export async function disablePushNotifications(): Promise<void> {
    if (!isPushSupported()) return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();

    if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await api.post("/api/push/unsubscribe", { endpoint });
    }
}

export async function hasActiveSubscription(): Promise<boolean> {
    if (!isPushSupported()) return false;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
}