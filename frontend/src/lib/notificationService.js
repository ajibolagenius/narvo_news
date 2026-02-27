// Push Notification Service for Breaking News
const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

// Check if push notifications are supported
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Get notification permission status
export function getNotificationStatus() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Subscribe to push notifications
export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }
  
  const permission = await requestNotificationPermission();
  if (!permission) {
    throw new Error('Notification permission denied');
  }
  
  const registration = await navigator.serviceWorker.ready;
  
  // For demo purposes, we'll use a generated VAPID key
  // In production, this should come from your backend
  const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    // Send subscription to backend
    await fetch(`${API_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    }).catch(() => {
      // Backend endpoint might not exist yet
      console.log('Subscription saved locally');
    });
    
    return subscription;
  } catch (e) {
    console.error('Push subscription failed:', e);
    throw e;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    await subscription.unsubscribe();
    
    // Notify backend
    await fetch(`${API_URL}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    }).catch(() => {});
  }
}

// Check current subscription status
export async function getSubscription() {
  if (!isPushSupported()) return null;
  
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

// Show local notification (for testing or when SW isn't available)
export function showLocalNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  
  return new Notification(title, {
    icon: '/narvo-icon-192.png',
    badge: '/narvo-icon-192.png',
    tag: 'narvo-local',
    ...options
  });
}

// Queue offline action through service worker
export async function queueOfflineAction(actionType, payload) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'QUEUE_OFFLINE_ACTION',
      action: { actionType, payload }
    });
    return true;
  }
  return false;
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
