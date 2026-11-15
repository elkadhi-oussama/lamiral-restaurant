import type { Locale } from "@/lib/dictionaries";

export const soonText = {
  fr: {
    login: "Connexion",
    register: "Créer un compte",
    account: "Mon compte",
    message:
      "Cette page sera disponible dans la prochaine version du site.",
    back: "Retour à l'accueil",
  },
  en: {
    login: "Login",
    register: "Create an account",
    account: "My account",
    message: "This page will be available in the next version of the site.",
    back: "Back to the homepage",
  },
} satisfies Record<
  Locale,
  { login: string; register: string; account: string; message: string; back: string }
>;