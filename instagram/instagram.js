var instagramModule = angular.module('OpenExplore', ['ngResource', 'ngCookies']);

instagramModule.config(function($sceDelegateProvider, $locationProvider){
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://api.instagram.com/**'
  ]);

  //I don't want lots of # ! symbols in my URLs
  $locationProvider.html5Mode({
         enabled: true,
         requireBase: false
  });
});

instagramModule.controller("InstagramCtrl", function($scope, $resource, $location, $cookieStore) {

  createMarker = function(post) {
    console.log('Im in');
    var marker = new google.maps.Marker({
      map: $scope.map,
      position: new google.maps.LatLng(post.location.latitude, post.location.longitude),
      title: post.caption.text
    });
    marker.content = '<p>' + marker.title + '</p>' + '<img src="' + post.images.low_resolution.url + '"  style="max-height: 200px">';

    google.maps.event.addListener(marker, 'click', function(){
      infoWindow.setContent(marker.content);
      infoWindow.open($scope.map, marker);
    });

    $scope.markers.push(marker);
  };

  populateGoodleMaps = function() {
    console.log('maybe here', $scope.instagramResult);
    for(var i in $scope.instagramResult)
    {
        createMarker($scope.instagramResult[i]);
    }
  };

  //initialise Google Maps
  var mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(40.0000, -98.0000),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }

  $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
  $scope.markers = [];
  var infoWindow = new google.maps.InfoWindow({
    maxWidth: 300
  });

  //get the instagram access token
  var accessToken = $location.hash().split('=')[1];

  if (accessToken) {
    //put it in the cookies
    $cookieStore.put('instagram', accessToken);
  }

  //get instagram access token from cookies
  $scope.instagramAccessToken = $cookieStore.get('instagram');

  console.log('$scope.instagramAccessToken ', $scope.instagramAccessToken);

  //if we have an instagram access token
  if($scope.instagramAccessToken) {
    //setup the instagram feed
    $scope.instagram = $resource('https://api.instagram.com/v1/users/self/media/recent?access_token=:access_token',
      {access_token: $scope.instagramAccessToken},
      {get: {method: 'JSONP'}});

    //get the instagram content
    $scope.instagram.get().$promise.then(
      function(data) {
        $scope.instagramResult = data.data;

        populateGoodleMaps();
      },
      function(error) {
        console.log("Something went wrong!");
      }
    );
  }

  $scope.refresh = function () {
    //clear the markers
    for(i = 0; i < $scope.markers.length; i++) {
        $scope.markers[i].setMap(null);
    }

    //get the instagram content
    $scope.instagram.get().$promise.then(
      function(data) {
        $scope.instagramResult = data.data;

        populateGoodleMaps();
      },
      function(error) {
        console.log("Something went wrong!");
      }
    );
  };
});
