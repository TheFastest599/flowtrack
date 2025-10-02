import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useNotificationStore = create(
  devtools(
    (set, get) => ({
      notifications: [], // Array of notification objects
      isConnected: false,
      error: null,

      // Add a new notification
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications], // Prepend for latest first
        })),

      // Clear all notifications
      clearNotifications: () => set({ notifications: [] }),

      // Set connection status
      setConnected: (connected) => set({ isConnected: connected }),

      // Set error
      setError: (error) => set({ error }),

      // Connect to WebSocket
      connect: (userId) => {
        if (get().isConnected) return; // Already connected

        const wsUrl = `${
          process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"
        }/ws/notifications?user_id=${userId}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected");
          set({ isConnected: true, error: null });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            get().addNotification(data); // Add to store
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          set({ isConnected: false });
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          set({ error: "WebSocket connection failed" });
        };

        // Store WebSocket instance if needed for manual disconnect
        set({ ws });
      },

      // Disconnect WebSocket
      disconnect: () => {
        const { ws } = get();
        if (ws) {
          ws.close();
          set({ isConnected: false, ws: null });
        }
      },
    }),
    { name: "notificationStore" }
  )
);

export default useNotificationStore;
