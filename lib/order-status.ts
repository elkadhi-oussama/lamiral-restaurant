export const statusInfo: Record<
  string,
  { label: string; action: string; badge: string }
> = {
  PENDING: {
    label: "En attente",
    action: "",
    badge: "bg-yellow-500/20 text-yellow-300",
  },
  ACCEPTED: {
    label: "Acceptée",
    action: "Accepter",
    badge: "bg-blue-500/20 text-blue-300",
  },
  PREPARING: {
    label: "En préparation",
    action: "Mettre en préparation",
    badge: "bg-orange-500/20 text-orange-300",
  },
  READY: {
    label: "Prête à retirer",
    action: "Marquer prête",
    badge: "bg-green-500/20 text-green-300",
  },
  COMPLETED: {
    label: "Terminée",
    action: "Terminer (retirée)",
    badge: "bg-brand-cream/10 text-brand-cream/70",
  },
  REJECTED: {
    label: "Refusée",
    action: "Refuser",
    badge: "bg-red-500/20 text-red-300",
  },
  CANCELLED: {
    label: "Annulée",
    action: "Annuler",
    badge: "bg-red-500/20 text-red-300",
  },
};

// Which status can follow which (anything else is refused by the server)
export const transitions: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "REJECTED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};