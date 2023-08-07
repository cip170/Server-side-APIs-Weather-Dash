var APIKey = "3be65c41f433942560887b079237f6e8";

const searchHistory = [];

// Form element stored in variable
const formEl = document.getElementById('submitForm');

// Calling function to get API data
formEl.addEventListener('submit', function (event) {
  event.preventDefault();
  const city = document.getElementById('query').value;
  fetchWeatherData(city);
});

// Fetch weather data from the API
async function fetchWeatherData(city) {
  try {
    const latLon = await getLatLon(city);
    if (latLon) {
      const [lat, lon] = latLon;
      const [currentWeather, forecast] = await Promise.all([
        getCurrentWeather(lat, lon),
        getForecast(lat, lon)
      ]);

      // Add the city to the search history array if it's not already present
      if (!searchHistory.includes(city)) {
        searchHistory.push(city);
      }

      // Update the search history element in the HTML
      updateSearchHistory();

      updateCurrentWeather(currentWeather);
      updateForecast(forecast);
    }
  } catch (error) {
    console.error(error);
  }
}

function addToSearchHistory(city) {
  searchHistory.push(city);
  updateSearchHistory();
}

function updateSearchHistory() {
  const searchHistoryEl = document.getElementById("search-history");
  searchHistoryEl.innerHTML = ''; // Clear any existing content

  // Create a list item for each city in the search history
  searchHistory.forEach((city) => {
    const listItem = document.createElement('li-history');
    listItem.textContent = city;
    searchHistoryEl.appendChild(listItem);
  });
}


// Get latitude & longitude coordinates for the city from the API
async function getLatLon(city) {
  const queryUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=&appid=${APIKey}`;
  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error('City not found');
  }
  const data = await response.json();
  return data.length > 0 ? [data[0].lat, data[0].lon] : null;
}

// Get forecast data from the API
async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error fetching forecast data');
  }
  const data = await response.json();
  return data;
}

// Get current weather data from the API
async function getCurrentWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error fetching current weather data');
  }
  const data = await response.json();
  return data;
}

// Function to formate the date as (dd/mm/yyyy)
function formatDateWithBrackets(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so need to add 1
  const year = date.getFullYear();
  return `(${day}/${month}/${year})`;
}

// Function to format the date as dd//mm/yyyy without brackets in the future forecast
function formatDateWithoutBrackets(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so need to add 1
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Function to create elements for current weather & display data
function updateCurrentWeather(currentWeather) {
  const cityDateElement = document.getElementById("currentCityDate");
  cityDateElement.innerHTML = ''; // Clear any existing content

// Update cty & date together without brackets
  const city = currentWeather.name;
  const date = new Date(currentWeather.dt * 1000);
  const formattedDate = formatDateWithBrackets(date);
  cityDateElement.textContent = `${city} ${formattedDate}`;

// Format the values with unit strings
  const temperature = `${currentWeather.main.temp}°C`;
  const windSpeed = `${currentWeather.wind.speed} mph`;
  const humidity = `${currentWeather.main.humidity}%`;

// Update the innerHTML of the <span> elements to display the actual weather values
  document.getElementById("currentTemp").innerHTML = `Temperature: ${temperature}`;
  document.getElementById("currentWind").innerHTML = `Wind: ${windSpeed}`;
  document.getElementById("currentHumidity").innerHTML = `Humidity: ${humidity}`;

// Update the weather icon
  const iconCode = currentWeather.weather[0].icon;
  document.getElementById("currentIcon").src = `https://openweathermap.org/img/wn/${iconCode}.png`;
}

// Function to create elements for forecast & display data
function updateForecast(forecast) {
  const cards = document.getElementById("cards");
  cards.innerHTML = '';
  for (let i = 2; i < forecast.list.length; i += 8) {
    const outerDiv = document.createElement('div');
    outerDiv.classList.add('col-2', 'five-day');
    const date = new Date(forecast.list[i].dt * 1000);
    const formattedDate = formatDateWithoutBrackets(date);
    outerDiv.innerHTML = `
      <h5>${formattedDate}</h5>
      <img src="https://openweathermap.org/img/wn/${forecast.list[i].weather[0].icon}.png" alt="icon" class="forecast-icon">
      <p>Temp: ${forecast.list[i].main.temp}°C</p>
      <p>Wind: ${forecast.list[i].wind.speed} mph</p>
      <p>Humidity: ${forecast.list[i].main.humidity}%</p>
    `;
    cards.append(outerDiv);
  }
}

// Function to be called after page loads to initialize search history
window.addEventListener('load', () => {
  updateSearchHistory();
});