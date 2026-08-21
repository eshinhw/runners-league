import type { GearCategory } from "@/generated/prisma/client";

export const GEAR_CATEGORY_LABEL: Record<GearCategory, string> = {
  SHOE: "Shoes",
  WATCH: "Watch",
  APPAREL: "Apparel",
  HAT: "Hat",
  ACCESSORY: "Headphones",
  NUTRITION: "Nutrition",
};

// Curated top-level list shown in the app — kept to 5 broad categories for
// now. HAT stays a valid GearCategory value in the database but isn't
// surfaced here until a dedicated slot for it is designed.
export const GEAR_CATEGORY_ORDER: GearCategory[] = ["SHOE", "WATCH", "APPAREL", "ACCESSORY", "NUTRITION"];

// Categories that get a cascading Brand -> Model picker instead of free-text
// brand/model inputs.
export type CatalogCategory = "SHOE" | "WATCH" | "ACCESSORY";

export const GEAR_PRODUCT_CATALOG: Record<CatalogCategory, Record<string, string[]>> = {
  SHOE: {
    Nike: ["Vaporfly 4", "Alphafly 3", "Vomero Plus", "Pegasus 41", "Invincible 3", "Structure 25", "Zoom Fly 6"],
    Adidas: [
      "Adizero Evo SL",
      "Adizero Adios Pro 4",
      "Adizero Boston 13",
      "Adizero SL2",
      "Ultraboost 22",
      "Supernova Rise",
    ],
    Hoka: ["Rocket X 2", "Mach 7", "Clifton 10", "Bondi 9", "Speedgoat 6"],
    Asics: ["Metaspeed Sky Paris", "Novablast 5", "Gel-Nimbus 28", "Gel-Kayano 31", "Superblast 2"],
    Brooks: ["Hyperion Elite 2", "Ghost 17", "Glycerin 22", "Adrenaline GTS 25"],
    Saucony: ["Endorphin Pro 4", "Endorphin Speed 4", "Ride 19", "Triumph 22"],
    "New Balance": ["FuelCell SC Elite v4", "Rebel v5", "1080v15", "880v15"],
    On: ["Cloudboom Strike LS", "Cloudmonster 3", "Cloudsurfer 2"],
    Puma: ["Fast-R Nitro Elite 2", "Deviate Nitro 3", "Velocity Nitro 3"],
    Mizuno: ["Wave Rebellion Pro", "Wave Rider 28", "Wave Sky 8"],
    Altra: ["Vanish Tempo 2", "Escalante 4", "Torin 8"],
  },
  WATCH: {
    Garmin: ["Forerunner 970", "Forerunner 265", "Fenix 8 Pro", "Epix Pro", "Instinct 3", "Enduro 3"],
    "Apple Watch": ["Ultra 2", "Series 10", "SE"],
    Coros: ["Pace 4", "Pace 3", "Apex 4", "Apex 2 Pro", "Vertix 2"],
    Polar: ["Vantage V3", "Grit X2", "Pacer Pro"],
    Suunto: ["Race 2", "Vertical 2", "9 Peak Pro"],
    Wahoo: ["Elemnt Rival"],
    Amazfit: ["Cheetah Pro", "Balance"],
  },
  ACCESSORY: {
    Shokz: ["OpenRun Pro 2", "OpenRun", "OpenFit", "OpenSwim Pro"],
    Bose: ["Ultra Open Earbuds", "QuietComfort Ultra Earbuds", "Sport Earbuds"],
    Beats: ["Powerbeats Pro 2", "Fit Pro", "Powerbeats Pro"],
    Apple: ["AirPods Pro 2", "AirPods 4"],
    Jabra: ["Elite 10", "Elite 8 Active"],
    JBL: ["Endurance Peak 3", "Reflect Aero"],
    Soundcore: ["AeroFit Pro", "Sport X10"],
  },
};

// Categories that only offer a Brand picker — no specific model, since these
// products aren't meaningfully tracked by model the way shoes/watches are.
export type BrandOnlyCategory = "APPAREL" | "NUTRITION";

export function isCatalogCategory(category: GearCategory): category is CatalogCategory {
  return category === "SHOE" || category === "WATCH" || category === "ACCESSORY";
}

export function isBrandOnlyCategory(category: GearCategory): category is BrandOnlyCategory {
  return category === "APPAREL" || category === "NUTRITION";
}

// Sentinel used by Add/Edit Gear forms to switch a brand/model picker to
// free-text entry.
export const OTHER_BRAND = "__other__";

export const GEAR_BRAND_LIST: Record<BrandOnlyCategory, string[]> = {
  APPAREL: [
    "Nike",
    "Adidas",
    "lululemon",
    "On",
    "Brooks",
    "Under Armour",
    "Tracksmith",
    "Ciele Athletics",
    "Path Projects",
    "Bandit Running",
    "Smartwool",
    "2XU",
  ],
  NUTRITION: [
    "GU Energy",
    "Maurten",
    "Precision Fuel & Hydration",
    "Science in Sport (SiS)",
    "Skratch Labs",
    "Honey Stinger",
    "Neversecond",
    "UCAN",
    "Tailwind Nutrition",
    "Clif",
  ],
};
