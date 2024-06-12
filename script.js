document.addEventListener('DOMContentLoaded', () => {
  const prompt = document.getElementById('prompt');
  const weatherContainer = document.getElementById('weather');
  const forecastContainer = document.getElementById('forecast');

  // Navigation links
  const homeLink = document.getElementById('home-link');
  const aboutLink = document.getElementById('about-link');
  const todayLink = document.getElementById('today-link');
  const fiveDayLink = document.getElementById('5-day-link');
  const weekendLink = document.getElementById('weekend-link');

  const homePage = document.getElementById('home-page');
  const aboutPage = document.getElementById('about-page');

  homeLink.addEventListener('click', () => {
    homePage.classList.remove('hidden');
    aboutPage.classList.add('hidden');
    forecastContainer.classList.add('hidden');
    document.body.style.backgroundColor = '#87CEEB'; // Sky blue color
  });

  aboutLink.addEventListener('click', () => {
    homePage.classList.add('hidden');
    aboutPage.classList.remove('hidden');
    forecastContainer.classList.add('hidden');
    document.body.style.backgroundColor = '#87CEEB'; // Sky blue color
  });

  todayLink.addEventListener('click', () => fetchForecast('today'));
  fiveDayLink.addEventListener('click', () => fetchForecast('5day'));
  weekendLink.addEventListener('click', () => fetchForecast('weekend'));

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const apiKey = 'e768f310ebf3e9d769be417a5d8f51c4'; // Replace with your actual API key
      const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      try {
        const weatherResponse = await fetch(weatherApiUrl);
        const weatherData = await weatherResponse.json();
        displayWeather(weatherData);

        prompt.classList.add('hidden');
        weatherContainer.classList.remove('hidden');
      } catch (error) {
        console.error('Error fetching weather data:', error);
        prompt.textContent = 'Error fetching weather data. Please try again later.';
      }
    });
  } else {
    prompt.textContent = 'Geolocation is not supported by this browser.';
  }
});

async function fetchForecast(type) {
  const apiKey = 'e768f310ebf3e9d769be417a5d8f51c4'; // Replace with your actual API key
  const prompt = document.getElementById('prompt');
  const forecastContainer = document.getElementById('forecast');
  const homePage = document.getElementById('home-page');
  const aboutPage = document.getElementById('about-page');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      let forecastApiUrl;

      switch (type) {
        case 'today':
          forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
          break;
        case '5day':
          forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
          break;
        case 'weekend':
          forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
          break;
        default:
          return;
      }

      try {
        const forecastResponse = await fetch(forecastApiUrl);
        const forecastData = await forecastResponse.json();

        displayForecast(forecastData, type);

        prompt.classList.add('hidden');
        homePage.classList.add('hidden');
        aboutPage.classList.add('hidden');
        forecastContainer.classList.remove('hidden');
      } catch (error) {
        console.error('Error fetching forecast data:', error);
        prompt.textContent = 'Error fetching forecast data. Please try again later.';
      }
    });
  } else {
    prompt.textContent = 'Geolocation is not supported by this browser.';
  }
}

function displayWeather(data) {
  const weatherContainer = document.getElementById('weather');
  const { name, main, weather, wind } = data;
  const temperature = main.temp;
  const description = weather[0].description;
  const icon = weather[0].icon;
  const windSpeed = wind.speed;

  weatherContainer.innerHTML = `
    <h2>${name}</h2>
    <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="icon">
    <p>${description}</p>
    <p>Temperature: ${temperature}°C</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
    <div class="suggestion">${getSuggestion(description)}</div>
  `;

  setDynamicBackground(description);
}

function displayForecast(data, type) {
  const forecastContainer = document.getElementById('forecast');
  forecastContainer.innerHTML = '';

  if (type === 'today' || type === 'weekend') {
    forecastContainer.innerHTML = '<h2>Hourly Forecast</h2>';
    for (const hourData of data.list) {
      const time = new Date(hourData.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const temperature = hourData.main.temp;
      const description = hourData.weather[0].description;
      const icon = hourData.weather[0].icon;

      forecastContainer.innerHTML += `
        <div class="forecast-hour">
          <div class="time">${time}</div>
          <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${description}" class="icon">
          <div class="details">
            <p>${description}</p>
            <p>Temperature: ${temperature}°C</p>
          </div>
        </div>
      `;
    }
  } else if (type === '5day') {
    forecastContainer.innerHTML = '<h2>5-Day Forecast</h2>';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const fiveDayData = data.list.slice(0, 40); // Get the first 40 elements (5 days * 8 records per day)

    // Create a table structure
    forecastContainer.innerHTML += `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Temperature (°C)</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let i = 0; i < fiveDayData.length; i += 8) {
      const dayData = fiveDayData[i];
      const date = new Date(dayData.dt * 1000).toLocaleDateString();
      const description = dayData.weather[0].description;
      const temperature = dayData.main.temp;

      forecastContainer.innerHTML += `
        <tr>
          <td>${days[new Date(dayData.dt * 1000).getDay()]}</td>
          <td>${description}</td>
          <td>${temperature}</td>
        </tr>
      `;
    }
  
    forecastContainer.innerHTML += `
        </tbody>
      </table>
    `;
  }
}


  function getSuggestion(description) {
    if (description.includes('rain')) {
      return 'It\'s raining, you might want to carry an umbrella!';
    } else if (description.includes('clear')) {
      return 'The weather is clear, a great day for outdoor activities!';
    } else if (description.includes('clouds')) {
      return 'It\'s cloudy, a light jacket might be needed.';
    } else if (description.includes('snow')) {
      return 'It\'s snowing, dress warmly!';
    } else {
      return 'Have a great day!';
    }
  }
  
  function setDynamicBackground(description) {
    const body = document.body;
  
    if (description.includes('rain')) {
      body.style.background = "url('rain.jpg') no-repeat center center fixed";
    } else if (description.includes('clear')) {
      body.style.background = "url('clear.jpg') no-repeat center center fixed";
    } else if (description.includes('clouds')) {
      body.style.background = "url('cloudy.jpg') no-repeat center center fixed";
    } else if (description.includes('snow')) {
      body.style.background = "url('snow.jpg') no-repeat center center fixed";
    } else {
      body.style.background = "url('default.jpg') no-repeat center center fixed";
    }
  
    body.style.backgroundSize = "cover";
  }
  
  // Add background animation
  const backgroundAnimation = document.createElement('div');
  backgroundAnimation.id = 'background-animation';
  document.body.appendChild(backgroundAnimation);
  
  for (let i = 0; i < 5; i++) {
    const sun = document.createElement('div');
    sun.className = 'sun';
    sun.style.top = `${Math.random() * 100}%`;
    sun.style.left = `${Math.random() * 100}%`;
    backgroundAnimation.appendChild(sun);
  }
  
  for (let i = 0; i < 10; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'cloud';
    cloud.style.top = `${Math.random() * 100}%`;
    cloud.style.left = `${Math.random() * 100}%`;
    backgroundAnimation.appendChild(cloud);
  }
ini