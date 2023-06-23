// When press search targets to search bar
function scrollToSearch() {
  document.querySelector("#searchForm").scrollIntoView({ behavior: "smooth" });
}

// When icon in navbar pressed, page is refreshing
const refreshIcon = document.getElementById("refreshIcon");

refreshIcon.addEventListener("click", function () {
  location.reload();
});

document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    // Display loader image
    const loaderContainer = document.getElementById("loaderContainer");
    loaderContainer.style.display = "block";

    // Hide other containers
    const weatherContainer = document.getElementById("weatherContainer");
    weatherContainer.style.display = "none";

    const resultContainer = document.getElementById("resultContainer");
    resultContainer.classList.add("white-background");
    resultContainer.style.display = "none";

    // Weather API key and URL
    const apiKey = "6075e79fd45d41f9ba605748232605";
    const city = document.getElementById("cityInput").value;
    const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    // Zomato API key and URL
    const zomatoApiKey = "173297606dd309e858d947e8c0e0562c";
    const zomatoApiUrl = `https://developers.zomato.com/api/v2.1`;

    // Retrieve previous search data from local storage
    const previousSearchData =
      JSON.parse(localStorage.getItem("searchData")) || {};

    // Create an object to hold the data
    const searchData = {
      city: city,
      weatherData: null,
      zomatoData: null,
    };

    // Merge previous search data with new search data
    const updatedSearchData = { ...previousSearchData, [city]: searchData };

    // Fetch weather data
    fetch(weatherApiUrl)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error: " + response.status);
        }
      })
      .then((weatherData) => {
        // Check if weather data is null
        if (weatherData === null) {
          throw new Error("Weather data not available");
        }

        const temperature = weatherData.current.temp_f;
        const weatherDescription = weatherData.current.condition.text;
        const humidity = weatherData.current.humidity;
        const windSpeed = weatherData.current.wind_mph;

        const weatherHtml = `
          <div class="weather-color">
            <h2>Weather in ${city}</h2>
            <p>Temperature: ${temperature}°F</p>
            <p>Description: ${weatherDescription}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} mph</p>
          </div>
        `;

        const weatherContainer = document.getElementById("weatherContainer");
        weatherContainer.classList.add("weather-color");
        weatherContainer.innerHTML = weatherHtml; // Display weather information

        // Save weather data in the search data object
        searchData.weatherData = {
          temperature,
          weatherDescription,
          humidity,
          windSpeed,
        };

        return fetch(`${zomatoApiUrl}/cities?count=16&q=${city}`, {
          method: "GET",
          headers: {
            "user-key": zomatoApiKey,
          },
        });
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error: " + response.status);
        }
      })
      .then((zomatoData) => {
        const cityId = zomatoData.location_suggestions[0].id;
        const searchURL = `${zomatoApiUrl}/search?count=16&entity_id=${cityId}&entity_type=city`;

        return fetch(searchURL, {
          method: "GET",
          headers: {
            "user-key": zomatoApiKey,
          },
        });
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Error: " + response.status);
        }
      })
      .then((result) => {
        const resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = ""; // Clear the result container

        // Create a container for the cards
        const cardContainer = document.createElement("div");
        cardContainer.classList.add(
          "grid",
          "grid-cols-1",
          "sm:grid-cols-2",
          "md:grid-cols-4",
          "gap-4"
        );

        // Generate HTML markup for each restaurant
        result.restaurants.forEach((restaurant) => {
          const restaurantName = restaurant.restaurant.name;
          const restaurantThumb = restaurant.restaurant.thumb;
          const restaurantAddress = restaurant.restaurant.location.address;

          // Create card element
          const cardElement = document.createElement("div");
          cardElement.classList.add(
            "bg-white",
            "rounded-lg",
            "bg-opacity-30",
            "shadow-md",
            "p-4",
            "text-black"
          );

          // Create elements for restaurant name, picture, and address
          const nameElement = document.createElement("h3");
          const pictureElement = document.createElement("img");
          const addressElement = document.createElement("p");

          // Set text content for name element
          nameElement.textContent = restaurantName;

          // Set attributes for picture element
          if (restaurantThumb.includes("res_avatar_476_320_1x_new.png")) {
            // Replace the image URL with a different picture
            pictureElement.src = "./assets/images/No-image.jpg";
          } else {
            pictureElement.src = restaurantThumb;
          }

          pictureElement.alt = restaurantName;
          pictureElement.classList.add("rounded-lg", "w-full");

          // Set text content and styling for address element
          addressElement.textContent = restaurantAddress;
          addressElement.classList.add(
            "text-sm",
            "cursor-pointer",
            "text-black"
          );

          // Add event listener for the clickable address
          addressElement.addEventListener("click", function () {
            const address = encodeURIComponent(restaurantAddress);
            const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
            window.open(url, "_blank"); // Open the URL in a new tab
          });

          // Append name, picture, and address elements to card element
          cardElement.appendChild(nameElement);
          cardElement.appendChild(pictureElement);
          cardElement.appendChild(addressElement);

          // Append card element to card container
          cardContainer.appendChild(cardElement);
        });

        // Append card container to result container
        resultContainer.appendChild(cardContainer);

        // Save Zomato data in the search data object
        searchData.zomatoData = result.restaurants;

        // Check if weather data is null before storing in local storage
        if (searchData.weatherData !== null) {
          // Update the search data object in local storage
          localStorage.setItem("searchData", JSON.stringify(updatedSearchData));
        }

        // Clear search bar value after search
        document.getElementById("cityInput").value = "";

        // Hide loader image
        loaderContainer.style.display = "none";

        // Show weather container
        weatherContainer.style.display = "block";

        // Show result container
        resultContainer.style.display = "block";
      })
      .catch((error) => {
        console.log("Error:", error.message);

        // Hide loader image in case of error
        loaderContainer.style.display = "none";
      });
  });
