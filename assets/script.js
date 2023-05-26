document.addEventListener("DOMContentLoaded", function () {
  function fetchData(url) {
    return fetch(url, {
      method: "GET",
      headers: {
        "user-key": "173297606dd309e858d947e8c0e0562c",
      },
    })
      .then(function (response) {
        return response.json();
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function searchRestaurants(cityInput) {
    var cityURL =
      "https://developers.zomato.com/api/v2.1/cities?count=12&q=" + cityInput;

    fetchData(cityURL)
      .then(function (data) {
        var cityId = data.location_suggestions[0].id;
        var searchURL =
          "https://developers.zomato.com/api/v2.1/search?count=12&entity_id=" +
          cityId +
          "&entity_type=city";

        return fetchData(searchURL);
      })
      .then(function (result) {
        var resultContainer = document.getElementById("resultContainer");
        resultContainer.innerHTML = ""; // Clear previous results

        // Generate HTML markup for each restaurant
        result.restaurants.forEach(function (restaurant) {
          var restaurantName = restaurant.restaurant.name;
          var restaurantThumb = restaurant.restaurant.thumb;

          // Create elements for restaurant name and picture
          var nameElement = document.createElement("h3");
          var pictureElement = document.createElement("img");

          // Set text content for name element
          nameElement.textContent = restaurantName;

          // Set attributes for picture element
          pictureElement.src = restaurantThumb;
          pictureElement.alt = restaurantName;

          // Append name and picture elements to result container
          resultContainer.appendChild(nameElement);
          resultContainer.appendChild(pictureElement);
        });
      });
  }

  // Event listener for the form submission
  document
    .getElementById("searchForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      var cityInput = document.getElementById("cityInput").value;
      searchRestaurants(cityInput);
    });
});
