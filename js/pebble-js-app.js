var myAPIKey = '';

//<script src="https://www.gstatic.com/firebasejs/3.5.0/firebase.js"></script>

//var firebase_config = { 
//  apiKey:     "AIzaSyDV1KC655KHSNbdgqwjeyZphSWfsNxtkx8",
//  authDomain: "firstfirebaseproj-5ae73.firebaseapp.com",
//  databaseURL:"https://firstfirebaseproj-5ae73.firebaseio.com",
//  storageBucket:"firstfirebaseproj-5ae73.appspot.com",
//  messagingSenderId: "724069672672"
//};

//firebase.initializeApp(firebase_config);

//var database = firebase.database();
//
//function writeNewPost( userId, coord ){
//
//  return firebase.database().ref(userId).set({
//   coordinate: coord
//   });
//}


function iconFromWeatherId(weatherId) {
  if (weatherId < 600) {
    return 2;
  } else if (weatherId < 700) {
    return 3;
  } else if (weatherId > 800) {
    return 1;
  } else {
    return 0;
  }
}

function fetchWeather(latitude, longitude) {
  var req = new XMLHttpRequest();
  req.open('GET', 'http://api.openweathermap.org/data/2.5/weather?' +
    'lat=' + latitude + '&lon=' + longitude + '&cnt=1&appid=' + myAPIKey, true);
  req.onload = function () {
    if (req.readyState === 4) {
      if (req.status === 200) {
        console.log(req.responseText);
        var response = JSON.parse(req.responseText);
        var temperature = Math.round(response.main.temp - 273.15);
        var icon = iconFromWeatherId(response.weather[0].id);
        var city = response.name;
        console.log(temperature);
        console.log(icon);
        console.log(city);
        Pebble.sendAppMessage({
          'WEATHER_ICON_KEY': icon,
          'WEATHER_TEMPERATURE_KEY': temperature + '\xB0C',
          'WEATHER_CITY_KEY': city
        });
      } else {
        console.log('Error');
      }
    }
  };
  req.send(null);
}

function putDB(user_id, clap_num, coord) {
  console.log('putDB');
  var xhr = new XMLHttpRequest();
  var myJSON = {"user_id" : user_id, "clap" : clap_num, "coordination": coord };
  var redo = 1;

  xhr.open('POST', 'https://firstfirebaseproj-5ae73.firebaseio.com/users.json', true);
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {

	//if successfully update the database .... soemthing happen here
        redo = 0;

      } else {
        console.log('Error');
	//unlucky :(
      }
    }
  }
  xhr.send(JSON.stringify(myJSON));
  console.log(myJSON);
}


function locationSuccess(pos) {
  var coordinates = pos.coords;
  console.log('local_succ');
  console.log(coordinates);
  var temp = 'A';
  //fetchWeather(coordinates.latitude, coordinates.longitude);
  putDB(temp, 73, coordinates);

}

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
  Pebble.sendAppMessage({
    'WEATHER_CITY_KEY': 'Loc Unavailable',
    'WEATHER_TEMPERATURE_KEY': 'N/A'
  });
}

var locationOptions = {
  'timeout': 15000,
  'maximumAge': 60000
};

Pebble.addEventListener('ready', function (e) {
  console.log('connect!' + e.ready);
  window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError,
    locationOptions);
  console.log(e.type);
});

Pebble.addEventListener('appmessage', function (e) {
  window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError,
    locationOptions);
  console.log(e.type);
  console.log(e.payload.temperature);
  console.log('message!');
});

Pebble.addEventListener('webviewclosed', function (e) {
  console.log('webview closed');
  console.log(e.type);
  console.log(e.response);
});
