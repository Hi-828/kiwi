'use strict'

angular
    .module('app.bend.auth', [])
    .factory('BendAuthBootstrap', ['$bend', '$rootScope', function($bend, $rootScope){
        return {
          APP_KEY: "56e615c74bad3079230058bb",
          APP_SECRET: "kE2gFc3VwFKNeHXQ9H5zBfMCEzWRwMGswgvJqpNv",
          checkAuthToken: function (callback) {
            callback = callback || function () {
              };

            var expiresIn = 23.5 * 60 * 60 * 1000; // ~24 hours.
            Bend.appKey = this.APP_KEY;
            $bend.LocalStorage.get("tokenLastUsedTime").then(function (timestamp) {
              if (timestamp) {
                var diff = Date.now() - parseInt(timestamp);
                if (diff > expiresIn) {
                  console.log("Token has been expired!")
                  $bend.LocalStorage.destroy('activeUser');
                }

                callback(null);
                return;
              }

              callback(null);
            }, function (error) {
              callback(error);
            });
          },
          bootstrapService: function (callback) {
            var that = this;
            this.checkAuthToken(function (error) {
              if (error) {
                console.log(error);
              }

              $bend.init({
                appKey: that.APP_KEY,
                appSecret: that.APP_SECRET
              }).then(
                function (activeUser) {
                  console.log("active user", activeUser);
                  angular.bootstrap(document.getElementById('fuse-app'), ['fuse']);
                  if (activeUser) {
                    //BendPusher.init();
                  }

                  callback(activeUser);
                },
                function (error) {
                  console.log(error);
                  angular.bootstrap(document.getElementById('fuse-app'), ['fuse'])
                  callback(error);
                }
              );
            });
          }
        }
    }])
    .factory('BendAuth', [
        '$location', '$http', '$bend','BendAuthBootstrap','$rootScope', function ($location, $http, $bend, BendAuthBootstrap, $rootScope) {
            var BendAuth = {};

            BendAuth.APP_KEY = BendAuthBootstrap.APP_KEY;
            BendAuth.APP_SECRET = BendAuthBootstrap.APP_SECRET;

            BendAuth.bootstrapService = function() {
              console.log("BendAuth.bootstrapService");
                var $bend = initInjector.get('$bend');
                $bend.init({
                    appKey: this.APP_KEY,
                    appSecret: this.APP_SECRET
                }).then(function () {
                    angular.bootstrap(document.getElementById('app'), ['fuse'])
                });
            };

            BendAuth.checkAuth = function () {
                if (!this.isLoggedIn()) {
                    return this.redirectToLogin();
                } else {
                    var user = this.getActiveUser();
                    this.isAdmin(user,function(admin){
                        if(!admin) {
                            BendAuth.logOut();
                        }
                    });
                }
            };

            BendAuth.getActiveUser = function () {
                return $bend.getActiveUser();
            };

            BendAuth.init = function () {
                return $bend.init({
                    appKey: BendAuth.APP_KEY,
                    appSecret: BendAuth.APP_SECRET
                });
            };

        BendAuth.isLoggedIn = function () {
          return $bend.getActiveUser() != null;
        };

        BendAuth.checkEmail = function (username, callback) {
          console.log(username);
          $bend.User.exists(username).then(function(ret){
            console.log(ret);
            if(ret) {
              callback(true);
            } else {
              callback(false);
            }
          }, function(err){
            console.log(err);
          })
        };

        BendAuth.isExpired = function() {
          var activeUser = BendAuth.getActiveUser();
          var now = new Date().getTime() * 1000000;
          if(activeUser.subscriptionType == 0 || activeUser.subscriptionType == 1 || activeUser.subscriptionType == 6 ) {
            if(activeUser.expirationDateFreeTrial) {
              if(activeUser.expirationDateFreeTrial < now) {
                return true;
              }
            } else {
              return true;
            }
          } else if(activeUser.subscriptionType == 2 || activeUser.subscriptionType == 3 || activeUser.subscriptionType == 4 ) {
            if(activeUser.expirationDate) {
              if(activeUser.expirationDate < now) {
                return true;
              }
            } else {
              return true;
            }
          }

          return false;
        }

        BendAuth.logIn = function (credentials, callback) {
                var callback = callback || function () {};

                $bend.User.login(credentials).then(
                    function (res) {
                      //console.log("login result", res);
                      //callback(null);
                      //check if this user is admin
                      //var authString = "Basic " + Base64.encode(BendAuth.APP_KEY + ":" + "0clWe4Gd9z48Bk8UjGDxUzvtTLSYXc3BxE82SE6G");//res._bmd.authtoken;;
                      var authString = "Bend " + res._bmd.authtoken;//res._bmd.authtoken;;
                      console.log(authString);
                      $.ajax({
                        url: "http://bend.neusis.com:8000/group/" + BendAuth.APP_KEY + "/admin",
                        headers: {"Authorization": authString}
                      }).then(function(ret){
                        var adminList = ret.users.list;
                        var adminUser = _.find(adminList, function(o){
                          return o._id == res._id;
                        })

                        if(adminUser)
                          callback(null);
                        else
                          BendAuth.logOut();
                      }, function(err){
                        console.log(err);
                      });
                    },
                    function (error) {
                      callback({
                        name: "Credentials are incorrect."
                      });
                    }
                );
            };

            BendAuth.logOut = function () {
                if (this.isLoggedIn()) {
                    return $bend.User.logout({
                        success: function () {
                            BendAuth.redirectToLogin();
                            return $bend.Sync.destruct();
                        }
                    });
               }
            };

            BendAuth.redirectToDashboard = function () {
              applyChangesOnScope($rootScope, function(){
                $location.url('/users');
              })
            };

            BendAuth.redirectToLogin = function () {
              return $location.path('/auth/login');
            };

            BendAuth.isAdmin = function(user,callback) {
                var callback = callback || function() {};

                //if(user.role == 0) // && user.subscriptionType == 0)
                    return callback(true);

                //return callback(false);
            };

            BendAuth.setAdmin = function(user,isAdmin,callback) {
                var callback = callback || function() {};
            };

            return BendAuth;
        }
    ]);


var Base64 = {
  // private property
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode: function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
        Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

    }

    return output;
  },

  // public method for decoding
  decode: function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

      enc1 = Base64._keyStr.indexOf(input.charAt(i++));
      enc2 = Base64._keyStr.indexOf(input.charAt(i++));
      enc3 = Base64._keyStr.indexOf(input.charAt(i++));
      enc4 = Base64._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }

    }

    output = Base64._utf8_decode(output);

    return output;

  },

  // private method for UTF-8 encoding
  _utf8_encode: function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode: function (utftext) {
    var string = "";
    var i = 0;
    var c = 0, c2 = 0, c3 = 0;

    while (i < utftext.length) {

      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }

    }
    return string;
  }
};
