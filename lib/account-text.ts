import type { Locale } from "@/lib/dictionaries";

export const accountText = {
  fr: {
    title: "Mon compte",
    profile: "Mes informations",
    orders: "Historique de mes commandes",
    noOrders: "Vous n'avez pas encore passé de commande.",
    seeMenu: "Voir le menu",
    order: "Commande",
    pickup: "Retrait à",
    total: "Total",
    status: {
      PENDING: "En attente",
      ACCEPTED: "Acceptée",
      REJECTED: "Refusée",
      PREPARING: "En préparation",
      READY: "Prête à retirer",
      COMPLETED: "Terminée",
      CANCELLED: "Annulée",
    } as Record<string, string>,
  },
  en: {
    title: "My account",
    profile: "My details",
    orders: "My order history",
    noOrders: "You have not placed any order yet.",
    seeMenu: "See the menu",
    order: "Order",
    pickup: "Pickup at",
    total: "Total",
    status: {
      PENDING: "Pending",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      PREPARING: "Preparing",
      READY: "Ready for pickup",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    } as Record<string, string>,
  },
} satisfies Record<Locale, unknown>;