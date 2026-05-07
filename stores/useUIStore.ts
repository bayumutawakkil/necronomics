'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { UIState, EventSeverity } from '@/types/game';

const INITIAL_UI_STATE: UIState = {
  panelVisibility: {
    resources: true,
    units: true,
    buildings: true,
    events: true,
  },
  notifications: [],
  activeModal: null,
  modalData: {},
  selectedUnitId: null,
  selectedBuildingId: null,
};

interface UIStore extends UIState {
  // Panel management
  togglePanel: (panel: keyof UIState['panelVisibility']) => void;
  setPanelVisibility: (panel: keyof UIState['panelVisibility'], visible: boolean) => void;

  // Notifications
  addNotification: (message: string, severity?: EventSeverity) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Modals
  openModal: (modalName: string, data?: Record<string, any>) => void;
  closeModal: () => void;

  // Selection
  selectUnit: (unitId: string | null) => void;
  selectBuilding: (buildingId: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    ...INITIAL_UI_STATE,

    // Panel management
    togglePanel: (panel) =>
      set((state) => {
        state.panelVisibility[panel] = !state.panelVisibility[panel];
      }),

    setPanelVisibility: (panel, visible) =>
      set((state) => {
        state.panelVisibility[panel] = visible;
      }),

    // Notifications
    addNotification: (message, severity = 'info') =>
      set((state) => {
        const id = `notif-${Date.now()}-${Math.random()}`;
        state.notifications.push({
          id,
          message,
          severity,
          timestamp: Date.now(),
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
          useUIStore.setState((s) => ({
            notifications: s.notifications.filter((n) => n.id !== id),
          }));
        }, 5000);

        // Limit to 5 notifications
        if (state.notifications.length > 5) {
          state.notifications = state.notifications.slice(-5);
        }
      }),

    removeNotification: (id) =>
      set((state) => {
        state.notifications = state.notifications.filter((n) => n.id !== id);
      }),

    clearNotifications: () =>
      set((state) => {
        state.notifications = [];
      }),

    // Modals
    openModal: (modalName, data = {}) =>
      set((state) => {
        state.activeModal = modalName;
        state.modalData = data;
      }),

    closeModal: () =>
      set((state) => {
        state.activeModal = null;
        state.modalData = {};
      }),

    // Selection
    selectUnit: (unitId) =>
      set((state) => {
        state.selectedUnitId = unitId;
      }),

    selectBuilding: (buildingId) =>
      set((state) => {
        state.selectedBuildingId = buildingId;
      }),
  }))
);

// Selectors
export const selectNotifications = (state: UIStore) => state.notifications;
export const selectPanelVisibility = (state: UIStore) => state.panelVisibility;
export const selectActiveModal = (state: UIStore) => state.activeModal;
