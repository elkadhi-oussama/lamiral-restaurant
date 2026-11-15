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
    },
  },
  en: {
    nav: { home: "Home", menu: "Menu", cart: "Cart", login: "Login" },
    home: {
      welcome:
        "Welcome to L'Amiral. Our online ordering website is coming soon.",
      menuButton: "View the menu",
    },
  },
};