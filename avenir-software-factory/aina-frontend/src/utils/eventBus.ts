type Handler = (payload?: any) => void;

const listeners = new Map<string, Set<Handler>>();

export const eventBus = {
  on(event: string, handler: Handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(handler);
    return () => eventBus.off(event, handler);
  },
  off(event: string, handler: Handler) {
    listeners.get(event)?.delete(handler);
  },
  emit(event: string, payload?: any) {
    listeners.get(event)?.forEach((h) => h(payload));
  },
};

// Événements utilisés
export const EVT_CONV_CHANGED = "conversation:changed";    // la conv active a changé (cid ou undefined)
export const EVT_CONV_LIST_DIRTY = "conversation:list-dirty"; // la liste doit se rafraîchir
