function FrontEnd() {
  const me = {
    amenities: [],
    editing: false,
  };

  me.showErrorMessage = (message, type = "danger") => {
    const messagesDiv = document.querySelector("#messages");

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<div class="alert alert-${type} alert-dismissible" role="alert">
         <div>${message}</div>
         <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
      </div>`;

    messagesDiv.append(wrapper);
  };

  me.reloadRestaurants = async () => {
    let query = "";
    if (me.amenities.length) {
      query = "?amenities=" + me.amenities.join(","); // didn't know that a string can be created this way to use as a parameter when using fetch
    }
    const res = await fetch("/api/restaurants" + query); // very convenient!!
    if (!res.ok) {
      me.showErrorMessage("Error leading the restaurants");
      return;
    }

    const restaurants = await res.json();

    me.renderRestaurants(restaurants);
  };

  const renderRestaurant = (restaurant) => {
    return `
    <div class="col-3">
        <div id="restaurant-card" class="restaurant card">
            <img height="300px"
                src="./images/${restaurant.image}"
                class="card-img-top"
                alt="Featured Restaurant"
            />
            <div class="card-body">
                <h2 class="card-title">${restaurant.name}</h2>
                <ul class="list-group list-group-flush" id="am-${restaurant._id}">
                    <li class="list-group-item">wifi: ${restaurant.Amenities.wifi} votes</li>
                    <li class="list-group-item">outlet: ${restaurant.Amenities.outlet} votes</li>
                    <li class="list-group-item">restroom: ${restaurant.Amenities.restroom} votes</li>
                </ul>
                <ul class="list-group list-group-flush d-none" id="up-${restaurant._id}">
                    <li class="list-group-item">
                      <div class="form-check">
                        <input
                          class="form-check-input edit-amenties"
                          type="checkbox"
                          name="wifi"
                        />
                        <label class="form-check-label" for="inlineCheckbox1">wifi</label>
                    </div>
                  </li>
                  <li class="list-group-item">
                    <div class="form-check">
                      <input
                        class="form-check-input edit-amenties"
                        type="checkbox"
                        name="outlet"
                      />
                      <label class="form-check-label" for="inlineCheckbox2">outlet</label>
                    </div>
                  </li>
                  <li class="list-group-item">
                    <div class="form-check">
                      <input
                        class="form-check-input edit-amenties"
                        type="checkbox"
                        name="restroom"
                      />
                      <label class="form-check-label" for="inlineCheckbox3">restroom</label>
                    </div>
                  </li>
                </ul>
                <div class="card-body">
                    <button type="button" onClick="frontend.editingListener('${restaurant._id}')" id="ed-${restaurant._id}" class="card-link">edit</button>
                    <button type="button" onClick="frontend.savingListener('${restaurant._id}')" id="sv-${restaurant._id}" class="card-link d-none">Save</button>
                </div>
            </div>
        </div>
    </div>
    `;
  };

  me.renderRestaurants = (restaurants) => {
    const restaurantsDiv = document.querySelector("#restaurants");

    restaurantsDiv.innerHTML = restaurants.map(renderRestaurant).join("\n");
  };

  me.amenitiesListener = () => {
    const amenityCheckboxes = document.querySelectorAll(".amenties");
    amenityCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        if (event.currentTarget.checked) {
          me.amenities = [...me.amenities, checkbox.name];
        } else {
          me.amenities = me.amenities.filter((am) => am !== checkbox.name); // greate use of filter to remove the amenities
        }
        me.reloadRestaurants();
      });
    });
  };

  me.editingListener = (restaurantId) => {
    console.log("editing.. " + restaurantId);
    document.getElementById("am-" + restaurantId).classList.add("d-none");
    document.getElementById("ed-" + restaurantId).classList.add("d-none");
    document.getElementById("up-" + restaurantId).classList.remove("d-none");
    document.getElementById("sv-" + restaurantId).classList.remove("d-none");
  };

  me.savingListener = async (restaurantId) => {
    // api call - update DB
    const updatingRestaurantCheckboxes = document.querySelectorAll(
      ".edit-amenties:checked"
    );

    // create array for the updated amentiess
    const updatedAmenities = Array.from(updatingRestaurantCheckboxes).map(
      (checkbox) => checkbox.name
    );

    // create request payload
    const requestBody = {
      restaurantId,
      updatedAmenities,
    };

    // api put request
    const res = await fetch(`/api/restaurants/${restaurantId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      me.showErrorMessage("Error updating restaurant amenities");
      return;
    }

    // update Ui
    document.getElementById("am-" + restaurantId).classList.remove("d-none");
    document.getElementById("ed-" + restaurantId).classList.remove("d-none");
    document.getElementById("up-" + restaurantId).classList.add("d-none");
    document.getElementById("sv-" + restaurantId).classList.add("d-none");

    // reload Restaurants
    me.reloadRestaurants();
  };

  return me;
}

const frontend = FrontEnd();

frontend.reloadRestaurants();
frontend.amenitiesListener();
