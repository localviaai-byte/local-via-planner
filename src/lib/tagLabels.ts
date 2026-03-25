/**
 * Human-readable labels for backend tag keys.
 * Shared across components to avoid raw snake_case in the UI.
 */

export const foodCategoryLabels: Record<string, { label: string; emoji: string }> = {
  pesce: { label: 'Pesce', emoji: '🐟' },
  carne: { label: 'Carne', emoji: '🥩' },
  pizza: { label: 'Pizza', emoji: '🍕' },
  pasta: { label: 'Pasta', emoji: '🍝' },
  vegetariano: { label: 'Vegetariano', emoji: '🥗' },
  street_food: { label: 'Street Food', emoji: '🌮' },
  dolci: { label: 'Dolci', emoji: '🍰' },
  misto: { label: 'Misto', emoji: '🍽️' },
  fritti: { label: 'Fritti', emoji: '🍟' },
  gelato: { label: 'Gelato', emoji: '🍦' },
  caffetteria: { label: 'Caffetteria', emoji: '☕' },
  panini: { label: 'Panini', emoji: '🥖' },
  aperitivo: { label: 'Aperitivo', emoji: '🥂' },
  cocktail: { label: 'Cocktail', emoji: '🍸' },
  vino: { label: 'Vino', emoji: '🍷' },
  birra: { label: 'Birra', emoji: '🍺' },
  colazione: { label: 'Colazione', emoji: '🥐' },
  brunch: { label: 'Brunch', emoji: '🍳' },
  tapas: { label: 'Tapas', emoji: '🫒' },
  sushi: { label: 'Sushi', emoji: '🍣' },
  cucina_locale: { label: 'Cucina locale', emoji: '🏡' },
  cucina_internazionale: { label: 'Cucina internazionale', emoji: '🌍' },
  gourmet: { label: 'Gourmet', emoji: '⭐' },
  trattoria: { label: 'Trattoria', emoji: '🍷' },
  osteria: { label: 'Osteria', emoji: '🏺' },
  pescheria: { label: 'Pescheria', emoji: '🐠' },
  rosticceria: { label: 'Rosticceria', emoji: '🍗' },
  gastronomia: { label: 'Gastronomia', emoji: '🧀' },
  enoteca: { label: 'Enoteca', emoji: '🍇' },
  pasticceria: { label: 'Pasticceria', emoji: '🧁' },
  gelateria: { label: 'Gelateria', emoji: '🍨' },
};

export const formatExperienceLabels: Record<string, { label: string; emoji: string }> = {
  street_food: { label: 'Street Food', emoji: '🌮' },
  vista_panoramica: { label: 'Vista panoramica', emoji: '🌅' },
  degustazione: { label: 'Degustazione', emoji: '🍷' },
  cooking_class: { label: 'Cooking class', emoji: '👨‍🍳' },
  food_tour: { label: 'Food tour', emoji: '🚶' },
  wine_tasting: { label: 'Wine tasting', emoji: '🍇' },
  mercato: { label: 'Mercato', emoji: '🏪' },
  ristorante_storico: { label: 'Ristorante storico', emoji: '🏛️' },
  locale_notturno: { label: 'Locale notturno', emoji: '🌙' },
  rooftop: { label: 'Rooftop', emoji: '🏙️' },
  giardino: { label: 'Giardino', emoji: '🌿' },
  sul_mare: { label: 'Sul mare', emoji: '🌊' },
  terrazza: { label: 'Terrazza', emoji: '☀️' },
  cortile: { label: 'Cortile', emoji: '🏡' },
  live_music: { label: 'Live music', emoji: '🎵' },
  dj_set: { label: 'DJ set', emoji: '🎧' },
  spettacolo: { label: 'Spettacolo', emoji: '🎭' },
  laboratorio: { label: 'Laboratorio', emoji: '🔧' },
  visita_guidata: { label: 'Visita guidata', emoji: '🎙️' },
};

/** Convert a snake_case tag key to a friendly label */
export function formatTagLabel(key: string, labels?: Record<string, { label: string; emoji: string }>): string {
  if (labels && labels[key]) return labels[key].label;
  // Fallback: capitalize and replace underscores
  return key
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatTagWithEmoji(key: string, labels: Record<string, { label: string; emoji: string }>): string {
  const info = labels[key];
  if (info) return `${info.emoji} ${info.label}`;
  return `🍽️ ${formatTagLabel(key)}`;
}
