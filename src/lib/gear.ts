import type { GearCategory } from "@/generated/prisma/client";

export const GEAR_CATEGORY_LABEL: Record<GearCategory, string> = {
  SHOE: "Shoes",
  WATCH: "Watch",
  HEADPHONES: "Headphones",
  APPAREL: "Apparel",
  RUNNING_BELT: "Running Belt",
  HYDRATION_VEST: "Hydration Vest",
  SUNGLASSES: "Sunglasses",
  HEADLAMP: "Headlamp",
  GLOVES: "Gloves",
  NUTRITION: "Nutrition",
};

// Curated top-level list shown in the app. The former single "Accessories"
// bucket was split into its own top-level category per type — that way each
// type gets its own favorite (favorites are one-per-category) and its own
// Top Gears leaderboard, instead of competing for one shared slot.
export const GEAR_CATEGORY_ORDER: GearCategory[] = [
  "SHOE",
  "WATCH",
  "HEADPHONES",
  "APPAREL",
  "RUNNING_BELT",
  "HYDRATION_VEST",
  "SUNGLASSES",
  "HEADLAMP",
  "GLOVES",
  "NUTRITION",
];

// Categories that get a cascading Brand -> Model picker instead of free-text
// brand/model inputs.
export type CatalogCategory = "SHOE" | "WATCH" | "HEADPHONES";

export const GEAR_PRODUCT_CATALOG: Record<CatalogCategory, Record<string, string[]>> = {
  SHOE: {
    Nike: [
      // Daily / Responsive Cushioning
      "Pegasus 40",
      "Pegasus 41",
      "Pegasus 42",
      "Pegasus Plus",
      "Pegasus Plus 2",
      "Pegasus Premium",

      // Maximum Cushioning
      "Vomero 17",
      "Vomero 18",
      "Vomero Plus",
      "Vomero Premium",

      // Stability / Supportive Cushioning
      "Structure 25",
      "Structure 26",
      "Structure Plus",

      // Performance Training
      "Zoom Fly 5",
      "Zoom Fly 6",
      "Streakfly",
      "Streakfly 2",

      // Racing
      "Vaporfly 3",
      "Vaporfly 4",
      "Alphafly 3",

      // Trail
      "Pegasus Trail 4",
      "Pegasus Trail 5",
      "Zegama 2",
      "Zegama Trail",
      "ACG Ultrafly Trail",

      // Entry-level / Casual Running
      "Winflo 10",
      "Winflo 11",
      "Winflo 12",
      "Revolution 7",
      "Revolution 8",
      "Downshifter 13",
      "Downshifter 14",
      "Quest 5",
      "Journey Run",
      "Run Swift 3",
      "Interact Run",

      // Natural / Lightweight
      "Free Run 5.0",
      "Free RN NN",
      "Flex Experience Run 12",
    ],
    Adidas: [
      // Daily / Neutral
      "Supernova Rise",
      "Supernova Rise 2",
      "Supernova Rise 3",
      "Supernova Solution",
      "Supernova Prima",
      "Supernova Prima 2",
      "Supernova Prima 3",
      "Supernova Stride",
      "Supernova Stride 2",
      "Supernova Stride 3",

      // Maximum Cushioning
      "Ultraboost Light",
      "Ultraboost 5",
      "Ultraboost 5X",
      "Ultraboost 5X 2",
      "Ultraboost 5X ATR",
      "Ultraboost 5X GTX",
      "Hyperboost",
      "Hyperboost Edge",

      // Adizero Daily / Performance Training
      "Adizero SL",
      "Adizero SL 2",
      "Adizero SL 2.5",
      "Adizero Evo SL",
      "Adizero Evo SL 2",
      "Adizero Boston 12",
      "Adizero Boston 13",
      "Adizero Boston 14",

      // Adizero Speed / Racing
      "Adizero Takumi Sen 10",
      "Adizero Takumi Sen 11",
      "Adizero Adios 8",
      "Adizero Adios 9",
      "Adizero Adios 10",
      "Adizero Adios Pro 3",
      "Adizero Adios Pro 4",
      "Adizero Adios Pro 5",
      "Adizero Prime X 2 Strung",
      "Adizero Prime X 3 Strung",

      // Lightweight / Tempo
      "Adizero RC 5",
      "Adizero EVO SL",

      // Stability
      "Supernova Solution 2",

      // Trail
      "Terrex Agravic 3",
      "Terrex Agravic Speed",
      "Terrex Agravic Speed Ultra",
      "Terrex Agravic GTX",
      "Terrex Soulstride",
      "Terrex Soulstride Flow",
      "Terrex Agravic Speed Ultra 2",

      // Entry-level / Everyday
      "Duramo SL",
      "Duramo SL 2",
      "Duramo Speed",
      "Duramo Speed 2",
      "Runfalcon 3.0",
      "Runfalcon 5",
      "Galaxy 7",
      "Galaxy 8",
      "Response Super",
      "Response Runner",
    ],
    Hoka: [
      // Daily / Neutral
      "Clifton 9",
      "Clifton 10",
      "Clifton 11",
      "Clifton 12",
      "Skyflow",
      "Skyflow 2",
      "Rincon 3",
      "Rincon 4",

      // Maximum Cushioning
      "Bondi 8",
      "Bondi 9",
      "Bondi X",
      "Skyward X",
      "Skyward X 2",

      // Stability
      "Arahi 7",
      "Arahi 8",
      "Gaviota 5",
      "Gaviota 6",
      "Gaviota 7",

      // Speed / Tempo Training
      "Mach 6",
      "Mach 7",
      "Mach X",
      "Mach X 2",
      "Mach X 3",

      // Racing
      "Cielo X1",
      "Cielo X1 2.0",
      "Cielo X1 3.0",
      "Rocket X 2",
      "Rocket X 3",

      // Trail
      "Speedgoat 5",
      "Speedgoat 6",
      "Speedgoat 7",
      "Challenger 7",
      "Challenger 8",
      "Challenger ATR 7",
      "Challenger ATR 8",
      "Mafate Speed 4",
      "Mafate Speed 5",
      "Tecton X 3",
      "Tecton X 4",
      "Torrent 3",
      "Torrent 4",
      "Mafate X",
      "Mafate X 2",
    ],
    Asics: [
      "Gel-Kayano 30",
      "Gel-Kayano 31",
      "Gel-Kayano 32",
      "Gel-Kayano 33",
      "GT-2000 12",
      "GT-2000 13",
      "GT-2000 14",
      "GT-2000 15",
      "GT-1000 12",
      "GT-1000 13",
      "GT-1000 14",
      "GT-1000 15",
      "Gel-Nimbus 26",
      "Gel-Nimbus 27",
      "Gel-Nimbus 28",
      "Gel-Cumulus 26",
      "Gel-Cumulus 27",
      "Gel-Cumulus 28",
      "Gel-Pulse 15",
      "Gel-Pulse 16",
      "Gel-Excite 10",
      "Gel-Excite 11",
      "Gel-Contend 9",
      "Gel-Contend 10",
      "Patriot 13",
      "Patriot 14",
      "Dynablast 4",
      "Dynablast 5",
      "Novablast 4",
      "Novablast 5",
      "Novablast 6",
      "Superblast",
      "Superblast 2",
      "Superblast 3",
      "Sonicblast",
      "Megablast",
      "Glideride Max",
      "Glideride Max 2",
      "Magic Speed 3",
      "Magic Speed 4",
      "Magic Speed 5",
      "Metaspeed Sky+",
      "Metaspeed Sky Paris",
      "Metaspeed Edge+",
      "Metaspeed Edge Paris",
      "Metaspeed Ray",
      "Metaspeed Sky Tokyo",
      "Metaspeed Edge Tokyo",
      "S4",
      "S4+ Yogiri",
      "Hyper Speed 5",
      "Hyper Speed 6",
      "Noosa Tri 16",
      "Tarther RP 3",
      "Lyteracer 6",
      "Trabuco Max 3",
      "Trabuco Max 4",
      "Gel-Trabuco 12",
      "Gel-Trabuco 13",
      "Gel-Sonoma 7",
      "Metafuji Trail",
    ],
    Brooks: [
      // Daily / Neutral
      "Ghost 16",
      "Ghost 17",
      "Ghost 18",
      "Revel 7",
      "Revel 8",
      "Revel 9",
      "Launch 10",
      "Launch 11",
      "Launch 12",

      // Max Cushion
      "Glycerin 21",
      "Glycerin 22",
      "Glycerin 23",
      "Ghost Max",
      "Ghost Max 2",
      "Ghost Max 3",
      "Ghost Max 4",
      "Glycerin Max",
      "Glycerin Max 2",

      // Stability
      "Adrenaline GTS 23",
      "Adrenaline GTS 24",
      "Adrenaline GTS 25",
      "Ariel GTS 24",
      "Ariel GTS 25",
      "Ariel GTS 26",
      "Beast GTS 24",
      "Beast GTS 25",
      "Beast GTS 26",
      "Glycerin GTS 21",
      "Glycerin GTS 22",
      "Glycerin GTS 23",

      // Speed / Tempo Training
      "Hyperion 2",
      "Hyperion 3",
      "Hyperion Max",
      "Hyperion Max 2",
      "Hyperion Max 3",
      "Hyperion Max 4",

      // Racing
      "Hyperion Elite 4",
      "Hyperion Elite 5",
      "Hyperion Elite 6",

      // Trail
      "Cascadia 17",
      "Cascadia 18",
      "Cascadia 19",
      "Caldera 7",
      "Caldera 8",
      "Catamount 3",
      "Catamount 4",
      "Catamount Agil",
      "Divide 5",
      "Divide 6",
      "Ghost Trail",
    ],
    Saucony: [
      // Daily / Neutral
      "Ride 17",
      "Ride 18",
      "Ride 19",
      "Kinvara 15",
      "Kinvara 16",
      "Cohesion 17",
      "Cohesion 18",

      // Max Cushion
      "Triumph 21",
      "Triumph 22",
      "Triumph 23",
      "Triumph 24",
      "Hurricane 24",
      "Hurricane 25",
      "Hurricane 26",
      "Paramount 5",
      "Paramount 6",
      "Paramount Max",

      // Stability
      "Guide 17",
      "Guide 18",
      "Guide 19",
      "Omni 21",
      "Omni 22",
      "Echelon 9",
      "Echelon 10",

      // Endorphin / Performance Training
      "Endorphin Speed 3",
      "Endorphin Speed 4",
      "Endorphin Speed 5",
      "Endorphin Shift 3",
      "Endorphin Shift 4",
      "Endorphin Azura",

      // Racing
      "Endorphin Pro 4",
      "Endorphin Pro 5",
      "Endorphin Elite",
      "Endorphin Elite 2",
      "Endorphin Elite 3",

      // Lightweight / Fast

      // Trail
      "Peregrine 14",
      "Peregrine 15",
      "Peregrine 16",
      "Xodus Ultra 2",
      "Xodus Ultra 3",
      "Xodus Ultra 4",
      "Ride TR2",
      "Ride TR3",
      "Excursion TR16",
      "Excursion TR17",
      "Guide TR",
      "Guide TR Max",
    ],
    "New Balance": [
      // Daily / Neutral
      "Fresh Foam X 1080v13",
      "Fresh Foam X 1080v14",
      "Fresh Foam X 1080v15",
      "Fresh Foam X 880v14",
      "Fresh Foam X 880v15",
      "Fresh Foam X 880v16",
      "Fresh Foam X 680v8",
      "Fresh Foam X 680v9",
      "Fresh Foam X 680v10",

      // Max Cushion
      "Fresh Foam X More v5",
      "Fresh Foam X More v6",
      "Fresh Foam X More v7",

      // Stability
      "Fresh Foam X 860v13",
      "Fresh Foam X 860v14",
      "Fresh Foam X 860v15",
      "Fresh Foam X Vongo v6",
      "Fresh Foam X Vongo v7",
      "Fresh Foam X Vongo v8",

      // Performance / Speed Training
      "FuelCell Rebel v4",
      "FuelCell Rebel v5",
      "FuelCell Propel v5",
      "FuelCell Propel v6",
      "FuelCell SuperComp Trainer v2",
      "FuelCell SuperComp Trainer v3",
      "FuelCell SuperComp Trainer v4",

      // Racing
      "FuelCell SuperComp Elite v4",
      "FuelCell SuperComp Elite v5",
      "FuelCell SuperComp Elite v6",
      "FuelCell SC Pacer",
      "FuelCell SC Pacer v2",

      // Lightweight / Tempo

      // Trail
      "Fresh Foam X Hierro v7",
      "Fresh Foam X Hierro v8",
      "Fresh Foam X Hierro v9",
      "Fresh Foam X More Trail v3",
      "Fresh Foam X More Trail v4",
      "FuelCell Summit Unknown v4",
      "Fresh Foam X Trail More v2",
      "Fresh Foam X Trail More v3",
    ],
    On: [
      // Daily / Neutral
      "Cloudsurfer",
      "Cloudsurfer 2",
      "Cloudsurfer Max",
      "Cloudsurfer Next",
      "Cloudswift 3",
      "Cloudswift 4",
      "Cloudmonster",
      "Cloudmonster 2",
      "Cloudmonster 3",

      // Max Cushion / Long Run
      "Cloudmonster 3 Hyper",

      // Stability
      "Cloudrunner 2",
      "Cloudrunner 3",
      "Cloudrunner 3 Max",
      "Cloudrunner 2 Waterproof",
      "Cloudrunner 3 Waterproof",

      // Speed / Tempo Training
      "Cloudflow 4",
      "Cloudflow 5",
      "Cloud X 4",
      "Cloud X Tempo",

      // Racing
      "Cloudboom Echo 3",
      "Cloudboom Strike",
      "Cloudboom Strike 2",
      "Cloudboom Echo 4",
      "Cloudboom Max",
      "Cloudboom Volt",

      // Trail
      "Cloudultra 2",
      "Cloudultra 3",
      "Cloudultra Pro",
      "Cloudultra Peak",
      "Cloudsurfer Trail",
      "Cloudsurfer Trail 2",
      "Cloudvista 2",
      "Cloudvista 3",
    ],
    Puma: [
      // Daily / Neutral
      "Velocity Nitro 3",
      "Velocity Nitro 4",
      "Velocity Nitro 5",
      "Deviate Pure Nitro",
      "Deviate Pure Nitro 2",

      // Max Cushion
      "Magnify Nitro 2",
      "Magnify Nitro 3",
      "MagMax Nitro",
      "MagMax Nitro 2",

      // Stability
      "ForeverRun Nitro",
      "ForeverRun Nitro 2",
      "ForeverRun Nitro 3",

      // Speed / Performance Training
      "Deviate Nitro 2",
      "Deviate Nitro 3",
      "Deviate Nitro 4",
      "Deviate Nitro Elite 2",
      "Deviate Nitro Elite 3",
      "Deviate Nitro Elite 4",

      // Racing
      "Fast-R Nitro Elite",
      "Fast-R Nitro Elite 2",
      "Fast-R Nitro Elite 3",
      "Fast-FWD Nitro Elite",
      "Fast-FWD Nitro Elite 2",

      // Trail
      "Voyage Nitro 3",
      "Voyage Nitro 4",
      "Fast-Trac Nitro 3",
      "Fast-Trac Nitro 4",
      "Explore Nitro",
      "Explore NITRO GTX",
    ],
    Mizuno: [
      // Daily / Neutral
      "Wave Rider 27",
      "Wave Rider 28",
      "Wave Rider 29",
      "Wave Sky 7",
      "Wave Sky 8",
      "Wave Sky 9",
      "Wave Skyrise 5",
      "Wave Skyrise 6",
      "Wave Rebellion Flash 2",
      "Wave Rebellion Flash 3",

      // Max Cushion / Float

      // Stability
      "Wave Inspire 20",
      "Wave Inspire 21",
      "Wave Inspire 22",
      "Wave Horizon 7",
      "Wave Horizon 8",

      // Super Trainer / Performance
      "Mizuno Neo Vista",
      "Mizuno Neo Vista 2",

      // Speed / Racing
      "Wave Rebellion Pro 2",
      "Wave Rebellion Pro 3",
      "Wave Rebellion Pro 3 Lo",
      "Wave Rebellion Pro 4",

      // Lightweight / Speed
      "Wave Duel Pro QTR",
      "Wave Duel Pro",

      // Entry-level / Everyday
      "Wave Revolt 3",
      "Wave Revolt 4",
      "Wave Revolt 5",
      "Wave Prodigy 4",
      "Wave Prodigy 5",

      // Trail
      "Wave Daichi 8",
      "Wave Daichi 9",
      "Wave Daichi 10",
      "Wave Mujin 10",
      "Wave Mujin 11",
      "Wave Mujin 12",
      "Wave Rider TT",
      "Wave Ibuki 4",
      "Wave Ibuki 5",
    ],
    Altra: [
      // Daily / Neutral
      "Torin 7",
      "Torin 8",
      "Torin 9",
      "Escalante 3",
      "Escalante 4",
      "Escalante 5",
      "Experience Flow",
      "Experience Flow 2",
      "Experience Flow 3",

      // Max Cushion
      "Via Olympus 2",
      "Via Olympus 3",
      "Via Olympus 4",
      "FWD Experience",
      "FWD Experience 2",
      "FWD Experience 3",

      // Stability / Support
      "Provision 8",
      "Provision 9",
      "Provision 10",
      "Experience Form",
      "Experience Form 2",
      "Experience Form 3",

      // Performance / Tempo
      "Vanish Tempo",
      "Vanish Tempo 2",
      "Experience Wild",
      "Experience Wild 2",

      // Racing
      "Vanish Carbon",
      "Vanish Carbon 2",
      "Vanish Carbon 3",

      // Trail
      "Lone Peak 8",
      "Lone Peak 9",
      "Lone Peak 10",
      "Timp 5",
      "Timp 6",
      "Timp 7",
      "Olympus 5",
      "Olympus 6",
      "Olympus 7",
      "Mont Blanc",
      "Mont Blanc Carbon",
      "Mont Blanc Carbon 2",
      "Superior 6",
      "Superior 7",
    ],
    Salomon: [
      // Daily / Road
      "Aero Glide 2",
      "Aero Glide 3",
      "Aero Volt 2",
      "Aero Volt 3",
      "Aero Blaze 3",
      "Aero Blaze 4",
      "Spectur 2",
      "Spectur 3",

      // Max Cushion / Long Distance
      "DRX Bliss 2",
      "DRX Bliss 3",
      "DRX Max 2",
      "DRX Max 3",
      "Sonic Max 2",
      "Sonic Max 3",

      // Speed / Performance
      "S/Lab Spectur",
      "S/Lab Phantasm 2",
      "S/Lab Phantasm 3",
      "S/Lab Phantasm CF",
      "Phantasm 2",
      "Phantasm 3",

      // Racing
      "S/Lab Pulsar 3",
      "S/Lab Pulsar 4",
      "S/Lab Pulsar SG",

      // Trail / All-Terrain
      "Thundercross",
      "Thundercross 2",
      "Genesis",
      "Genesis 2",
      "Genesis Advanced",
      "Ultra Glide 2",
      "Ultra Glide 3",
      "Ultra Glide 4",
      "Sense Ride 5",
      "Sense Ride 6",
      "Sense Ride 7",
      "Pulsar Trail",
      "Pulsar Trail Pro 2",
      "S/Lab Genesis",
      "S/Lab Genesis 2",
      "S/Lab Ultra 3",
      "S/Lab Ultra 4",
      "S/Lab Ultra Glide",
    ],
  },
  WATCH: {
    Garmin: [
      // Entry / Everyday Running
      "Forerunner 55",
      "Forerunner 165",
      "Forerunner 165 Music",
      "Forerunner 170",

      // Mid-range Running
      "Forerunner 255",
      "Forerunner 255 Music",
      "Forerunner 265",
      "Forerunner 265S",
      "Forerunner 570",

      // Advanced Running / Triathlon
      "Forerunner 955",
      "Forerunner 955 Solar",
      "Forerunner 965",
      "Forerunner 970",

      // Multisport / Premium
      "fēnix 7",
      "fēnix 7 Pro",
      "fēnix 8",
      "fēnix 8 Solar",

      // Endurance
      "Enduro 2",
      "Enduro 3",

      // Fitness / Lifestyle
      "Venu 3",
      "Venu 4",
      "Venu X1",
      "vívoactive 5",
      "vívoactive 6",

      // Outdoor / Rugged
      "Instinct 2",
      "Instinct 2X Solar",
      "Instinct 3",
      "Instinct 3 Solar",
      "Instinct Crossover",
    ],
    Apple: [
      // Apple Watch
      "Apple Watch Series 8",
      "Apple Watch Series 9",
      "Apple Watch Series 10",
      "Apple Watch Series 11",

      // Budget
      "Apple Watch SE 2",
      "Apple Watch SE 3",

      // Ultra
      "Apple Watch Ultra 1",
      "Apple Watch Ultra 2",
      "Apple Watch Ultra 3",
    ],
    Coros: [
      // Road Running
      "PACE 2",
      "PACE 3",
      "PACE Pro",

      // Trail / Mountain
      "APEX 2",
      "APEX 2 Pro",
      "APEX 4",

      // Outdoor / Adventure
      "NOMAD",

      // Ultra / Expedition
      "VERTIX 2",
      "VERTIX 2S",
    ],
    Polar: [
      // Running
      "Pacer",
      "Pacer Pro",

      // Performance / Multisport
      "Vantage V2",
      "Vantage V3",
      "Vantage M2",
      "Vantage M3",

      // Outdoor / Trail
      "Grit X",
      "Grit X Pro",
      "Grit X2 Pro",

      // Fitness / Everyday
      "Ignite 3",
      "Ignite 3 Titanium",
      "Unite",
    ],
    Suunto: [
      // Running / Multisport
      "Suunto 5 Peak",
      "Suunto 9 Peak Pro",
      "Suunto Race",
      "Suunto Race S",
      "Suunto Race 2",

      // Outdoor / Adventure
      "Suunto Vertical",
      "Suunto Vertical 2",

      // Premium / Expedition
      "Suunto Ocean",
      "Suunto Ocean 2",
    ],
    Samsung: [
      // Galaxy Watch
      "Galaxy Watch 6",
      "Galaxy Watch 6 Classic",
      "Galaxy Watch 7",
      "Galaxy Watch 8",
      "Galaxy Watch 8 Classic",

      // Outdoor / Ultra
      "Galaxy Watch Ultra",
      "Galaxy Watch Ultra 2",
    ],
    Wahoo: [
      // Multisport / Running
      "ELEMNT RIVAL",

      // GPS Cycling Computers
      "ELEMNT BOLT V2",
      "ELEMNT ROAM V2",
      "ELEMNT ACE",

      // Heart Rate / Running Accessories
      "TRACKR HEART RATE",
      "TICKR X",
    ],
    Amazfit: [
      // Running / Fitness
      "Cheetah",
      "Cheetah Pro",
      "Cheetah 2",

      // Performance / Outdoor
      "Balance",
      "Balance 2",
      "Active 2",

      // Rugged
      "T-Rex 3",
      "T-Rex Ultra",
      "T-Rex Ultra 2",
    ],
  },
  HEADPHONES: {
    Shokz: [
      // Bone Conduction
      "OpenRun",
      "OpenRun Pro",
      "OpenRun Pro 2",

      // Swimming
      "OpenSwim",
      "OpenSwim Pro",

      // Budget / Entry
      "OpenMove",
    ],
    Bose: [
      // Open-ear / Running
      "Ultra Open Earbuds",

      // Sport earbuds
      "Sport Open Earbuds",

      // In-ear sports / workout
      "QuietComfort Ultra Earbuds",
      "QuietComfort Ultra Earbuds (2nd Gen)",
      "QuietComfort Earbuds",
      "QuietComfort Earbuds (2nd Gen)",
    ],
    Beats: [
      // Workout / Running
      "Powerbeats Fit",
      "Powerbeats Pro 2",

      // Previous generation
      "Beats Fit Pro",
      "Powerbeats Pro",
    ],
    Apple: [
      // Premium / Sports
      "AirPods Pro 1",
      "AirPods Pro 2",
      "AirPods Pro 3",

      // Open-ear / Everyday
      "AirPods 2",
      "AirPods 3",
      "AirPods 4",
      "AirPods 4 with Active Noise Cancellation",
    ],
    Jabra: [
      // Sport
      "Elite 8 Active",
      "Elite 8 Active Gen 2",

      // Premium / General-purpose
      "Elite 10",
      "Elite 10 Gen 2",
    ],
    JBL: [
      // Sport / Running
      "Endurance Peak 3",
      "Endurance Peak 4",
      "Endurance Race",
      "Endurance Race 2",
      "Reflect Aero TWS",
      "Reflect Flow Pro",

      // Open-ear / Sports
      "Soundgear Sense",
      "Soundgear Clips",

      // Older Sport Models
      "Endurance Run 2",
      "Endurance Run 2 Wireless",
      "Endurance Peak II",
    ],
    Soundcore: [
      // Sport / Secure-fit
      "Sport X10",
      "Sport X20",

      // Open-ear
      "AeroFit",
      "AeroFit Pro",
      "AeroFit 2",
      "AeroFit 2 Pro",

      // Open-ear Clip
      "C30i",
      "C40i",

      // General-purpose
      "Liberty 4 NC",
      "Liberty 5",
    ],
    Sony: [
      // Sport / Secure-fit
      "LinkBuds Fit",

      // Open-ear
      "LinkBuds Open",
      "LinkBuds Clip",

      // Running-focused
      "Float Run",

      // Sports / In-ear
      "WF-C700N",

      // Premium True Wireless
      "WF-1000XM5",
      "WF-1000XM6",
    ],
    Sennheiser: [
      // Sport / Running
      "Sport True Wireless",

      // Premium True Wireless
      "Momentum True Wireless 4",
      "Momentum True Wireless 5",

      // Open-ear
      "Accentum Open",

      // General-purpose True Wireless
      "Accentum True Wireless",
    ],
    JLab: [
      // Sport / Running
      "Epic Sport ANC 3",
      "JBuds Sport ANC 4",
      "GO Sport+",

      // Open-ear Sport
      "Epic Open Sport",
      "JBuds Open Sport",

      // Open-ear Lifestyle
      "Flex Open",
    ],
    Samsung: [
      // Premium
      "Galaxy Buds4 Pro",

      // Open-type / Awareness
      "Galaxy Buds4",

      // Value
      "Galaxy Buds3 FE",

      // Previous generation
      "Galaxy Buds3 Pro",
      "Galaxy Buds3",
      "Galaxy Buds2 Pro",
    ],
  },
};

// Categories that only offer a Brand picker — no specific model, since these
// products aren't meaningfully tracked by model the way shoes/watches are.
export type BrandOnlyCategory =
  | "APPAREL"
  | "NUTRITION"
  | "RUNNING_BELT"
  | "HYDRATION_VEST"
  | "SUNGLASSES"
  | "HEADLAMP"
  | "GLOVES";

const BRAND_ONLY_CATEGORIES: readonly BrandOnlyCategory[] = [
  "APPAREL",
  "NUTRITION",
  "RUNNING_BELT",
  "HYDRATION_VEST",
  "SUNGLASSES",
  "HEADLAMP",
  "GLOVES",
];

export function isCatalogCategory(category: GearCategory): category is CatalogCategory {
  return category === "SHOE" || category === "WATCH" || category === "HEADPHONES";
}

export function isBrandOnlyCategory(category: GearCategory): category is BrandOnlyCategory {
  return (BRAND_ONLY_CATEGORIES as readonly GearCategory[]).includes(category);
}

// Sentinel used by Add/Edit Gear forms to switch a brand/model picker to
// free-text entry.
export const OTHER_BRAND = "__other__";

export const GEAR_BRAND_LIST: Record<BrandOnlyCategory, string[]> = {
  RUNNING_BELT: ["FlipBelt", "SPIbelt", "Nathan", "UltrAspire", "Naked Running Band", "Amphipod"],
  HYDRATION_VEST: [
    "Salomon",
    "Nathan",
    "UltrAspire",
    "CamelBak",
    "Ultimate Direction",
    "Naked Running Band",
    "Raidlight",
  ],
  SUNGLASSES: ["Oakley", "Goodr", "ROKA", "District Vision", "Smith", "Tifosi", "Rudy Project", "Julbo", "100%"],
  HEADLAMP: ["Petzl", "Black Diamond", "Nathan", "UltrAspire", "Kogalla", "NITECORE", "BioLite", "Ledlenser"],
  GLOVES: ["Nike", "Under Armour", "The North Face", "Salomon", "Brooks", "Craft", "Manzella", "180s", "Mizuno"],
  APPAREL: [
    // Major Sports Brands
    "Nike",
    "Adidas",
    "Under Armour",
    "ASICS",
    "Puma",
    "New Balance",
    "Brooks",
    "Saucony",
    "Hoka",
    "On",
    "Mizuno",
    "Reebok",
    "Lululemon",
    "Champion",
    "Athleta",

    // Dedicated Running
    "Tracksmith",
    "Janji",
    "Saysky",
    "Soar",
    "Satisfy",
    "Bandit",
    "District Vision",
    "Path Projects",
    "Rabbit",
    "Oiselle",
    "Ciele",
    "Craft",
    "Odlo",
    "Nnormal",
    "Norda",
    "T8",
    "Iffley Road",
    "Fusion",
    "Kiprun",
    "Naked Running",

    // Trail / Ultra
    "Salomon",
    "Arc'teryx",
    "Patagonia",
    "The North Face",
    "Black Diamond",
    "Mountain Hardwear",
    "Rab",
    "Outdoor Research",
    "Dynafit",
    "La Sportiva",
    "Compressport",
    "Raidlight",
    "Ultimate Direction",
    "Inov-8",
    "Montane",

    // Compression / Performance
    "2XU",
    "CEP",
    "CW-X",
    "Skins",
    "Zensah",
    "OS1st",
  ],
  NUTRITION: [
    // Major Endurance Nutrition
    "GU Energy",
    "Maurten",
    "Precision Fuel & Hydration",
    "Neversecond",
    "Science in Sport",
    "Skratch Labs",
    "Tailwind Nutrition",
    "Honey Stinger",
    "Huma",
    "Spring Energy",
    "Näak",
    "Clif",
    "Hammer Nutrition",
    "Amacx",
    "UCAN",
    "TORQ",
    "High5",
    "PowerBar",
    "Enervit",
    "Styrkr",

    // Hydration / Electrolytes
    "LMNT",
    "Nuun",
    "SaltStick",
    "Liquid I.V.",
    "Gatorade",
    "DripDrop",
    "Hydrant",
    "Osmo Nutrition",
    "Flow Formulas",
    "PILLAR Performance",

    // Specialty / Real Food
    "Untapped",
    "Muir Energy",
    "Cadence",
    "Carbs Fuel",
    "Brix",
    "Picky Bars",
    "Bonk Breaker",
    "Trail Butter",
    "RXBAR",

    // Canadian Brands
    "Zone Hydration",
    "Kaha Nutrition",
    "Nomio",
    "Next Level",
    "Grynd",
    "Testo Sport",
    "Sève Endurance",
    "Stay Wyld",
    "Suna",
    "THN Labs",
    "Rock On",
    "Fix Fuel",
    "Ranch IV Provisions",
  ],
};
