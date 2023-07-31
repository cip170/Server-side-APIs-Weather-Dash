var APIKey = "3be65c41f433942560887b079237f6e8"

/*
fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=51&lon=0&appid=${APIKey}`)
    .then((result) => {
        return result.json()
    }).then(function (data) {
        console.log(data)
    }).catch((err) => {
        console.log(err)
    })*/

// FORM ELEMENT STORED IN VARIABLE
const formEl = document.getElementById('submitForm');

// EVENT-LISTENER ON FORM ELEMENT CALLING FUNCTION TO GET API DATA
formEl.addEventListener('submit', function (event) {
  event.preventDefault();
  const city = document.getElementById('query').value;
  fetchWeatherData(city);
});

// FUNCTION TO FETCH WEATHER DATA
async function fetchWeatherData(city) {
  try {
    const latLon = await getLatLon(city);
    if (latLon) {
      const [lat, lon] = latLon;
      const [currentWeather, forecast] = await Promise.all([
        getCurrentWeather(lat, lon),
        getForecast(lat, lon)
      ]);
      updateCurrentWeather(currentWeather);
      updateForecast(forecast);
    }
  } catch (error) {
    console.error(error);
  }
}

// FUNCTION TO GET COORDINATES (LAT/LON) FROM API CALL
async function getLatLon(city) {
  const queryUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=&appid=${APIKey}`;
  const response = await fetch(queryUrl);
  if (!response.ok) {
    throw new Error('City not found');
  }
  const data = await response.json();
  return data.length > 0 ? [data[0].lat, data[0].lon] : null;
}

// FUNCTION TO GET THE FORECAST DATA
async function getForecast(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error fetching forecast data');
  }
  const data = await response.json();
  return data;
}

// FUNCTION TO GET THE CURRENT WEATHER DATA
async function getCurrentWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKey}&units=metric`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error fetching current weather data');
  }
  const data = await response.json();
  return data;
}

// FUNCTION TO CREATE THE ELEMENTS FOR THE CURRENT WEATHER AND DISPLAY THE DATA
function updateCurrentWeather(currentWeather) {
  document.getElementById("currentCity").textContent = currentWeather.name;
  document.getElementById("currentDate").textContent = new Date(currentWeather.dt * 1000).toLocaleDateString();
  document.getElementById("currentIcon").src = `https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;
  document.getElementById("currentTemp").textContent = currentWeather.main.temp;
  document.getElementById("currentWind").textContent = currentWeather.wind.speed;
  document.getElementById("currentHumidity").textContent = currentWeather.main.humidity;
}

// FUNCTION TO CREATE THE ELEMENTS FOR THE 5 DAY FORECAST AND DISPLAY THE DATA
function updateForecast(forecast) {
  const cards = document.getElementById("cards");
  cards.innerHTML = '';
  for (let i = 2; i < forecast.list.length; i += 8) {
    const outerDiv = document.createElement('div');
    outerDiv.classList.add('col-2', 'five-day');
    outerDiv.innerHTML = `
      <h5>${new Date(forecast.list[i].dt * 1000).toLocaleDateString()}</h5>
      <img src="https://openweathermap.org/img/wn/${forecast.list[i].weather[0].icon}@2x.png" alt="icon">
      <p>Temp: ${forecast.list[i].main.temp}</p>
      <p>Wind: ${forecast.list[i].wind.speed}</p>
      <p>Humidity: ${forecast.list[i].main.humidity}</p>
    `;
    cards.append(outerDiv);
  }
}