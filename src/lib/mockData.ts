// LocalVia Mock Data - Pompei & Napoli Area

export interface City {
  id: string;
  name: string;
  region: string;
  country: string;
  coordinates: { lat: number; lng: number };
  image: string;
  description: string;
  popularFor: string[];
}

export interface Place {
  id: string;
  cityId: string;
  name: string;
  type: 'attraction' | 'museum' | 'viewpoint' | 'experience' | 'landmark';
  description: string;
  shortDescription: string;
  coordinates: { lat: number; lng: number };
  durationMinutes: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  indoor: boolean;
  tags: string[];
  crowdLevel: 'low' | 'medium' | 'high';
  bestTimeOfDay: ('morning' | 'afternoon' | 'evening')[];
  openingHours: { open: string; close: string };
  ticketRequired: boolean;
  ticketPrice?: number;
  mustSeeScore: number; // 1-10
  suitableFor: string[];
  image: string;
}

export interface Restaurant {
  id: string;
  cityId: string;
  name: string;
  cuisine: string[];
  priceRange: 1 | 2 | 3;
  style: 'casual' | 'traditional' | 'fine-dining' | 'street-food';
  coordinates: { lat: number; lng: number };
  tags: string[];
  openingHours: { lunch: { open: string; close: string }; dinner: { open: string; close: string } };
  reservationRecommended: boolean;
  signatureDishes: string[];
  vibe: 'casual' | 'romantic' | 'local' | 'family' | 'trendy';
  image: string;
}

export interface ItinerarySlot {
  id: string;
  type: 'activity' | 'meal' | 'break' | 'transfer';
  startTime: string;
  endTime: string;
  place?: Place;
  restaurant?: Restaurant;
  reason: string;
  alternatives?: (Place | Restaurant)[];
  notes?: string;
  walkingMinutes?: number;
}

export interface ItineraryDay {
  dayNumber: number;
  date: string;
  slots: ItinerarySlot[];
  summary: string;
}

export interface TripPreferences {
  city: string;
  nearbyAreas: boolean;
  dates: { start: Date; end: Date } | null;
  numDays: number;
  travelers: {
    adults: number;
    children: number;
    seniors: number;
  };
  travelWith: 'couple' | 'family' | 'friends' | 'solo';
  interests: string[];
  topInterests: string[];
  rhythm: number; // 1-5 (calm to intense)
  startTime: 'early' | 'normal' | 'late';
  lunchStyle: 'long' | 'quick';
  cuisinePreferences: string[];
  budget: 1 | 2 | 3;
  dietaryRestrictions: string[];
  activityStyle: 'highlights' | 'maximize';
  guidedTours: boolean;
  walkingTolerance: 'low' | 'medium' | 'high';
  accommodation: { zone: string } | null;
  transport: 'walking' | 'car' | 'public' | 'taxi';
  constraints: string[];
  wishes: string;
  avoid: string[];
}

export const cities: City[] = [
  {
    id: 'pompei',
    name: 'Pompei',
    region: 'Campania',
    country: 'Italia',
    coordinates: { lat: 40.7508, lng: 14.4869 },
    image: '/placeholder.svg',
    description: 'L\'antica città romana sepolta dall\'eruzione del Vesuvio nel 79 d.C.',
    popularFor: ['Archeologia', 'Storia Romana', 'UNESCO'],
  },
  {
    id: 'napoli',
    name: 'Napoli',
    region: 'Campania',
    country: 'Italia',
    coordinates: { lat: 40.8518, lng: 14.2681 },
    image: '/placeholder.svg',
    description: 'Vibrante città partenopea, culla della pizza e dell\'arte barocca.',
    popularFor: ['Gastronomia', 'Arte', 'Cultura', 'Mare'],
  },
  {
    id: 'amalfi',
    name: 'Costiera Amalfitana',
    region: 'Campania',
    country: 'Italia',
    coordinates: { lat: 40.6333, lng: 14.6029 },
    image: '/placeholder.svg',
    description: 'Spettacolare costa mediterranea con villaggi colorati a picco sul mare.',
    popularFor: ['Panorami', 'Mare', 'Limoni', 'Romantico'],
  },
];

export const places: Place[] = [
  // Pompei Places
  {
    id: 'scavi-pompei',
    cityId: 'pompei',
    name: 'Scavi di Pompei',
    type: 'attraction',
    description: 'Il sito archeologico più famoso al mondo, una città romana perfettamente conservata sotto le ceneri del Vesuvio. Passeggia tra case, templi, terme e strade antiche.',
    shortDescription: 'Città romana sepolta nel 79 d.C.',
    coordinates: { lat: 40.7508, lng: 14.4869 },
    durationMinutes: 180,
    difficulty: 'moderate',
    indoor: false,
    tags: ['archeologia', 'storia', 'unesco', 'must-see'],
    crowdLevel: 'high',
    bestTimeOfDay: ['morning'],
    openingHours: { open: '09:00', close: '19:00' },
    ticketRequired: true,
    ticketPrice: 18,
    mustSeeScore: 10,
    suitableFor: ['coppie', 'famiglie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
  {
    id: 'villa-misteri',
    cityId: 'pompei',
    name: 'Villa dei Misteri',
    type: 'landmark',
    description: 'Splendida villa romana con affreschi misteriosi legati ai riti dionisiaci. Inclusa nel biglietto degli Scavi.',
    shortDescription: 'Villa con affreschi dionisiaci',
    coordinates: { lat: 40.7544, lng: 14.4785 },
    durationMinutes: 45,
    difficulty: 'easy',
    indoor: true,
    tags: ['archeologia', 'arte', 'affreschi'],
    crowdLevel: 'medium',
    bestTimeOfDay: ['morning', 'afternoon'],
    openingHours: { open: '09:00', close: '19:00' },
    ticketRequired: true,
    ticketPrice: 0,
    mustSeeScore: 9,
    suitableFor: ['coppie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
  {
    id: 'anfiteatro-pompei',
    cityId: 'pompei',
    name: 'Anfiteatro di Pompei',
    type: 'landmark',
    description: 'Il più antico anfiteatro romano in pietra ancora esistente, poteva ospitare 20.000 spettatori.',
    shortDescription: 'Anfiteatro romano del I secolo a.C.',
    coordinates: { lat: 40.7489, lng: 14.4946 },
    durationMinutes: 30,
    difficulty: 'easy',
    indoor: false,
    tags: ['archeologia', 'architettura', 'storia'],
    crowdLevel: 'low',
    bestTimeOfDay: ['afternoon'],
    openingHours: { open: '09:00', close: '19:00' },
    ticketRequired: true,
    ticketPrice: 0,
    mustSeeScore: 7,
    suitableFor: ['coppie', 'famiglie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
  // Napoli Places
  {
    id: 'spaccanapoli',
    cityId: 'napoli',
    name: 'Spaccanapoli',
    type: 'experience',
    description: 'La storica arteria che "spacca" il centro antico di Napoli. Chiese barocche, botteghe artigiane, street food e vita autentica.',
    shortDescription: 'Il cuore pulsante del centro storico',
    coordinates: { lat: 40.8498, lng: 14.2565 },
    durationMinutes: 90,
    difficulty: 'easy',
    indoor: false,
    tags: ['cultura', 'shopping', 'street-food', 'architettura'],
    crowdLevel: 'high',
    bestTimeOfDay: ['morning', 'afternoon'],
    openingHours: { open: '00:00', close: '23:59' },
    ticketRequired: false,
    mustSeeScore: 9,
    suitableFor: ['coppie', 'famiglie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
  {
    id: 'museo-archeologico',
    cityId: 'napoli',
    name: 'Museo Archeologico Nazionale',
    type: 'museum',
    description: 'Uno dei più importanti musei archeologici al mondo. Custodisce tesori da Pompei, Ercolano e la collezione Farnese.',
    shortDescription: 'Tesori di Pompei ed Ercolano',
    coordinates: { lat: 40.8535, lng: 14.2507 },
    durationMinutes: 150,
    difficulty: 'easy',
    indoor: true,
    tags: ['museo', 'archeologia', 'arte', 'storia'],
    crowdLevel: 'medium',
    bestTimeOfDay: ['morning', 'afternoon'],
    openingHours: { open: '09:00', close: '19:30' },
    ticketRequired: true,
    ticketPrice: 18,
    mustSeeScore: 9,
    suitableFor: ['coppie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
  {
    id: 'castel-ovo',
    cityId: 'napoli',
    name: 'Castel dell\'Ovo',
    type: 'viewpoint',
    description: 'Il castello più antico di Napoli, su un isolotto nel golfo. Vista mozzafiato e passeggiata romantica.',
    shortDescription: 'Castello sul mare con vista golfo',
    coordinates: { lat: 40.8284, lng: 14.2478 },
    durationMinutes: 60,
    difficulty: 'easy',
    indoor: false,
    tags: ['panorama', 'storia', 'romantico', 'mare'],
    crowdLevel: 'medium',
    bestTimeOfDay: ['afternoon', 'evening'],
    openingHours: { open: '09:00', close: '18:00' },
    ticketRequired: false,
    mustSeeScore: 8,
    suitableFor: ['coppie', 'famiglie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
  {
    id: 'cappella-sansevero',
    cityId: 'napoli',
    name: 'Cappella Sansevero',
    type: 'museum',
    description: 'Piccolo gioiello barocco che ospita il Cristo Velato, capolavoro scultoreo di straordinaria bellezza.',
    shortDescription: 'Il Cristo Velato e arte barocca',
    coordinates: { lat: 40.8489, lng: 14.2544 },
    durationMinutes: 45,
    difficulty: 'easy',
    indoor: true,
    tags: ['arte', 'barocco', 'scultura', 'must-see'],
    crowdLevel: 'high',
    bestTimeOfDay: ['morning'],
    openingHours: { open: '09:00', close: '19:00' },
    ticketRequired: true,
    ticketPrice: 10,
    mustSeeScore: 10,
    suitableFor: ['coppie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
  {
    id: 'lungomare',
    cityId: 'napoli',
    name: 'Lungomare Caracciolo',
    type: 'viewpoint',
    description: 'Passeggiata panoramica sul golfo con vista Vesuvio e Capri. Perfetta al tramonto.',
    shortDescription: 'Passeggiata vista mare e Vesuvio',
    coordinates: { lat: 40.8305, lng: 14.2385 },
    durationMinutes: 45,
    difficulty: 'easy',
    indoor: false,
    tags: ['panorama', 'passeggiata', 'tramonto', 'relax'],
    crowdLevel: 'low',
    bestTimeOfDay: ['evening'],
    openingHours: { open: '00:00', close: '23:59' },
    ticketRequired: false,
    mustSeeScore: 8,
    suitableFor: ['coppie', 'famiglie', 'amici', 'solo'],
    image: '/placeholder.svg',
  },
];

export const restaurants: Restaurant[] = [
  // Pompei Restaurants
  {
    id: 'president-pompei',
    cityId: 'pompei',
    name: 'President',
    cuisine: ['napoletana', 'pesce', 'pizza'],
    priceRange: 2,
    style: 'traditional',
    coordinates: { lat: 40.7492, lng: 14.5005 },
    tags: ['pizza', 'pesce', 'tradizionale', 'vista'],
    openingHours: {
      lunch: { open: '12:00', close: '15:00' },
      dinner: { open: '19:00', close: '23:00' },
    },
    reservationRecommended: true,
    signatureDishes: ['Frittura di paranza', 'Pizza Margherita', 'Spaghetti alle vongole'],
    vibe: 'family',
    image: '/placeholder.svg',
  },
  {
    id: 'add-u-mimi',
    cityId: 'pompei',
    name: 'Add\'u Mimì',
    cuisine: ['napoletana', 'casalinga'],
    priceRange: 1,
    style: 'casual',
    coordinates: { lat: 40.7485, lng: 14.4998 },
    tags: ['tradizionale', 'economico', 'autentico'],
    openingHours: {
      lunch: { open: '12:00', close: '15:30' },
      dinner: { open: '19:00', close: '22:30' },
    },
    reservationRecommended: false,
    signatureDishes: ['Genovese', 'Parmigiana', 'Pasta e fagioli'],
    vibe: 'local',
    image: '/placeholder.svg',
  },
  // Napoli Restaurants
  {
    id: 'da-michele',
    cityId: 'napoli',
    name: 'L\'Antica Pizzeria Da Michele',
    cuisine: ['pizza'],
    priceRange: 1,
    style: 'traditional',
    coordinates: { lat: 40.8500, lng: 14.2611 },
    tags: ['pizza', 'storico', 'iconico', 'coda'],
    openingHours: {
      lunch: { open: '10:30', close: '15:00' },
      dinner: { open: '17:00', close: '23:00' },
    },
    reservationRecommended: false,
    signatureDishes: ['Margherita', 'Marinara'],
    vibe: 'local',
    image: '/placeholder.svg',
  },
  {
    id: 'tandem',
    cityId: 'napoli',
    name: 'Tandem Ragu',
    cuisine: ['napoletana'],
    priceRange: 1,
    style: 'casual',
    coordinates: { lat: 40.8471, lng: 14.2553 },
    tags: ['ragu', 'tradizionale', 'autentico'],
    openingHours: {
      lunch: { open: '12:00', close: '15:30' },
      dinner: { open: '19:00', close: '23:00' },
    },
    reservationRecommended: true,
    signatureDishes: ['Candela spezzata al ragù', 'Paccheri al ragù', 'Polpette al ragù'],
    vibe: 'casual',
    image: '/placeholder.svg',
  },
  {
    id: 'rosiello',
    cityId: 'napoli',
    name: 'Ristorante Rosiello',
    cuisine: ['napoletana', 'pesce'],
    priceRange: 3,
    style: 'fine-dining',
    coordinates: { lat: 40.8117, lng: 14.2131 },
    tags: ['pesce', 'elegante', 'vista-mare', 'romantico'],
    openingHours: {
      lunch: { open: '12:30', close: '15:00' },
      dinner: { open: '19:30', close: '23:00' },
    },
    reservationRecommended: true,
    signatureDishes: ['Crudo di mare', 'Linguine all\'astice', 'Spigola in crosta'],
    vibe: 'romantic',
    image: '/placeholder.svg',
  },
];

export const interests = [
  { id: 'archeologia', label: 'Archeologia e Storia', icon: '🏛️' },
  { id: 'architettura', label: 'Architettura locale', icon: '🏰' },
  { id: 'cibo', label: 'Gastronomia', icon: '🍕' },
  { id: 'panorami', label: 'Panorami e Viste', icon: '🌅' },
  { id: 'musei', label: 'Musei e Arte', icon: '🎨' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'relax', label: 'Relax e Benessere', icon: '🧘' },
  { id: 'nightlife', label: 'Vita notturna', icon: '🌙' },
  { id: 'natura', label: 'Natura e Parchi', icon: '🌿' },
  { id: 'mare', label: 'Mare e Spiagge', icon: '🏖️' },
];

export const cuisineTypes = [
  { id: 'tradizionale', label: 'Cucina tradizionale' },
  { id: 'street-food', label: 'Street food' },
  { id: 'fine-dining', label: 'Fine dining' },
  { id: 'pizza', label: 'Pizzerie' },
  { id: 'pesce', label: 'Ristoranti di pesce' },
  { id: 'vegetariano', label: 'Vegetariano' },
];

export const dietaryRestrictions = [
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'gluten-free', label: 'Senza glutine' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'allergie', label: 'Allergie alimentari' },
];

export const avoidOptions = [
  { id: 'folla', label: 'Luoghi affollati' },
  { id: 'scalinate', label: 'Troppe scalinate' },
  { id: 'lunghe-camminate', label: 'Lunghe camminate' },
  { id: 'sole', label: 'Troppo sole' },
  { id: 'turisti', label: 'Zone troppo turistiche' },
];

export const defaultPreferences: TripPreferences = {
  city: '',
  nearbyAreas: false,
  dates: null,
  numDays: 2,
  travelers: { adults: 2, children: 0, seniors: 0 },
  travelWith: 'couple',
  interests: [],
  topInterests: [],
  rhythm: 3,
  startTime: 'normal',
  lunchStyle: 'long',
  cuisinePreferences: ['tradizionale'],
  budget: 2,
  dietaryRestrictions: [],
  activityStyle: 'highlights',
  guidedTours: false,
  walkingTolerance: 'medium',
  accommodation: null,
  transport: 'walking',
  constraints: [],
  wishes: '',
  avoid: [],
};
