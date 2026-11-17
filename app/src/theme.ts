/**
 * Tout le style de l'app se règle ici : couleurs, tailles, espacements, arrondis.
 * Les composants n'utilisent jamais de valeur "en dur" : modifier ce fichier
 * change l'apparence de toute l'app (sauvegarde → mise à jour immédiate sur l'iPhone).
 */

/** Nom affiché en haut de l'écran */
export const APP_NAME = 'MusiqueProjet';

/** Thème clair. Les contrastes texte/fond respectent les recommandations d'accessibilité (WCAG AA). */
export const colors = {
  background: '#F7F6F3', // fond de l'écran : blanc cassé chaud, moins agressif que le blanc pur
  surface: '#FFFFFF', // cartes, filtres
  surfaceActive: '#ECEAE5', // ligne appuyée
  border: '#E4E2DD', // contours fins des cartes et filtres
  text: '#1A1A1A', // presque noir : plus doux que #000
  textMuted: '#5E5E5E', // artiste, durée, infos secondaires
  textFaint: '#6F6F6F', // détails techniques, liens discrets
  accent: '#1A1A1A', // filtre sélectionné
  onAccent: '#FFFFFF', // texte posé sur accent
  danger: '#C62828', // messages d'erreur
  spotify: '#1DB954',
  onSpotify: '#000000', // texte du bouton Spotify (comme dans l'app Spotify)
  soundcloud: '#FF5500',
  artworkPlaceholder: '#E3E1DC',
};

/** Couleur des icônes de la barre d'état iOS (heure, batterie) : 'dark' sur fond clair */
export const statusBarStyle: 'dark' | 'light' = 'dark';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const radius = {
  sm: 4, // pochettes
  md: 8, // cartes
  pill: 999, // boutons arrondis
};

export const fontSize = {
  caption: 12,
  small: 13,
  body: 15,
  title: 16,
  heading: 30,
};

export const artworkSize = 52;
