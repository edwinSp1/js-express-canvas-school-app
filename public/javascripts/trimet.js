const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};
// Check if geolocation is supported by the browser
if ("geolocation" in navigator) {
    // Prompt user for permission to access their location
    navigator.geolocation.getCurrentPosition(
      // Success callback function
      (position) => {
        // Get the user's latitude and longitude coordinates
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        getStopInfo([lat, lng], 1000)
        // Do something with the location data, e.g.  display on a map
        console.log(`Latitude: ${lat}, longitude: ${lng}`);
      },
      // Error callback function
      (error) => {
        // Handle errors, e.g. user denied location sharing permissions
        alert("Error getting user location:", error);
      },
      options
    );
  } else {
    // Geolocation is not supported by the browser
    console.error("Geolocation is not supported by this browser.");
  }
function getStopInfo(location, radius) {
  var coords = location
  var allLocations = []
  var allArrivals = []
  $.get(`/api/stopsnear?location=${location}&radius=${radius}`, function(data, success) {
    if(data == 'error') {
      alert('Error Fetching Data')
      return
    }
    var stopData = data.map((obj) => {

      var arrivals = obj.arrival.map((arrival) => {

        return {
          scheduled: new Date(arrival.scheduled),
          departed: arrival.departed,
          type: arrival.routeSubType,
          name: arrival.fullSign,
          locid: arrival.locid,
          arrivalTime: new Date(arrival.scheduled)
        }
      })
      allArrivals.push(...arrivals)
      var msgs = obj.detour.map((detour) => detour.desc)

      var locs = obj.location.map(location => {
        return {
          desc: location.desc,
          id: location.id,
          lat: location.lat,
          long: location.lng
        }
      })
      allLocations.push(...locs)
      return {
        locations: locs,
        arrivals: arrivals,
        msgs:msgs
      }
    })
    console.log(stopData)
    var $stopContainer = $('#stop-container')
    var $msgContainer = $('#msg-container')
    for(var obj of stopData) {
      for(var msg of obj.msgs) {
        $msgContainer.append(`<p>${msg}</p>`)
      }

      for(var location of obj.locations) {
        var isBus = false


        var arrivals = obj.arrivals.filter((arrival) => arrival.locid == location.id)

        console.log(arrivals)
        var html = `
        <div class='stop'>
          <h1 class='location'>${location.desc}</h1>
          ${arrivals.map((arrival) => `
          <div class='arrival'>
            <h1>${arrival.name}</h1>
            <p>${getDateData(arrival.scheduled)}</p>
          </div>
          `).join("")}
        </div>
        `
        $stopContainer.append(html)
      }
    }
    
    initMap(coords[0], coords[1], allLocations, allArrivals)
  })
}
function getDateData(date) {
  var months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  var parsedDate = date.getFullYear() + '/' + months[date.getMonth()] + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes()

  var msFromNow = date - new Date()
  var minutesFromNow = Math.floor(msFromNow / 1000 / 60) 
  return `${parsedDate}(${minutesFromNow} minutes from now)`
}
function getMinsFromNow (date) {
  var msFromNow = date - new Date()
  var minutesFromNow = Math.floor(msFromNow / 1000 / 60) 
  return minutesFromNow
}

async function initMap(lat, long, locations, arrivals) {
  // Request needed libraries.
  console.log(long, lat, locations)
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
    "marker",
  );
  const map = new Map(document.getElementById("gmp-map"), {
    center: { lat: lat, lng: long },
    mapId: "4504f8b37365c3d0",
    zoom:12
  });
  // Set LatLng and title text for the markers. The first marker (Boynton Pass)
  // receives the initial focus when tab is pressed. Use arrow keys to
  // move between markers; press tab again to cycle through the map controls.
  
  const tourStops = locations.map((location) => {
    var arrivalsForLocation = arrivals.filter((arrival) => arrival.locid == location.id)
    var arrivalTimes = arrivalsForLocation.map((arrival) => getMinsFromNow(arrival.scheduled))
    return {
      position: {
        lat: location.lat,
        lng: location.long
      },
      title: location.desc + ' in ' + (arrivalTimes.length > 0 ? arrivalTimes.join(',') : 'Unknown') + ' minutes'
    }
  })
  var pin = new PinElement({
    glyph: `YOUR LOCATION`,
  });
  var marker = new AdvancedMarkerElement({
    position: {
      lat: lat,
      lng: long
    },
    map,
    title: `Your location(NOTE: On devices with no GPS capabilities, this can be inaccurate.)`,
    content: pin.element,
  });
  marker.addListener("click", ({ domEvent, latLng }) => {
    const { target } = domEvent;

    infoWindow.close();
    infoWindow.setContent(marker.title);
    infoWindow.open(marker.map, marker);
  });
  
  // Create an info window to share between markers.
  const infoWindow = new InfoWindow();

  // Create the markers.
  tourStops.forEach(({ position, title }, i) => {
    const pin = new PinElement({
      glyph: `${i + 1}`,
    });
    const marker = new AdvancedMarkerElement({
      position,
      map,
      title: `${i + 1}. ${title}`,
      content: pin.element,
    });

    // Add a click listener for each marker, and set up the info window.
    marker.addListener("click", ({ domEvent, latLng }) => {
      const { target } = domEvent;

      infoWindow.close();
      infoWindow.setContent(marker.title);
      infoWindow.open(marker.map, marker);
    });
  });
}
