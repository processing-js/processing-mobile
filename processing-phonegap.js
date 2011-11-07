/*****************************************************

 Processing PhoneGap Device API for Processing.js
 [ http://docs.phonegap.com/en/1.1.0/index.html ]

 This library exposes the PhoneGap API (1.1.0) to Processing code and
 transforms callback and other JavaScript type constructs into Processing
 friendly versions.

 To Use:

 <!doctype html>
   <head>
     <!-- Depends on Processing.js being loaded, and loaded first. -->
     <script src="processing.js"></script>
     <script src="processing-phonegap.js"></script>
   </head>
   ...
 </html>

 NOTE: Create your processing instance with code so that you can wait for
 the deviceready event, afterwhich you should listen for DOMContentLoaded.

 New Processing types, constants methods, callbacks
 --------------------------------------------------

 // These are the currently unexposed apects of PhoneGap API.  All of these
 // can still be  accessed via pure JavaScript calls.  See the PhoneGap API docs.
 // TODO:
 //   Camera
 //   Capture
 //   Contacts
 //   File
 //   Media
 //   Storage

 // Device Strings via global device object
 class Device {
   String name;
   String phonegap;
   String platform;
   String uuid;
   Sevice version;
 }
 Device device;

 // Acceleration type, global variable, and callback
 class Acceleration {
   float x;
   float y;
   float z;
   Date timestamp;
 }
 Acceleration acceleration

 // Accelerometer Event callback
 void accelerometer() {
    // acceleration is ready to be used
 }

 // Geolocation types, global variable, and callback
 class Coords {
   float latitude; // Latitude in decimal degrees.
   float longitude; // Longitude in decimal degrees.
   float altitude; // Height of the position in meters above the ellipsoid.
   float accuracy; // Accuracy level of the latitude and longitude coordinates in meters.
   float altitudeAccuracy; // Accuracy level of the altitude coordinate in meters.
   float heading; // Direction of travel, specified in degrees counting clockwise relative to the true north.
   float speed; // Current ground speed of the device, specified in meters per second.
 }
 class Position {
   Coords coords; // The coords of the current position.
   Date timestamp; // The timestamp of the current position.
 }
 Position position;

 // Geolocation Event callback
 void geolocation() {
   // position is ready to be used
 }

 // Compass
 class Heading {
   float magneticHeading; // The heading in degrees from 0 - 359.99 at a single moment in time.
   float trueHeading; // The heading relative to the geographic North Pole in degrees 0 - 359.99 at a single moment in time.
   float headingAccuracy; // headingAccuracy: The deviation in degrees between the reported heading and the true heading.
   Date timestamp; // The time (ms) at which this heading was determined.
 }
 Heading heading;

 // Compass Event Callback
 void compass() {
   // heading is ready to be used
 }

 // New Global Constants for Connection Type
 UNKNOWN
 ETHERNET
 WIFI
 CELL_2G
 CELL_3G
 CELL_4G
 NONE

 // Current Device Connection Type (one of the constants
 // listed above)
 object connectionType

 // Processing's online variable is mapped to PhoneGap's
 // event state for online/offline)
 boolean online;

 // Device Back Button Event Callback
 void backButtonPressed() {
 }

 // Device Menu Button Event Callback
 void menuButtonPressed() {
 }

 // Device Search Button Event Callback
 void searchButtonPressed() {
 }

 // Device Start Call Button Event Callback
 void startCallButtonPressed() {
 }

 // Device Start Call Button Event Callback
 void endCallButtonPressed() {
 }

 // Device Volume Down Button Event Callback
 void volumeDownButtonPressed() {
 }

 // Device Volume Up Button Event Callback
 void volumeUpButtonPressed() {
 }

 // Beep method causes the device to beep the desired number of times.
 beep(int num);

 // Vibrate method causes the device to vibrate for the desired
 // number of ms
 vibrate(int ms);

*****************************************************/

(function(Processing, window, navigator, device) {

  // Make sure we have Processing
  if (!window.Processing) {
    throw "Processing.js PhoneGap Error: Processing not loaded.";
  }

  // Make sure we're running on PhoneGap
  if (!(window.device && window.device.phonegap)) {
    throw "Processing.js PhoneGap Error: PhoneGap device API not found.";
  }

  // PhoneGap device state
  var phoneGap = {
    // The global device object
    device: device,

    // Whether or not the device is connected to the Internet
    online: false,

    // If we don't have support for acceleration events, use -1 for these.
    acceleration: {
      x: -1,
      y: -1,
      z: -1,
      timestamp: Date.now()
    },

    // If we don't have support for compass events, use -1 for these.
    heading: {
      magneticHeading: -1,
      trueHeading: -1,
      headingAccuracy: -1,
      timestamp: Date.now()
    },

    // Defaults for geolocation data
    position: {
      coords: {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: -1,
        speed: -1
      },
      timestamp: Date.now()
    },
  };

  // Cache Processing ctor, prototype since we'll wrap/alter them.
  var P5 = Processing,
    Pp = Processing.prototype,
    log = (console && console.log) ? console.log : function(){};

  // Expose connection type constants via PConstants
  var PConstants = Pp.PConstants;
  PConstants.UNKNOWN  = Connection.UNKNOWN;
  PConstants.ETHERNET = Connection.ETHERNET;
  PConstants.WIFI     = Connection.WIFI;
  PConstants.CELL_2G  = Connection.CELL_2G;
  PConstants.CELL_3G  = Connection.CELL_3G;
  PConstants.CELL_4G  = Connection.CELL_4G;
  PConstants.NONE     = Connection.NONE;

  // Expose connection type (shared for all instances)
  Pp.__defineGetter__('connectionType', function() {
    return navigator.network.connection.type;
  });

  // Expose beep method
  Pp.beep = function(n) {
    n = n || 1;
    navigator.notification.beep(n);
  }

  // Expose vibrate method
  Pp.vibrate = function(ms) {
    ms = ms || 1000;
    navigator.notification.vibrate(ms);
  }

  // Extend the Processing ctor.
  window.Processing = function() {
    var p5 = P5.apply(this, arguments),
      aWatchID,
      cWatchID,
      gWatchID;

    // Do we have an accelerometer callback? If so, start a watch
    if (p5.accelerometer) {
      aWatchID = navigator.accelerometer.watchAcceleration(
        function(acceleration) {
          phoneGap.acceleration = acceleration;
          p5.accelerometer();
        },
        function() {
          log('Processing.js PhoneGap Error: Unable to get accelerometer data.');
        }
      );
    }

    // Do we have a compass callback? If so, start a watch
    if (p5.compass) {
      cWatchID = navigator.compass.watchHeading(
        function(heading) {
          phoneGap.heading = heading;
          p5.compass();
        },
        function() {
          log('Processing.js PhoneGap Error: Unable to get compass data.');
        }
      );
    }

    // Do we have a geolocation callback? If so, start a watch
    if (p5.geolocation) {
      gWatchId = navigator.geolocation.watchPosition(
        function(position) {
          phoneGap.position = position;
          p5.geolocation();
        },
        function() {
          log('Processing.js PhoneGap Error: Unable to get geolocation data.');
        }
      );
    }

    // Do we have a startCallButtonPressed callback?
    if (p5.startCallButtonPressed) {
      document.addEventListener("startcallbutton", function() {
        p5.startCallButtonPressed();
      }, false);
    }

    // Do we have an endCallButtonPressed callback?
    if (p5.endCallButtonPressed) {
      document.addEventListener("endcallbutton", function() {
        p5.endCallButtonPressed();
      }, false);
    }

    // Do we have a searchButtonPressed callback?
    if (p5.searchButtonPressed) {
      document.addEventListener("searchbutton", function() {
        p5.searchButtonPressed();
      }, false);
    }

    // Do we have a backButtonPressed callback?
    if (p5.backButtonPressed) {
      document.addEventListener("backbutton", function() {
        p5.backButtonPressed();
      }, false);
    }

    // Do we have a menuButtonPressed callback?
    if (p5.menuButtonPressed) {
      document.addEventListener("menubutton", function() {
        p5.menuButtonPressed();
      }, false);
    }

    // Do we have a volumeDownButtonPressed callback?
    if (p5.volumeDownButtonPressed) {
      document.addEventListener("volumedownbutton", function() {
        p5.volumeDownButtonPressed();
      }, false);
    }

    // Do we have a volumeUpButtonPressed callback?
    if (p5.volumeUpButtonPressed) {
      document.addEventListener("volumeupbutton", function() {
        p5.volumeUpButtonPressed();
      }, false);
    }

    // When the app gets paused/resumed (put into background)
    // stop/start our draw loop
    document.addEventListener('pause', function() {
      p5.noLoop();
    }, false);
    document.addEventListener('resume', function() {
      p5.loop();
    }, false);

    // When the device's network state changes (connection to
    // the Internet), change the value of Processing's online variable
    document.addEventListener('online', function() {
      phoneGap.online = true;
    }, false);
    document.addEventListener('offline', function() {
      phoneGap.online = false;
    }, false);

    // Need to override the instance's default 'online' getter
    delete p5.online;
    p5.__defineGetter__('online', function() {
      return phoneGap.online;
    });

    // Grab a reference to the existing exit method so we can extend it.
    var exitFunc = p5.exit;

    p5.exit = function() {
      // Kill any running watches
      if (aWatchID) {
        navigator.accelerometer.clearWatch(aWatchID);
        aWatchID = null;
      }
      if (cWatchID) {
        navigator.compass.clearWatch(cWatchID);
        cWatchID = null;
      }
      if (gWatchID) {
        navigator.geolocation.clearWatch(gWatchID);
        gWatchID = null;
      }

      // TODO: should clean up all the listeners we've attached...

      // Do a proper clean-up using the original exit() method
      exitFunc.apply(p5);
    };

    return p5;
  };
  window.Processing.prototype = Pp;

  // Copy static properties onto the wrapped Processing
  for (var prop in P5) {
    if (!P5.hasOwnProperty(prop)) {
      continue;
    }
    window.Processing[prop] = P5[prop];
  }

  // Attach the rest of the new global variables
  ['acceleration', 'heading', 'position'].forEach(function(objName) {
    Pp.__defineGetter__(objName, function() {
      return phoneGap[objName];
    });
  });

}(Processing, window, window.navigator, window.device));
