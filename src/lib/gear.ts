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
export type CatalogCategory = "SHOE" | "WATCH";

export const GEAR_PRODUCT_CATALOG: Record<CatalogCategory, Record<string, string[]>> = {
  SHOE: {
    Nike: ["Vaporfly 3", "Alphafly 3", "Pegasus 41", "Invincible 3", "Zoom Fly 6", "Structure 25"],
    Adidas: ["Adizero Adios Pro 4", "Adizero Boston 12", "Adizero SL2", "Ultraboost 22", "Supernova Rise"],
    Hoka: ["Rocket X 2", "Mach 6", "Clifton 9", "Bondi 8", "Speedgoat 5"],
    Asics: ["Metaspeed Sky Paris", "Gel-Kayano 31", "Novablast 4", "Gel-Nimbus 26", "Superblast"],
    Brooks: ["Hyperion Elite 2", "Ghost 16", "Glycerin 21", "Adrenaline GTS 23"],
    Saucony: ["Endorphin Pro 4", "Endorphin Speed 4", "Ride 17", "Triumph 22"],
    "New Balance": ["FuelCell SC Elite v4", "Rebel v4", "1080v13", "880v14"],
    On: ["Cloudboom Strike LS", "Cloudmonster", "Cloudsurfer"],
  },
  WATCH: {
    Garmin: ["Forerunner 965", "Forerunner 265", "Fenix 8", "Epix Pro", "Instinct 3"],
    "Apple Watch": ["Ultra 2", "Series 10", "SE"],
    Coros: ["Pace 3", "Apex 2 Pro", "Vertix 2"],
    Polar: ["Vantage V3", "Pacer Pro", "Grit X2"],
    Suunto: ["Race", "9 Peak Pro"],
  },
};
