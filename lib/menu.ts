import type { Locale } from "@/lib/dictionaries";
export type Localized = { fr: string; en: string };

export type Dish = {
  id: string;
  name: Localized;
  description: Localized;
  price: number; // in TND
  emoji: string; // placeholder until real photos
  image?: string; // later: "/images/menu/xxx.jpg"
};

export type Category = {
  id: string;
  name: Localized;
  dishes: Dish[];
};

export const menu: Category[] = [
  {
    id: "starters",
    name: { fr: "Entrées", en: "Starters" },
    dishes: [
      {
        id: "salade-marine",
        name: { fr: "Salade marine", en: "Seafood salad" },
        description: {
          fr: "Crevettes, calamars et moules, vinaigrette citronnée.",
          en: "Shrimp, squid and mussels with a lemon dressing.",
        },
        price: 14.5,
        emoji: "🥗",
      },
      {
        id: "soupe-poisson",
        name: { fr: "Soupe de poisson", en: "Fish soup" },
        description: {
          fr: "Soupe maison, croûtons et rouille.",
          en: "House fish soup with croutons and rouille.",
        },
        price: 12,
        emoji: "🍲",
      },
      {
        id: "brik-thon",
        name: { fr: "Brik au thon", en: "Tuna brik" },
        description: {
          fr: "Feuille croustillante, thon, œuf et câpres.",
          en: "Crispy pastry with tuna, egg and capers.",
        },
        price: 6.5,
        emoji: "🥟",
      },
    ],
  },
  {
    id: "seafood",
    name: { fr: "Fruits de mer", en: "Seafood" },
    dishes: [
      {
        id: "plateau-amiral",
        name: { fr: "Plateau de l'Amiral", en: "Admiral's platter" },
        description: {
          fr: "Crevettes, calamars, moules et poisson du jour grillés.",
          en: "Grilled shrimp, squid, mussels and fish of the day.",
        },
        price: 58,
        emoji: "🦐",
      },
      {
        id: "crevettes-ail",
        name: { fr: "Crevettes à l'ail", en: "Garlic shrimp" },
        description: {
          fr: "Crevettes sautées au beurre, ail et persil.",
          en: "Shrimp sautéed in butter, garlic and parsley.",
        },
        price: 32,
        emoji: "🍤",
      },
      {
        id: "calamars-frits",
        name: { fr: "Calamars frits", en: "Fried calamari" },
        description: {
          fr: "Anneaux de calamars dorés, sauce tartare.",
          en: "Golden squid rings with tartare sauce.",
        },
        price: 24,
        emoji: "🦑",
      },
    ],
  },
  {
    id: "mains",
    name: { fr: "Plats", en: "Main courses" },
    dishes: [
      {
        id: "dorade-grillee",
        name: { fr: "Dorade grillée", en: "Grilled sea bream" },
        description: {
          fr: "Dorade entière, légumes de saison et riz.",
          en: "Whole sea bream with seasonal vegetables and rice.",
        },
        price: 36,
        emoji: "🐟",
      },
      {
        id: "spaghetti-fruits-de-mer",
        name: { fr: "Spaghetti aux fruits de mer", en: "Seafood spaghetti" },
        description: {
          fr: "Pâtes fraîches, sauce tomate et fruits de mer.",
          en: "Fresh pasta with tomato sauce and seafood.",
        },
        price: 28,
        emoji: "🍝",
      },
      {
        id: "entrecote",
        name: { fr: "Entrecôte grillée", en: "Grilled ribeye" },
        description: {
          fr: "Entrecôte, sauce au poivre et frites maison.",
          en: "Ribeye steak with pepper sauce and homemade fries.",
        },
        price: 42,
        emoji: "🥩",
      },
    ],
  },
  {
    id: "desserts",
    name: { fr: "Desserts", en: "Desserts" },
    dishes: [
      {
        id: "creme-brulee",
        name: { fr: "Crème brûlée", en: "Crème brûlée" },
        description: {
          fr: "Vanille de Madagascar, sucre caramélisé.",
          en: "Madagascar vanilla with caramelised sugar.",
        },
        price: 9,
        emoji: "🍮",
      },
      {
        id: "fondant-chocolat",
        name: { fr: "Fondant au chocolat", en: "Chocolate fondant" },
        description: {
          fr: "Cœur coulant, boule de glace vanille.",
          en: "Molten centre with a scoop of vanilla ice cream.",
        },
        price: 11,
        emoji: "🍫",
      },
    ],
  },
  {
    id: "drinks",
    name: { fr: "Boissons", en: "Drinks" },
    dishes: [
      {
        id: "citronnade",
        name: { fr: "Citronnade maison", en: "Homemade lemonade" },
        description: {
          fr: "Citron frais et menthe.",
          en: "Fresh lemon and mint.",
        },
        price: 5,
        emoji: "🍋",
      },
      {
        id: "the-menthe",
        name: { fr: "Thé à la menthe", en: "Mint tea" },
        description: {
          fr: "Thé vert et menthe fraîche.",
          en: "Green tea with fresh mint.",
        },
        price: 3.5,
        emoji: "🍵",
      },
    ],
  },
];

export function formatPrice(price: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}