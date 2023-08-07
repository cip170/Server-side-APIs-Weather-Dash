const APIKey = "3be65c41f433942560887b079237f6e8";

const searchHistory = [];

const formEl = document.getElementById('submitForm');
formEl.addEventListener('submit', function (event) {
  event.preventDefault();
  const city = document.getElementById('query').value;
  fetchWeatherData(city);
});

async function fetchWeatherData(city) {
  try {
    const latLon = await getLatLon(city);
    if (latLon) {
      const [lat, lon] = latLon;
      const [currentWeather, forecast] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`)
          .then(response => response.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`)
          .then(response => response.json())
      ]);

      if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        saveSearchHistoryToLocalStorage();
        updateSearchHistory();
      }

      updateCurrentWeather(currentWeather);
      updateForecast(forecast);
    }
  } catch (error) {
    console.error(error);
  }
}

function saveSearchHistoryToLocalStorage() {
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

function loadSearchHistoryFromLocalStorage() {
  const storedHistory = localStorage.getItem("searchHistory");
  if (storedHistory) {
    searchHistory.push(...JSON.parse(storedHistory));
  }
}

function updateSearchHistory() {
  const searchHistoryEl = document.getElementById("search-history");
  searchHistoryEl.innerHTML = '';
  searchHistory.forEach(city => {
    const historyItem = createHistoryItem(city);
    searchHistoryEl.appendChild(historyItem);
  });
}

function createHistoryItem(city) {
  const historyItem = document.createElement('div');
  historyItem.classList.add('history-item');

  const historyButton = document.createElement('button');
  historyButton.textContent = city;
  historyButton.classList.add('history-button');
  historyButton.addEventListener('click', function () {
    fetchWeatherData(city);
  });

  const removeButton = document.createElement('button');
  removeButton.textContent = 'x';
  removeButton.classList.add('remove-button');
  removeButton.addEventListener('click', function (event) {
    event.stopPropagation();
    removeCityFromSearchHistory(city);
  });

  historyItem.appendChild(historyButton);
  historyItem.appendChild(removeButton);

  return historyItem;
}

function removeCityFromSearchHistory(city) {
  const index = searchHistory.indexOf(city);
  if (index !== -1) {
    searchHistory.splice(index, 1);
    saveSearchHistoryToLocalStorage();
    updateSearchHistory();
  }
}

async function getLatLon(city) {
  const queryUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=&appid=${APIKey}`;
  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error('City not found');
  }
  const data = await response.json();
  return data.length > 0 ? [data[0].lat, data[0].lon] : null;
}

function formatDateWithBrackets(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `(${day}/${month}/${year})`;
}

function formatDateWithoutBrackets(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function updateCurrentWeather(currentWeather) {
  const cityDateElement = document.getElementById("currentCityDate");
  cityDateElement.innerHTML = '';
  const city = currentWeather.name;
  const date = new Date(currentWeather.dt * 1000);
  const formattedDate = formatDateWithBrackets(date);
  cityDateElement.textContent = `${city} ${formattedDate}`;

  const temperature = `${currentWeather.main.temp}°C`;
  const windSpeed = `${currentWeather.wind.speed} mph`;
  const humidity = `${currentWeather.main.humidity}%`;

  document.getElementById("currentTemp").innerHTML = `Temperature: ${temperature}`;
  document.getElementById("currentWind").innerHTML = `Wind: ${windSpeed}`;
  document.getElementById("currentHumidity").innerHTML = `Humidity: ${humidity}`;

  const iconCode = currentWeather.weather[0].icon;
  document.getElementById("currentIcon").src = `https://openweathermap.org/img/wn/${iconCode}.png`;
}

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

window.addEventListener('load', () => {
  loadSearchHistoryFromLocalStorage();
  updateSearchHistory();
});
