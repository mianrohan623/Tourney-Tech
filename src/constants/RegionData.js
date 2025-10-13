// src/data/regionData.js

export const regionList = [
  "NY-NJ-DE",
  "PHIL / PA CITIES",
  "CT/MAS/NH/VT (NE)",
  "DMV / BALTIMORE",
  "7-Cities / Richmond",
  "Detroit",
  "Atlanta",
  "Birmingham",
  "Columbus",
  "Florida",
  "Cincinnati",
  "Chicago",
  "Dallas",
  "Austin",
  "Houston",
  "San Antonio",
  "New Orleans",
  "Los Angeles",
  "Las Vegas",
  "Other",
];

// 🌆 REGION → CITY (subcity)
export const regionCitiesMap = {
  "NY-NJ-DE": ["New York City", "Newark", "Wilmington"],
  "PHIL / PA CITIES": ["Philadelphia", "Pittsburgh", "Allentown"],
  "CT/MAS/NH/VT (NE)": ["Hartford", "Boston", "Concord", "Burlington"],
  "DMV / BALTIMORE": ["Washington DC", "Baltimore", "Arlington"],
  "7-Cities / Richmond": ["Norfolk", "Virginia Beach", "Richmond"],
  Detroit: ["Downtown", "Dearborn", "Southfield"],
  Atlanta: ["Downtown", "Midtown", "Buckhead"],
  Birmingham: ["Hoover", "Homewood", "Mountain Brook"],
  Columbus: ["Downtown", "Dublin", "Westerville"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville"],
  Cincinnati: ["Downtown", "Hyde Park", "Over-the-Rhine"],
  Chicago: ["Downtown", "Evanston", "Oak Park"],
  Dallas: ["Irving", "Plano", "Arlington"],
  Austin: ["Downtown", "Round Rock", "Cedar Park"],
  Houston: ["Sugar Land", "Katy", "The Woodlands"],
  "San Antonio": ["Downtown", "Alamo Heights", "Stone Oak"],
  "New Orleans": ["French Quarter", "Garden District", "Uptown"],
  "Los Angeles": ["Hollywood", "Santa Monica", "Burbank"],
  "Las Vegas": ["Summerlin", "Henderson", "Paradise"],
  Other: ["Other Region"],
};

// 🗺️ CITY → STATE
export const cityStateMap = {
  "New York City": "New York",
  Newark: "New Jersey",
  Wilmington: "Delaware",

  Philadelphia: "Pennsylvania",
  Pittsburgh: "Pennsylvania",
  Allentown: "Pennsylvania",

  Hartford: "Connecticut",
  Boston: "Massachusetts",
  Concord: "New Hampshire",
  Burlington: "Vermont",

  "Washington DC": "District of Columbia",
  Baltimore: "Maryland",
  Arlington: "Virginia",

  Norfolk: "Virginia",
  "Virginia Beach": "Virginia",
  Richmond: "Virginia",

  Dearborn: "Michigan",
  Southfield: "Michigan",
  Downtown: "Multiple States", // Shared name across regions

  "Midtown": "Georgia",
  Buckhead: "Georgia",

  Hoover: "Alabama",
  Homewood: "Alabama",
  "Mountain Brook": "Alabama",

  Dublin: "Ohio",
  Westerville: "Ohio",

  Miami: "Florida",
  Orlando: "Florida",
  Tampa: "Florida",
  Jacksonville: "Florida",

  "Hyde Park": "Ohio",
  "Over-the-Rhine": "Ohio",

  Evanston: "Illinois",
  "Oak Park": "Illinois",

  Irving: "Texas",
  Plano: "Texas",
  Arlington: "Texas",

  "Round Rock": "Texas",
  "Cedar Park": "Texas",

  "Sugar Land": "Texas",
  Katy: "Texas",
  "The Woodlands": "Texas",

  "Alamo Heights": "Texas",
  "Stone Oak": "Texas",

  "French Quarter": "Louisiana",
  "Garden District": "Louisiana",
  Uptown: "Louisiana",

  Hollywood: "California",
  "Santa Monica": "California",
  Burbank: "California",

  Summerlin: "Nevada",
  Henderson: "Nevada",
  Paradise: "Nevada",

  "Other Region": "Other",
};

// 🏆 CLUB LIST
export const clubList = [
  "7NO PLAYERS",
  "ALAMO 7NO",
  "AWC",
  "BEST OF THE WEST",
  "CAPITAL CITY CARD CLUB (C4)",
  "CINCINNATI WHIST GROUP (CWG)",
  "CLUB BID",
  "CWPS COLUMBUS WHIST PLAYERS SOCIETY",
  "DALLAS ROAD CREW",
  "DMV CARTEL",
  "DMV REGULATORS",
  "H-TOWN 7NO BID WHIST CLUB",
  "HEAVY HITTERS",
  "MIS DEALS",
  "MOTOR CITY WHIST MECHANICS",
  "SMOKIN ACES",
  "T.O.W.",
  "TRUMP TIGHT HOUSTON",
  "Other",
  "None",
];
