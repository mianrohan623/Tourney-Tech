"use client";

import { useState, useEffect } from "react";
import { regionList, regionCitiesMap, cityStateMap, clubList } from "@/constants/RegionData";

export default function CitySelector({
  stateCode,
  setStateCode,
  city,
  setCity,
  subCity,
  setSubCity,
  club,
  setClub,
}) {
  const [regions, setRegions] = useState([]);     // Regions
  const [cities, setCities] = useState([]);       // Cities (subCity in your code)
  const [states, setStates] = useState([]);       // States (based on city)

  useEffect(() => {
    // Load all regions on mount
    setRegions(regionList);
  }, []);

  // When region (city variable) changes → load its cities
  useEffect(() => {
    if (city) {
      const cityList = regionCitiesMap[city] || [];
      setCities(cityList.map((c) => ({ code: c, name: c })));
      setSubCity("");
      setStates([]);
      setStateCode("");
    } else {
      setCities([]);
      setSubCity("");
      setStates([]);
      setStateCode("");
    }
  }, [city]);

  // When subCity (selected city) changes → load related state
  useEffect(() => {
    if (subCity) {
      const stateName = cityStateMap[subCity] ? [cityStateMap[subCity]] : [];
      setStates(stateName.map((s) => ({ isoCode: s, name: s })));
      setStateCode("");
    } else {
      setStates([]);
      setStateCode("");
    }
  }, [subCity]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region */}
      <div>
        <label className="block mb-2 text-sm font-medium text-white">
          Region
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-md border"
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block mb-2 text-sm font-medium text-white">
          City
        </label>
        <select
          value={subCity}
          onChange={(e) => setSubCity(e.target.value)}
          required
          disabled={!cities.length}
          className="w-full px-4 py-2 rounded-md border"
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select City</option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* State */}
      <div>
        <label className="block mb-2 text-sm font-medium text-white">
          State
        </label>
        <select
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          required
          disabled={!states.length}
          className="w-full px-4 py-2 rounded-md border"
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select State</option>
          {states.map((s) => (
            <option key={s.isoCode} value={s.isoCode}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Club (Always visible) */}
      <div>
        <label className="block mb-2 text-sm font-medium text-white">
          Club
        </label>
        <select
          value={club}
          onChange={(e) => setClub(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-md border"
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select Club</option>
          {clubList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
