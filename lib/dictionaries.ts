export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const dictionaries = {
  fr: {
    nav: { home: "Accueil", menu: "Menu", cart: "Panier", login: "Connexion" },
    home: {
      welcome:
        "Bienvenue chez L'Amiral. Notre site de commande en ligne arrive bientôt.",
      menuButton: "Voir le menu",
            tagline: "Cuisine française · Fruits de mer",
      orderOnline: "Commander en ligne",
      aboutTitle: "Notre histoire",
      aboutText:
        "Bienvenue à bord. Chez L'Amiral, nous préparons une cuisine généreuse, des produits frais et un service chaleureux, comme sur un navire où chaque invité est un membre d'équipage.",
      infoTitle: "Informations pratiques",
      addressLabel: "Adresse",
      hoursLabel: "Horaires",
      hoursValue: "Tous les jours : 12h00 - 23h00",
      phoneLabel: "Téléphone",
      paymentLabel: "Paiement",
      paymentValue: "En espèces au retrait de la commande",
    },
       menuPage: {
      title: "Notre menu",
      subtitle: "Cuisine fraîche, préparée chaque jour.",
      cashNote: "Paiement en espèces au retrait de la commande.",
    },
  },
  en: {
    nav: { home: "Home", menu: "Menu", cart: "Cart", login: "Login" },
    home: {
      welcome:
        "Welcome to L'Amiral. Our online ordering website is coming soon.",
      menuButton: "View the menu",
            tagline: "French cuisine · Seafood",
      orderOnline: "Order online",
      aboutTitle: "Our story",
      aboutText:
        "Welcome aboard. At L'Amiral we cook generous food with fresh ingredients and warm service, like a ship where every guest is part of the crew.",
      infoTitle: "Practical information",
      addressLabel: "Address",
      hoursLabel: "Opening hours",
      hoursValue: "Every day: 12:00 PM - 11:00 PM",
      phoneLabel: "Phone",
      paymentLabel: "Payment",
      paymentValue: "Cash when you collect your order",
    },
      menuPage: {
      title: "Our menu",
      subtitle: "Fresh food, prepared every day.",
      cashNote: "Cash payment when you collect your order.",
    },
  },
};