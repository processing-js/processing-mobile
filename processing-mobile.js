(function(Processing, window) {

  // If we don't have support for devicemotion events, use 0 for these.
  var motionX = 0,
      motionY = 0,
      motionZ = 0;

  window.addEventListener('devicemotion', function(event) {
    var acceleration = event.acceleration || event.accelerationIncludingGravity;

    // Values are in m/s^2
    motionX = acceleration.x;
    motionY = acceleration.y;
    motionZ = acceleration.z;
  }, false);

  var Pp = Processing.prototype;

  Pp.__defineGetter__('motionX', function() {
    return motionX;
  });

  Pp.__defineGetter__('motionY', function() {
    return motionY;
  });

  Pp.__defineGetter__('motionZ', function() {
    return motionZ;
  });

}(Processing, window));
