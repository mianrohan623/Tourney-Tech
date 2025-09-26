"use client";

import { useState, useEffect } from "react";
import { regionList, regionStatesMap } from "@/constants/RegionData";

export default function CitySelector({ stateCode, setStateCode, city, setCity }) {
  const [regions, setRegions] = useState([]); 
  const [states, setStates] = useState([]);   
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    // Load regions from imported data
    setRegions(regionList);
  }, []);

  useEffect(() => {
    if (city) {
      const stateList = regionStatesMap[city] || [];
      setStates(stateList.map((s) => ({ isoCode: s, name: s })));
      setSelectedState(null);
      setStateCode("");
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
    setSelectedState(matchedState || null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region Dropdown */}
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
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* State Dropdown */}
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
