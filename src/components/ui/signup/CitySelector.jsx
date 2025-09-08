"use client";

import { useEffect, useState } from "react";
import { Country, State, City } from "country-state-city";

export default function CitySelector({ stateCode, setStateCode, city, setCity }) {
  const [allStates, setAllStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState(null); // ← Store full state info

  useEffect(() => {
    const loadAllStates = () => {
      const countries = Country.getAllCountries();
      let combinedStates = [];

      countries.forEach((country) => {
        const states = State.getStatesOfCountry(country.isoCode);
        states.forEach((state) => {
          combinedStates.push({
            ...state,
            countryCode: country.isoCode,
          });
        });
      });

      setAllStates(combinedStates);
    };

    loadAllStates();
  }, []);

  useEffect(() => {
    if (selectedState) {
      const stateCities = City.getCitiesOfState(selectedState.countryCode, selectedState.isoCode);
      setCities(stateCities);
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const handleStateChange = (e) => {
    const selectedIsoCode = e.target.value;
    setStateCode(selectedIsoCode);

    const matchedState = allStates.find((s) => s.countryCode + "-" + s.isoCode === selectedIsoCode);
    if (matchedState) {
      setSelectedState(matchedState);
    } else {
      setSelectedState(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* State Dropdown */}
      <div>
        <label className="block mb-2 text-sm font-medium">State</label>
        <select
          value={selectedState ? selectedState.countryCode + "-" + selectedState.isoCode : ""}
          onChange={handleStateChange}
          className="w-full px-4 py-2 rounded-md border"
          required
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select State</option>
          {allStates.map((state) => (
            <option key={state.countryCode + "-" + state.isoCode} value={state.countryCode + "-" + state.isoCode}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Dropdown */}
      <div>
        <label className="block mb-2 text-sm font-medium">City</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full px-4 py-2 rounded-md border"
          required
          disabled={!cities.length}
          style={{
            backgroundColor: "var(--secondary-color)",
            borderColor: "var(--border-color)",
            color: "var(--foreground)",
          }}
        >
          <option value="">Select City</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
