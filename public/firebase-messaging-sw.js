/*
  Firebase Cloud Messaging service worker
  Note: Public Firebase config is safe to expose. This file is served statically from /public.
*/

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBFIF_80yMCeEKgD7_cHRAHpPCGfunrTcc",
  authDomain: "hotbox-b82ed.firebaseapp.com",
  projectId: "hotbox-b82ed",
  messagingSenderId: "756265823897",
  appId: "1:756265823897:web:0fbded502faf3126d39208",
});

const messaging = firebase.messaging();

// Display a notification when a background message arrives
messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification || {};
  const notificationTitle = title || 'New Notification';
  const notificationOptions = {
    body: body || '',
    icon: image || undefined,
    data: payload.data || {},
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});


