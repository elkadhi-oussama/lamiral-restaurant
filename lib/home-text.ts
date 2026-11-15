import type { Locale } from "@/lib/dictionaries";

export const homeText = {
  fr: {
    popularTitle: "Les plats préférés de nos clients",
    seeFullMenu: "Voir tout le menu",
    footerTagline: "Cuisine française · Fruits de mer",
    footerContact: "Contact",
    footerHours: "Horaires",
    hoursLines: ["Mar - Dim", "12h00 - 14h30", "19h00 - 22h30"],
    footerPayment: "Paiement en espèces au retrait",
    rights: "Tous droits réservés.",
  },
  en: {
    popularTitle: "Our customers' favourites",
    seeFullMenu: "See the full menu",
    footerTagline: "French cuisine · Seafood",
    footerContact: "Contact",
    footerHours: "Opening hours",
    hoursLines: ["Tue - Sun", "12:00 PM - 2:30 PM", "7:00 PM - 10:30 PM"],
    footerPayment: "Cash payment on collection",
    rights: "All rights reserved.",
  },
} satisfies Record<Locale, {
  popularTitle: string;
  seeFullMenu: string;
  footerTagline: string;
  footerContact: string;
  footerHours: string;
  hoursLines: string[];
  footerPayment: string;
  rights: string;
}>;

// Dish ids shown on the homepage (they must exist in lib/menu.ts)
export const popularDishIds = [
  "plateau-amiral",
  "crevettes-ail",
  "dorade-grillee",
  "creme-brulee",
];