import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [setupDone, setSetupDone] = useState(false);

  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [interests, setInterests] = useState([]);

  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedInsight, setSelectedInsight] = useState(null);

  const interestOptions = [
    { name: "Fitness", icon: "🏃" },
    { name: "Travel", icon: "✈️" },
    { name: "Outdoor Activities", icon: "🌳" },
    { name: "Daily Commute", icon: "🚗" },
    { name: "Agriculture", icon: "🌾" },
    { name: "Health & Wellness", icon: "❤️" },
  ];

  const getInsight = (type) => {
    const temp = Math.round(weather?.current?.temperature_2m ?? 0);
    const humidity = weather?.current?.relative_humidity_2m ?? 0;
    const rain = weather?.daily?.precipitation_probability_max?.[0] ?? 0;
    const wind = Math.round(weather?.current?.wind_speed_10m ?? 0);

    const insights = {
      Fitness: { icon: "🏃", title: "Fitness Insight", text: temp >= 35 ? `It is ${temp}°C in ${locationName || place}. Early morning or evening is more comfortable for outdoor exercise.` : `The current temperature is ${temp}°C. Conditions are suitable for outdoor exercise.` },
      Travel: { icon: "✈️", title: "Travel Insight", text: rain >= 60 ? `Rain probability is ${rain}% today in ${locationName || place}. Carry an umbrella and allow extra travel time.` : `Rain probability is ${rain}% today in ${locationName || place}. Current conditions look suitable for travel.` },
      "Outdoor Activities": { icon: "🌳", title: "Outdoor Activity Insight", text: temp >= 35 ? `It is ${temp}°C with ${rain}% rain probability. Consider cooler hours for outdoor activities.` : `Outdoor conditions are comfortable at ${temp}°C, with ${rain}% rain probability.` },
      "Daily Commute": { icon: "🚗", title: "Commute Insight", text: rain >= 60 ? `There is a ${rain}% chance of rain today. Carry rain protection and allow extra commute time.` : `No major rain concern is expected for your commute. Wind speed is around ${wind} km/h.` },
      Agriculture: { icon: "🌾", title: "Agriculture Insight", text: `Today is ${temp}°C with ${rain}% rain probability and ${humidity}% humidity. Monitor rainfall and field conditions.` },
      "Health & Wellness": { icon: "❤️", title: "Health & Wellness Insight", text: temp >= 35 ? `High temperature of ${temp}°C is expected. Stay hydrated and reduce prolonged heat exposure.` : `The current temperature is ${temp}°C with ${humidity}% humidity. Maintain normal hydration and daily activities.` }
    };

    return insights[type];
  };

  /* -----------------------------
     LIVE DATE & TIME
  ----------------------------- */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* -----------------------------
     TOGGLE INTEREST
  ----------------------------- */

  const toggleInterest = (interest) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  /* -----------------------------
     WEATHER CODE
  ----------------------------- */

  const getWeatherCondition = (code) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 57) return "Drizzle";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Rain Showers";
    if (code >= 95) return "Thunderstorm";

    return "Cloudy";
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 82) return "🌦️";
    if (code >= 95) return "⛈️";

    return "☁️";
  };

  /* -----------------------------
     FETCH WEATHER
  ----------------------------- */

  const fetchWeather = async (searchPlace) => {
    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          searchPlace
        )}&count=1&language=en&format=json`
      );

      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Place not found");
      }

      const location = geoData.results[0];

      setLocationName(
        `${location.name}${
          location.admin1 ? `, ${location.admin1}` : ""
        }`
      );

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
      );

      const weatherData = await weatherResponse.json();

      setWeather(weatherData);
    } catch (err) {
      setError(
        "We couldn't find this place. Please enter a valid city or town."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     CONTINUE
  ----------------------------- */

  const handleContinue = async () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!place.trim()) {
      alert("Please enter your place.");
      return;
    }

    if (interests.length === 0) {
      alert("Please select at least one interest.");
      return;
    }

    await fetchWeather(place);

    setSetupDone(true);
  };

  /* -----------------------------
     PROFILE SETUP
  ----------------------------- */

  if (!setupDone) {
    return (
      <div className="setup-page">

        <div className="setup-glow glow-one"></div>
        <div className="setup-glow glow-two"></div>

        <div className="setup-card">

          <div className="brand-mark">
            🌦️
          </div>

          <div className="small-heading">
            SMART WEATHER • MAUSAM
          </div>

          <h1>
            Your Weather,
            <br />
            <span>Personalized.</span>
          </h1>

          <p className="setup-description">
            Tell us about yourself and your location.
            Mausam will bring the weather information
            that matters most to you.
          </p>

          <div className="input-row">

            <div className="input-group">
              <label>YOUR NAME</label>

              <input
                type="text"
                placeholder="e.g. Lakshmi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>YOUR PLACE</label>

              <input
                type="text"
                placeholder="e.g. Puducherry"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
              />
            </div>

          </div>

          <div className="interest-title">
            <h2>What matters to you?</h2>

            <span>
              Select your interests
            </span>
          </div>

          <div className="interest-grid">

            {interestOptions.map((item) => (
              <button
                key={item.name}
                className={`interest-chip ${
                  interests.includes(item.name)
                    ? "active"
                    : ""
                }`}
                onClick={() => toggleInterest(item.name)}
              >
                <span>{item.icon}</span>
                {item.name}

                {interests.includes(item.name) && (
                  <b>✓</b>
                )}
              </button>
            ))}

          </div>

          <button
            className="start-btn"
            onClick={handleContinue}
          >
            Personalize My Weather
            <span>→</span>
          </button>

          <p className="privacy-note">
            🔒 Your preferences are used to personalize your
            weather experience.
          </p>

        </div>
      </div>
    );
  }

  /* -----------------------------
     WEATHER VALUES
  ----------------------------- */

  const current = weather?.current;

  const temperature = current
    ? Math.round(current.temperature_2m)
    : "--";

  const feelsLike = current
    ? Math.round(current.apparent_temperature)
    : "--";

  const humidity = current
    ? current.relative_humidity_2m
    : "--";

  const wind = current
    ? Math.round(current.wind_speed_10m)
    : "--";

  const condition = current
    ? getWeatherCondition(current.weather_code)
    : "Loading...";

  const weatherIcon = current
    ? getWeatherIcon(current.weather_code)
    : "🌤️";

  const dateText = currentTime.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const timeText = currentTime.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );

  /* -----------------------------
     7-DAY FORECAST
  ----------------------------- */

  const dailyForecast = weather?.daily || null;

  const getDayName = (date, index) => {
    if (index === 0) return "Today";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
    });
  };

  const getForecastDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  /* -----------------------------
     ALERT
  ----------------------------- */

  const showHeatAlert =
    current && current.temperature_2m >= 32;

  /* -----------------------------
     DASHBOARD
  ----------------------------- */

  return (
    <div className="app">

      {/* HEADER */}

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">
            🌦️
          </div>

          <div>
            <strong>MAUSAM</strong>
            <small>PERSONALIZED WEATHER</small>
          </div>
        </div>

        <div className="top-location">
          <span>📍</span>
          <strong>{locationName || place}</strong>
        </div>

        <div className="user-badge">
          <div className="avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <span>{name}</span>
        </div>

      </header>


      <main className="main-container">

        {/* HERO */}

        <section className="hero">

          <div className="hero-content">

            <span className="hero-tag">
              ✨ PERSONALIZED FOR YOU
            </span>

            <h1>
              Weather that
              <br />
              <span>understands your day.</span>
            </h1>

            <p>
              Relevant weather information, alerts and
              recommendations based on your location
              and interests.
            </p>

          </div>


          <div className="date-time">

            <div className="date-item">
              <span>📅</span>

              <div>
                <small>DATE</small>
                <strong>{dateText}</strong>
              </div>
            </div>

            <div className="date-item">
              <span>🕐</span>

              <div>
                <small>LOCAL TIME</small>
                <strong>{timeText}</strong>
              </div>
            </div>

          </div>

        </section>


        {/* CURRENT WEATHER */}

        <section className="weather-card">

          <div className="weather-main-info">

            <div className="location-label">
              📍 CURRENT WEATHER
            </div>

            <h2>
              {locationName || place}
            </h2>

            <div className="big-temperature">
              {temperature}
              <span>°C</span>
            </div>

            <div className="condition">
              <span>{weatherIcon}</span>

              <div>
                <strong>{condition}</strong>

                <small>
                  Feels like {feelsLike}°C
                </small>
              </div>
            </div>

          </div>


          <div className="weather-stats">

            <div className="stat">
              <span>💧</span>

              <div>
                <small>Humidity</small>
                <strong>{humidity}%</strong>
              </div>
            </div>

            <div className="stat">
              <span>💨</span>

              <div>
                <small>Wind</small>
                <strong>{wind} km/h</strong>
              </div>
            </div>

            <div className="stat">
              <span>🌡️</span>

              <div>
                <small>Feels Like</small>
                <strong>{feelsLike}°C</strong>
              </div>
            </div>

          </div>


          <div className="weather-source">
            Live weather data • Open-Meteo
          </div>

        </section>


        {/* 7-DAY FORECAST */}

        <section className="content-section">

          <div
            style={{
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              7-Day Weather Forecast
            </h2>
          </div>

          {dailyForecast && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                width: "100%",
                overflowX: "auto",
                padding: "4px 4px 16px",
                scrollbarWidth: "thin",
              }}
            >
              {dailyForecast.time.map((date, index) => {
                const forecastCode = dailyForecast.weather_code[index];
                const forecastIcon = getWeatherIcon(forecastCode);
                const forecastCondition =
                  getWeatherCondition(forecastCode);

                return (
                  <div
                    key={date}
                    style={{
                      minWidth: "155px",
                      flex: "0 0 155px",
                      height: "220px",
                      padding: "18px 12px",
                      boxSizing: "border-box",
                      borderRadius: "18px",
                      textAlign: "center",
                      background: "rgba(255,255,255,0.055)",
                      border:
                        index === 0
                          ? "1.5px solid rgba(0,212,255,0.65)"
                          : "1px solid rgba(255,255,255,0.12)",
                      boxShadow:
                        index === 0
                          ? "0 8px 25px rgba(0,212,255,0.12)"
                          : "0 8px 22px rgba(0,0,0,0.16)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexShrink: 0,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "17px",
                          fontWeight: 800,
                        }}
                      >
                        {getDayName(date, index)}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "12px",
                          opacity: 0.6,
                        }}
                      >
                        {getForecastDate(date)}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: "42px",
                        lineHeight: 1,
                        margin: "8px 0",
                      }}
                    >
                      {forecastIcon}
                    </div>

                    <strong
                      style={{
                        fontSize: "13px",
                        minHeight: "34px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {forecastCondition}
                    </strong>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "21px",
                          fontWeight: 800,
                        }}
                      >
                        {Math.round(
                          dailyForecast.temperature_2m_max[index]
                        )}°C
                      </span>

                      <small
                        style={{
                          opacity: 0.55,
                          fontSize: "15px",
                        }}
                      >
                        {Math.round(
                          dailyForecast.temperature_2m_min[index]
                        )}°C
                      </small>
                    </div>

                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        opacity: 0.85,
                      }}
                    >
                      🌧️ {dailyForecast.precipitation_probability_max[index] ?? 0}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </section>


        {/* PERSONALIZED */}

        <section className="content-section">

          <div className="section-header">

            <div>
              <span className="section-label">
                AI PERSONALIZATION
              </span>

              <h2>
                Made for {name}
              </h2>

              <p>
                Weather insights based on your interests.
              </p>
            </div>

            <span className="smart-pill">
              ✨ SMART
            </span>

          </div>


          <div className="personal-card-grid">

            {interests.map((interest) => {
              const card = {
                Fitness: ["🏃", "FITNESS", "Best time for exercise", "Morning or evening hours may be more comfortable for outdoor workouts.", "View activity insight →"],
                Travel: ["✈️", "TRAVEL", "Travel weather", "Check current conditions and rain information before your journey.", "View travel insight →"],
                "Outdoor Activities": ["🌳", "OUTDOOR", "Outdoor conditions", "Choose a suitable time for your outdoor activities based on today's weather.", "View outdoor insight →"],
                "Daily Commute": ["🚗", "COMMUTE", "Commute weather", "Check weather conditions before starting your daily commute.", "View commute insight →"],
                Agriculture: ["🌾", "AGRICULTURE", "Agriculture weather", "Monitor temperature and rainfall conditions for daily planning.", "View agriculture insight →"],
                "Health & Wellness": ["❤️", "WELLNESS", "Health weather", "Stay aware of temperature and humidity for a comfortable day.", "View health insight →"]
              }[interest];

              if (!card) return null;

              return (
                <div className="personal-card" key={interest}>
                  <div className="personal-icon">{card[0]}</div>
                  <span>{card[1]}</span>
                  <h3>{card[2]}</h3>
                  <p>{card[3]}</p>
                  <b
                    role="button"
                    tabIndex="0"
                    onClick={() => setSelectedInsight(interest)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedInsight(interest);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {card[4]}
                  </b>
                </div>
              );
            })}
          </div>

        </section>


        {/* ALERT */}

        <section className="content-section">

          <div className="section-header">

            <div>
              <span className="section-label">
                PRIORITY ALERT
              </span>

              <h2>
                Weather Alerts
              </h2>
            </div>

          </div>


          <div className="alert-card">

            <div className="alert-symbol">
              {showHeatAlert ? "🌡️" : "🌤️"}
            </div>

            <div className="alert-text">

              <div className="alert-top">
                <span className="priority">
                  {showHeatAlert
                    ? "HIGH PRIORITY"
                    : "WEATHER UPDATE"}
                </span>

                <span>
                  📍 {locationName || place}
                </span>
              </div>

              <h3>
                {showHeatAlert
                  ? "High Temperature Alert"
                  : "No Major Weather Alert"}
              </h3>

              <p>
                {showHeatAlert
                  ? `The temperature is currently ${temperature}°C and may feel like ${feelsLike}°C. Consider avoiding intense outdoor activities during peak afternoon hours.`
                  : "Current weather conditions do not indicate a major alert. Continue to monitor local weather updates."}
              </p>

            </div>

          </div>

        </section>


        {/* RECOMMENDATIONS */}

        <section className="content-section">

          <div className="section-header">

            <div>
              <span className="section-label">
                SMART SUGGESTIONS
              </span>

              <h2>
                AI Recommendations
              </h2>

              <p>
                Simple suggestions based on today's weather.
              </p>
            </div>

          </div>


          <div className="recommendations">

            <div className="recommendation">
              <span>💧</span>

              <div>
                <strong>Stay Hydrated</strong>

                <p>
                  Keep water with you throughout the day.
                </p>
              </div>
            </div>


            <div className="recommendation">
              <span>🌅</span>

              <div>
                <strong>Plan Outdoor Activities</strong>

                <p>
                  Prefer comfortable morning or evening hours.
                </p>
              </div>
            </div>


            <div className="recommendation">
              <span>📅</span>

              <div>
                <strong>Plan Your Day</strong>

                <p>
                  Use today's weather to organize your activities.
                </p>
              </div>
            </div>

          </div>

        </section>


        {/* FOOTER */}

        <footer>
          <span>
            🌦️ MAUSAM
          </span>

          <span>
            Personalized • Location-aware • Weather-focused
          </span>
        </footer>

      {selectedInsight && getInsight(selectedInsight) && (
        <div
          onClick={() => setSelectedInsight(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "20px"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(430px, 100%)", borderRadius: "24px", padding: "28px",
              background: "#101820", color: "white",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)"
            }}
          >
            <div style={{ fontSize: "42px", marginBottom: "10px" }}>{getInsight(selectedInsight).icon}</div>
            <h2 style={{ margin: "0 0 12px" }}>{getInsight(selectedInsight).title}</h2>
            <p style={{ lineHeight: 1.7, opacity: 0.85 }}>{getInsight(selectedInsight).text}</p>
            <p style={{ marginTop: "12px", opacity: 0.65 }}>📍 {locationName || place}</p>
            <button
              onClick={() => setSelectedInsight(null)}
              style={{ marginTop: "12px", padding: "10px 18px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: 700 }}
            >Close</button>
          </div>
        </div>
      )}

      </main>

    </div>
  );
}

export default App;