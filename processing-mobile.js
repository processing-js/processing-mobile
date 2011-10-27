/**
 *  Processing.Mobile Library for Processing.js
 *
 *  This library adds a number of mobile device related APIs to Processing.
 *  These are non-standard, and are done in this library only for demonstration
 *  purposes.
 *
 *  Additional Processing APIs:
 *
 *  orientation: (object) device tilt information in degrees along x, y, z
 *             alpha: the direction the device is facing according to the compass
 *             beta: the angle in degrees the device is tilted front-to-back
 *             gamma the angle in degrees the device is tilted left-to-right.
 *             compassAccuracy the iOS 5 compass accuracy (or -1)
 *             compassHeading the iOS 5 cCompass heading in degrees or -1
 *
 *  acceleration: (object) acceleration data for device along x, y, and z axes:
 *             x: (float) device acceleration in m/s^2 along the X axis (-1.0 to 1.0)
 *             y: (float) device acceleration in m/s^2 along the Y axis (-1.0 to 1.0)
 *             z: (float) device acceleration in m/s^2 along the Z axis (-1.0 to 1.0)
 *
 *  coords: (object) geolocation data for the device, obtained at the start of the
 *          program (i.e., not updated during the lifetime of the program).  The
 *          properties of coords incude:
 *
 *             latitude: (float) current latitude in decimal degrees (or 0 if unknown)
 *             longitude: (float) current longitude in decimal degrees (or 0 if unknown)
 *             altitude: (float) current height in meters above the ellipsoid (or 0 if unknown)
 *             accuracy: (float) accuracy in meters of longitude and latitude
 *             altitudeAccuracy: (float) accurace of the altitude value in meters (or 0 if unknown)
 *             heading: (float) direction of travel, specified in degrees 0-360 (or -1 if unknown)
 *             speed: (float) speed in meters per second (or -1 if unknown)
 *
 *  Updates for coords are available when the locationChanged() callback is fired.
 *
 *  Additional Reading:
 *   http://www.html5rocks.com/en/tutorials/device/orientation/
 *   dev.w3.org/geo/api/spec-source.html
 **/

(function(Processing, window, navigator) {

  // Cache Processing ctor
  var P5 = Processing,
      Pp = Processing.prototype;

  var mobile = {
    // If we don't have support for devicemotion events, use 0 for these.
    acceleration: {
      x: 0,
      y: 0,
      z: 0
    },

    // Defaults for geolocation data
    coords: {
      latitude: 0,
      longitude: 0,
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: -1,
      speed: -1
    },

    // Defaults for orientation data
    orientation: {
      alpha: 0,
      beta: 0,
      gamma: 0,
      compassAccuracy: -1,
      compassHeading: -1
    }
  };

  function attachLocationCallback(p) {
    // Start a geolocation watch timeout if a locationChanged callback is provided.
    if (p.locationChanged &&
        typeof p.locationChanged === "function" &&
        navigator.geolocation) {

      navigator.geolocation.watchPosition(
        function success(position) {
          var posCoords = position.coords,
            mCoords = mobile.coords;

          mCoords.latitude = posCoords.latitude;
          mCoords.longitude = posCoords.longitude;
          mCoords.altitude = posCoords.altitude || 0; // can be null,
          mCoords.accuracy = posCoords.accuracy;
          mCoords.altitudeAccuracy = posCoords.altitudeAccuracy || 0; // can be null
          mCoords.heading = posCoords.heading || -1; // can be null
          mCoords.speed = posCoords.speed || -1; // can be null

          p.locationChanged();
        },
        function error(e) {
          // Ignore and use defaults already set for coords
          console.log('Unable to get geolocation position data: ' + e);
        }
      );
    }
  }

  // Extend Processing with locationChanged() callback logic.
  window.Processing = function() {
    var p5 = P5.apply(this, arguments);
    attachLocationCallback(p5);
    return p5;
  };
  window.Processing.prototype = Pp;

  // Copy static properties onto new Processing
  for (var prop in P5) {
    if (!P5.hasOwnProperty(prop)) {
      continue;
    }
    window.Processing[prop] = P5[prop];
  }

  // Extend any existing Processing instances with location callback, too.
  document.addEventListener('DOMContentLoaded', function() {
    Processing.instances.forEach(function(instance) {
      attachLocationCallback(instance);
    });
  }, false);

  window.addEventListener('devicemotion', function(event) {
    var acceleration = event.acceleration || event.accelerationIncludingGravity,
      mAcceleration = mobile.acceleration;

    // Values are in m/s^2
    mAcceleration.x = acceleration.x;
    mAcceleration.y = acceleration.y;
    mAcceleration.z = acceleration.z;
  }, false);

  function orientationhandler(evt) {
    // For FF3.6+
    if (!evt.gamma && !evt.beta) {
      evt.gamma = -(evt.x * (180 / Math.PI));
      evt.beta = -(evt.y * (180 / Math.PI));
    }

    var mOrientation = mobile.orientation;
    mOrientation.alpha = evt.alpha;
    mOrientation.beta = evt.beta;
    mOrientation.gamma = evt.gamma;
    mOrientation.compassAccuracy = evt.webkitCompassAccuracy ? evt.webkitCompassAccuracy : -1;
    mOrientation.compassHeading = evt.webkitCompassHeading ? evt.webkitCompassHeading + window.orientation : -1;
  }

  window.addEventListener('deviceorientation',  orientationhandler, false);
  window.addEventListener('MozOrientation',     orientationhandler, false);

  ['orientation', 'acceleration', 'coords'].forEach(function(objName) {
    Pp.__defineGetter__(objName, function() {
      return mobile[objName];
    });
  });

}(Processing, window, window.navigator));
