'use strict'

angular
  .module('app.common', [])
  .factory('CommonUtil', [
    '$location', function ($location) {
      var CommonUtil = {};
      var locale = window.navigator.userLanguage || window.navigator.language;
      var formatLL = "MMMM D, YYYY"; //moment.localeData(locale).longDateFormat('LL'); //MMMM D, YYYY
      var formatL = "MM/DD/YYYY"; //moment.localeData(locale).longDateFormat('L'); //MM/DD/YYYY
      var formatL2 = formatL.replace("YYYY", "YY"); //MM/DD/YY
      var formatLL2 = formatLL.replace("YYYY", "").trim(); //MMMM D,
      var formatLL3 = formatLL2.replace("MMMM", "MMM"); //MMM D,
      var formatLL4 = (formatLL3[formatLL3.length - 1] == ',')?formatLL3.substring(0, formatLL3.length - 1):formatLL3; //MMM D
      var formatLLLL = "dddd, MMMM D, YYYY LT"; //moment.localeData(locale).longDateFormat('LLLL'); //dddd, MMMM D, YYYY LT
      var formatLLLL2 =formatLLLL.replace("LT", "").trim(); //dddd, MMMM D, YYYY LT

      CommonUtil.formatDate = function(ts) {
        if(ts == "" || ts == null)
          return "";

        return moment.unix(ts/1000000000).format(formatLL);
      };

      CommonUtil.formatDateWithFormat = function(ts, formatStr) {
        if(ts == "" || ts == null)
          return moment.unix(Date.now()/1000).format(formatStr);

        return moment.unix(ts/1000000000).format(formatStr);
      };

      CommonUtil.formatDateTime2 = function(datetimeStr) {
        if(datetimeStr == "" || datetimeStr == null || typeof datetimeStr == 'undefined')
          return moment.unix(Date.now()/1000).format(formatL2);

        if(typeof datetimeStr == 'string')
          return datetimeStr;
        else
          return moment.unix(datetimeStr.getTime()/1000).format(formatL2 + " h:mm a");
      };
      CommonUtil.formatDateTime = function(ts) {
        if(ts == "" || ts == null)
          return "";

        return moment.unix(ts/1000000000).format(formatLL2 + " h:mm a");
      };
      CommonUtil.formatSimpleDateTime = function(ts) {
        return moment.unix(ts/1000000000).format(formatLL3 + " h:mm a");
      };
      CommonUtil.isPastDay = function(ts) {
        if(typeof ts == 'undefined')
          return false;
        else {
          var delta = (ts/1000000000 - (new Date().getTime()) / 1000);
          if(delta < 0) {
            return true;
          } else
            return false;
        }
      }

      CommonUtil.getAge = function(ts) {
        if(ts == null || ts == "")
          return "";
        var days = Math.floor((Date.now()/1000 - ts/1000000000)/3600/24);
        if(days < 1)
          return "-1 day-old";
        else if(days < 365)
          return days + " day-old";
        else {
          var years = Math.floor(days/365);
          return years + " yo";
        }
      };

      CommonUtil.getPastDateTime = function(ts) {
        if(ts == null || ts == "")
          return "";
        var mins = Math.floor((Date.now()/1000 - ts/1000000000)/60);
        if(mins < 0) {
          return "just now";
        } else if(mins < 60) {
          return mins + " minutes ago";
        } else if(mins < 24 * 60) {
          return CommonUtil.formatDateWithFormat(ts, "h:mm a");
        } else {
          return CommonUtil.formatSimpleDateTime(ts)
        }
      };

      CommonUtil.getGenderCode = function(text) {
        if(text == "male") {
          return 0;
        } else if(text == "female") {
          return 1;
        }

        return 2;
      };

      CommonUtil.convertArrayToString = function(list) {
        var ret = "";

        if(list) {
          ret = list.join(", ");
        }

        return ret;
      }

      CommonUtil.convertArrayToString2 = function(list) {
        var ret = "";

        if(list) {
          for(var i = 0 ; i <= list.length - 1; i++) {
            if( i < list.length - 2) {
              ret += list[i] + ", "
            } else if (i < list.length - 1) {
              ret += list[i] + " or "
            } else
              ret += list[i]
          }
        }

        return ret;
      }

      CommonUtil.checkFileType = function(allowedTypes, type, name) {
        if(allowedTypes) {
          for(var i = 0 ; i < allowedTypes.length ; i++) {
            var o = allowedTypes[i];
            var ret;
            if(o == 'photos')
              ret = type.match(/image.*/);
            else if(o == 'videos')
              ret = type.match(/video.*/);
            else if(o == 'archives')
              ret = name.match(/\.(rar|zip|tar|jar|tgz|7z|iso|gz)$/i);
            else if(o == 'documents')
              ret = name.match(/\.(doc|docx|pdf|txt|xls|xlsx|ppt|pptx)$/i);

            if(ret)
              return true;
          }
        } else
          return true;

        return false;
      }

      CommonUtil.getSmallImage = function(file) {
        if(!file)
          return "/assets/images/avatars/profile-120x120.jpg";

        if(file._file)
          file = file._file;

        if(file._versions) {
          if(file._versions.sm) {
            return file._versions.sm._downloadURL;
          } else
            return file._downloadURL;
        } else {
          return file._downloadURL;
        }
      }
      CommonUtil.getSmallImage2 = function(file) {
        if(!file)
          return "/assets/images/no-image.png";

        if(file._file)
          file = file._file;

        if(file._versions) {
          if(file._versions.sm) {
            return file._versions.sm._downloadURL;
          } else
            return file._downloadURL;
        } else {
          return file._downloadURL;
        }
      }
      CommonUtil.getSmallImage3 = function(file) {
        if(!file)
          return "";

        if(file._file)
          file = file._file;

        if(file._versions) {
          if(file._versions.sm) {
            return file._versions.sm._downloadURL;
          } else
            return file._downloadURL;
        } else {
          return file._downloadURL;
        }
      }
      CommonUtil.getDownloadURL = function(file) {
        if(!file)
          return "";

        if(file._file)
          file = file._file;

        return file._downloadURL;
      }
      CommonUtil.getAvatarThumbnail = function(avatar) {
        if(!avatar) {
          return "/assets/images/avatars/profile-120x120.jpg";
        }

        if(avatar._file)
          return CommonUtil.getSmallImage(avatar._file);
        else
          return CommonUtil.getSmallImage(avatar);
      }

      CommonUtil.getMiddleImage = function(file) {
        if(file._versions) {
          if(file._versions.md) {
            return file._versions.md._downloadURL;
          } else
            return file._downloadURL;
        } else {
          return file._downloadURL;
        }
      }

      CommonUtil.convertBoolean = function(val) {
        return val?"Yes":"No";
      }
      CommonUtil.ifnull = function(val, def) {
        return val?val:def;
      }

      CommonUtil.makeBendRef = function(id, collectionName) {
        return {
          "_type": "BendRef",
          "_id": id,
          "_collection": collectionName
        }
      }

      CommonUtil.makeBendFile = function(id) {
        return {
          "_type": "BendFile",
          "_id": id
        };
      }

      CommonUtil.FieldTypes = ["Short-Text", "Long-Text", "Select", "Multi-Select", "Integer", "Decimal", "Boolean", "Radio-Select", "Checkbox-Select"];
      CommonUtil.genders = ['male', 'female', 'transgender'];
      CommonUtil.FileTypes = ["videos", "archives", "photos", "documents"];

      CommonUtil.AllCountries = [{code:"AF",name:"Afghanistan"},{code:"AL",name:"Albania"},{code:"DZ",name:"Algeria"},{code:"AS",name:"American Samoa"},{code:"AD",name:"Andorre"},{code:"AO",name:"Angola"},{code:"AI",name:"Anguilla"},{code:"AQ",name:"Antarctica"},{code:"AG",name:"Antigua and Barbuda"},{code:"AR",name:"Argentina"},{code:"AM",name:"Armenia"},{code:"AW",name:"Aruba"},{code:"AU",name:"Australia"},{code:"AT",name:"Austria"},{code:"AZ",name:"Azerbaijan"},{code:"BS",name:"Bahamas"},{code:"BH",name:"Bahrain"},{code:"BD",name:"Bangladesh"},{code:"BB",name:"Barbade"},{code:"BY",name:"Belarus"},{code:"BE",name:"Belgium"},{code:"BZ",name:"Belize"},{code:"BJ",name:"Benin"},{code:"BM",name:"Bermuda"},{code:"BT",name:"Bhutan"},{code:"BO",name:"Bolivia"},{code:"BQ",name:"Bonaire, Sint Eustatius and Saba"},{code:"BA",name:"Bosnia and Herzegovina"},{code:"BW",name:"Botswana"},{code:"BV",name:"Bouvet Island"},{code:"BR",name:"Brazil"},{code:"IO",name:"British Indian Ocean Territory"},{code:"VG",name:"British Virgin Islands"},{code:"BN",name:"Brunei"},{code:"BG",name:"Bulgaria"},{code:"BF",name:"Burkina Faso"},{code:"BI",name:"Burundi"},{code:"KH",name:"Cambodia"},{code:"CM",name:"Cameroon"},{code:"CA",name:"Canada"},{code:"CV",name:"Cape Verde"},{code:"KY",name:"Cayman Islands"},{code:"CF",name:"Central African Republic"},{code:"TD",name:"Chad"},{code:"CL",name:"Chile"},{code:"CN",name:"China"},{code:"CX",name:"Christmas Island"},{code:"CC",name:"Cocos (Keeling) Islands"},{code:"CO",name:"Colombia"},{code:"KM",name:"Comoros"},{code:"CG",name:"Congo"},{code:"CD",name:"Congo (Dem. Rep.)"},{code:"CK",name:"Cook Islands"},{code:"CR",name:"Costa Rica"},{code:"ME",name:"Crna Gora"},{code:"HR",name:"Croatia"},{code:"CU",name:"Cuba"},{code:"CW",name:"Curaçao"},{code:"CY",name:"Cyprus"},{code:"CZ",name:"Czech Republic"},{code:"CI",name:"Côte D'Ivoire"},{code:"DK",name:"Denmark"},{code:"DJ",name:"Djibouti"},{code:"DM",name:"Dominica"},{code:"DO",name:"Dominican Republic"},{code:"TL",name:"East Timor"},{code:"EC",name:"Ecuador"},{code:"EG",name:"Egypt"},{code:"SV",name:"El Salvador"},{code:"GQ",name:"Equatorial Guinea"},{code:"ER",name:"Eritrea"},{code:"EE",name:"Estonia"},{code:"ET",name:"Ethiopia"},{code:"FK",name:"Falkland Islands"},{code:"FO",name:"Faroe Islands"},{code:"FJ",name:"Fiji"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},{code:"GF",name:"French Guiana"},{code:"PF",name:"French Polynesia"},{code:"TF",name:"French Southern Territories"},{code:"GA",name:"Gabon"},{code:"GM",name:"Gambia"},{code:"GE",name:"Georgia"},{code:"DE",name:"Germany"},{code:"GH",name:"Ghana"},{code:"GI",name:"Gibraltar"},{code:"GR",name:"Greece"},{code:"GL",name:"Greenland"},{code:"GD",name:"Grenada"},{code:"GP",name:"Guadeloupe"},{code:"GU",name:"Guam"},{code:"GT",name:"Guatemala"},{code:"GG",name:"Guernsey and Alderney"},{code:"GN",name:"Guinea"},{code:"GW",name:"Guinea-Bissau"},{code:"GY",name:"Guyana"},{code:"HT",name:"Haiti"},{code:"HM",name:"Heard and McDonald Islands"},{code:"HN",name:"Honduras"},{code:"HK",name:"Hong Kong"},{code:"HU",name:"Hungary"},{code:"IS",name:"Iceland"},{code:"IN",name:"India"},{code:"ID",name:"Indonesia"},{code:"IR",name:"Iran"},{code:"IQ",name:"Iraq"},{code:"IE",name:"Ireland"},{code:"IM",name:"Isle of Man"},{code:"IL",name:"Israel"},{code:"IT",name:"Italy"},{code:"JM",name:"Jamaica"},{code:"JP",name:"Japan"},{code:"JE",name:"Jersey"},{code:"JO",name:"Jordan"},{code:"KZ",name:"Kazakhstan"},{code:"KE",name:"Kenya"},{code:"KI",name:"Kiribati"},{code:"KP",name:"Korea (North)"},{code:"KR",name:"Korea (South)"},{code:"KW",name:"Kuwait"},{code:"KG",name:"Kyrgyzstan"},{code:"LA",name:"Laos"},{code:"LV",name:"Latvia"},{code:"LB",name:"Lebanon"},{code:"LS",name:"Lesotho"},{code:"LR",name:"Liberia"},{code:"LY",name:"Libya"},{code:"LI",name:"Liechtenstein"},{code:"LT",name:"Lithuania"},{code:"LU",name:"Luxembourg"},{code:"MO",name:"Macao"},{code:"MK",name:"Macedonia"},{code:"MG",name:"Madagascar"},{code:"MW",name:"Malawi"},{code:"MY",name:"Malaysia"},{code:"MV",name:"Maldives"},{code:"ML",name:"Mali"},{code:"MT",name:"Malta"},{code:"MH",name:"Marshall Islands"},{code:"MQ",name:"Martinique"},{code:"MR",name:"Mauritania"},{code:"MU",name:"Mauritius"},{code:"YT",name:"Mayotte"},{code:"MX",name:"Mexico"},{code:"FM",name:"Micronesia"},{code:"MD",name:"Moldova"},{code:"MC",name:"Monaco"},{code:"MN",name:"Mongolia"},{code:"MS",name:"Montserrat"},{code:"MA",name:"Morocco"},{code:"MZ",name:"Mozambique"},{code:"MM",name:"Myanmar"},{code:"NA",name:"Namibia"},{code:"NR",name:"Nauru"},{code:"NP",name:"Nepal"},{code:"NL",name:"Netherlands"},{code:"AN",name:"Netherlands Antilles"},{code:"NC",name:"New Caledonia"},{code:"NZ",name:"New Zealand"},{code:"NI",name:"Nicaragua"},{code:"NE",name:"Niger"},{code:"NG",name:"Nigeria"},{code:"NU",name:"Niue"},{code:"NF",name:"Norfolk Island"},{code:"MP",name:"Northern Mariana Islands"},{code:"NO",name:"Norway"},{code:"OM",name:"Oman"},{code:"PK",name:"Pakistan"},{code:"PW",name:"Palau"},{code:"PS",name:"Palestine"},{code:"PA",name:"Panama"},{code:"PG",name:"Papua New Guinea"},{code:"PY",name:"Paraguay"},{code:"PE",name:"Peru"},{code:"PH",name:"Philippines"},{code:"PN",name:"Pitcairn"},{code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"PR",name:"Puerto Rico"},{code:"QA",name:"Qatar"},{code:"RO",name:"Romania"},{code:"RU",name:"Russia"},{code:"RW",name:"Rwanda"},{code:"RE",name:"Réunion"},{code:"BL",name:"Saint Barthélemy"},{code:"SH",name:"Saint Helena"},{code:"KN",name:"Saint Kitts and Nevis"},{code:"LC",name:"Saint Lucia"},{code:"MF",name:"Saint Martin"},{code:"PM",name:"Saint Pierre and Miquelon"},{code:"VC",name:"Saint Vincent and the Grenadines"},{code:"WS",name:"Samoa"},{code:"SM",name:"San Marino"},{code:"SA",name:"Saudi Arabia"},{code:"SN",name:"Senegal"},{code:"RS",name:"Serbia"},{code:"SC",name:"Seychelles"},{code:"SL",name:"Sierra Leone"},{code:"SG",name:"Singapore"},{code:"SX",name:"Sint Maarten"},{code:"SK",name:"Slovakia"},{code:"SI",name:"Slovenia"},{code:"SB",name:"Solomon Islands"},{code:"SO",name:"Somalia"},{code:"ZA",name:"South Africa"},{code:"GS",name:"South Georgia and the South Sandwich Islands"},{code:"SS",name:"South Sudan"},{code:"ES",name:"Spain"},{code:"LK",name:"Sri Lanka"},{code:"SD",name:"Sudan"},{code:"SR",name:"Suriname"},{code:"SJ",name:"Svalbard and Jan Mayen"},{code:"SZ",name:"Swaziland"},{code:"SE",name:"Sweden"},{code:"CH",name:"Switzerland"},{code:"SY",name:"Syria"},{code:"ST",name:"São Tomé and Príncipe"},{code:"TW",name:"Taiwan"},{code:"TJ",name:"Tajikistan"},{code:"TZ",name:"Tanzania"},{code:"TH",name:"Thailand"},{code:"TG",name:"Togo"},{code:"TK",name:"Tokelau"},{code:"TO",name:"Tonga"},{code:"TT",name:"Trinidad and Tobago"},{code:"TN",name:"Tunisia"},{code:"TR",name:"Turkey"},{code:"TM",name:"Turkmenistan"},{code:"TC",name:"Turks and Caicos Islands"},{code:"TV",name:"Tuvalu"},{code:"UG",name:"Uganda"},{code:"UA",name:"Ukraine"},{code:"AE",name:"United Arab Emirates"},{code:"GB",name:"United Kingdom"},{code:"UM",name:"United States Minor Outlying Islands"},{code:"US",name:"United States of America"},{code:"UY",name:"Uruguay"},{code:"UZ",name:"Uzbekistan"},{code:"VU",name:"Vanuatu"},{code:"VA",name:"Vatican City"},{code:"VE",name:"Venezuela"},{code:"VN",name:"Vietnam"},{code:"VI",name:"Virgin Islands of the United States"},{code:"WF",name:"Wallis and Futuna"},{code:"EH",name:"Western Sahara"},{code:"YE",name:"Yemen"},{code:"ZM",name:"Zambia"},{code:"ZW",name:"Zimbabwe"},{code:"AX",name:"Åland Islands"}];

      CommonUtil.UserStatus = [{code:0, value:"waiting-for-info"}, {code:1, value:"pending-review"}, {code:2, value:"rejected"}, {code:3, value:"approved"}];
      CommonUtil.UserVisibility = ["hidden", "viewable", "searchable"];

      CommonUtil.AllStates = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
      CommonUtil.CAProvinces = ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island", "Northwest Territories", "Yukon", "Nunavut"];
      CommonUtil.paymentMethods = [{value:"check", label:"Check"}, {value:"direct-deposit",label:"Direct Deposit"},/*{value:"domestic-wire", label:"Domestic Wire Transfer"},*/ {value:"international-wire", label:"International Wire Transfer"}, {value:"paypal", label:"PayPal"}];
      //CommonUtil.TileTypes = ["product", "journal", "comment", "schedule", "image", "video", "text"];
      CommonUtil.TileTypes = ["product", "image", "text"];

      return CommonUtil;
    }
  ]);
