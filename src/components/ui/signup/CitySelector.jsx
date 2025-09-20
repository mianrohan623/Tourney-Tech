"use client";

import { useEffect, useState } from "react";
import { Country, State } from "country-state-city";

export default function CitySelector({ stateCode, setStateCode, city, setCity }) {
  const [regions, setRegions] = useState([]); // Countries (Regions)
  const [states, setStates] = useState([]);   // States filtered by region
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    // ✅ Load all regions (countries)
    const countries = Country.getAllCountries();
    setRegions(countries);
  }, []);

  // ✅ When region (city variable) changes → load states of that region
  useEffect(() => {
    if (city) {
      const stateList = State.getStatesOfCountry(city);
      setStates(stateList);
      setSelectedState(null);
      setStateCode(""); // reset state when region changes
    } else {
      setStates([]);
      setSelectedState(null);
      setStateCode("");
    }
  }, [city]);

  const handleStateChange = (e) => {
    const selectedIsoCode = e.target.value;
    setStateCode(selectedIsoCode);

    const matchedState = states.find((s) => s.isoCode === selectedIsoCode);
    if (matchedState) {
      setSelectedState(matchedState);
    } else {
      setSelectedState(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region Dropdown (Countries) */}
      <div>
        <label className="block mb-2 text-sm font-medium">Region</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2 rounded-md border"
          required
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region.isoCode} value={region.isoCode}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* State Dropdown (filtered by region) */}
      <div>
        <label className="block mb-2 text-sm font-medium">State</label>
        <select
          value={selectedState ? selectedState.isoCode : ""}
          onChange={handleStateChange}
          className="w-full px-4 py-2 rounded-md border"
          required
          disabled={!states.length}
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select State</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
