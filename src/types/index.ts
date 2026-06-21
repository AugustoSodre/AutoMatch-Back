export interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  surname: string;
  role: "USER" | "ADMIN";
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface CarRow {
  id: string;
  name: string;
  year: number;
  price: number;
  category: string;
  engine: string;
  power: string;
  consumption: string;
  weight: string;
  ipva: number;
  insurance: number;
  maintenance: number;
  features: string[];
  main_image: string;
  thumbnail_images: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedMatchRow {
  id: string;
  user_id: string;
  car_id: string;
  match_percentage: number;
  saved_at: string;
}

export interface CarFormatted {
  id: string;
  name: string;
  year: number;
  price: number;
  category: string;
  specs: {
    engine: string;
    power: string;
    consumption: string;
    weight: string;
  };
  costs: {
    ipva: number;
    insurance: number;
    maintenance: number;
  };
  features: string[];
  images: {
    main: string;
    thumbnails: string[];
  };
}

export interface MatchFormatted {
  id: string;
  car: CarFormatted;
  savedAt: string;
  matchPercentage: number;
}
