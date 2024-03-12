'use strict'

angular
  .module('app.bend.service', [])
  .factory('BendService', [
    '$location', '$bend', 'BendAuth', '$rootScope', 'CommonUtil','BendAuthBootstrap','eachSeries', function ($location, $bend, BendAuth, $rootScope, CommonUtil, BendAuthBootstrap, eachSeries) {
      var BendService = {};

      BendService.init = function(callback) {
        callback(null);
      }

      BendService.upload = function (file, callback,ext, progressCallback) {
        var obj = {
          _filename: file.name,
          size: file.size,
          mimeType: file.type
        };

        if(ext) {
          _.extend(obj,ext);
        }

        console.log("Upload params:");
        console.log(obj);

        $bend.File.upload(file, obj, {"public": true}, function(res){
          console.log(res);
          callback(null, res);
        }, function(total, prog){
          if(progressCallback) {
            progressCallback(total, prog);
          }
        }).then(function (res) {
          //callback(null, res);
        }, function (error) {
          callback(error);
        });
      }

      BendService.getFile = function(refObj, callback) {
        if(refObj) {
          var query = new $bend.Query();
          query.equalTo("_id", refObj._id);
          $bend.File.find(query).then(function(rets){
            callback(rets[0]);
          }, function(err){
            console.log(err);
          })
        } else {
          callback(refObj);
        }
      }

      //user
      BendService.getUserList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        $bend.User.find(query).then(function(users){
          console.log(users);
          callback(users);
        }, function(err){
          console.log(err);
        })
      }

      BendService.checkUserName = function(username, callback) {
        var query = new $bend.Query();
        query.matches("username", new RegExp("^" + username + "$", "gi"));
        $bend.User.find(query).then(function(ret){
          if(ret&&ret.length > 0)
            callback(true);
          else
            callback(false);
        }, function(err){
          callback(err);
          //console.log(err);
        })
      }

      BendService.getValidUserList = function(callback) {
        var query = new $bend.Query();
        query.equalTo("enabled", true);
        query.notEqualTo("deleted", true);
        query.ascending("firstName").ascending("lastName");
        $bend.User.find(query).then(function(users){
          console.log(users);
          callback(users);
        }, function(err){
          console.log(err);
        })
      }

      BendService.searchUserList = function(searchWords, callback) {
        var query = new $bend.Query();
        query.equalTo("enabled", true);
        query.notEqualTo("deleted", true);
        query.ascending("username");

        query.matches("username", new RegExp('' + searchWords + '+', 'gi'));
        $bend.User.find(query).then(function(users){
          users.map(function(o){
            o.fullName = o.firstName + " " + o.lastName;
          })
          callback(users);
        }, function(err){
          console.log(err);
        })
      }

      BendService.searchUserPage = function(param) {
        var query = new $bend.Query();
        //query.notEqualTo("deleted", true);
        if(param.selectedUserType == 1)
          query.notEqualTo("provider", true);
        else if(param.selectedUserType == 2) {
          query.equalTo("provider", true);
          query.contains("status", ["3", "approved"])
        } else if(param.selectedUserType == 4) {
          query.equalTo("agent", true);
        } else if(param.selectedUserType == 3) {
          query.and(new $bend.Query().equalTo("deleted", true).or(new $bend.Query().exists("enabled",true).and().equalTo("enabled",false)));
        } else if(param.selectedUserType == 5) {
          query.and(new $bend.Query().equalTo("provider", true).or(new $bend.Query().exists("status", true)))
          query.notContainedIn("status", ["3", "approved"]);
        } else if(param.selectedUserType == 6) {
          query.contains("status", ["2", "rejected"]);
        }

        if(param.selectedUserType != 3) {
          if(!param.filter.deleted) {
            query.notEqualTo("deleted", true);
          }

          if(!param.filter.disabled) {
            query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
          }
        }

        query.descending("_bmd.createdAt");
        if(param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        query.limit(param.limit).skip(param.limit * (param.page - 1))

        return $bend.User.find(query, {
          relations:{ avatar:"BendFile"}
        });
      }

      BendService.getUserPageTotalCount = function(param, callback) {
        var query = new $bend.Query();
        //query.notEqualTo("deleted", true);
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        if(param.selectedUserType == 1)
          query.notEqualTo("provider", true);
        else if(param.selectedUserType == 2) {
          query.equalTo("provider", true);
          query.contains("status", ["3", "approved"])
        } else if(param.selectedUserType == 4) {
          query.equalTo("agent", true);
        } else if(param.selectedUserType == 3) {
          query.and(new $bend.Query().equalTo("deleted", true).or(new $bend.Query().exists("enabled",true).and().equalTo("enabled",false)));
        } else if(param.selectedUserType == 5) {
          query.and(new $bend.Query().equalTo("provider", true).or(new $bend.Query().exists("status", true)))
          query.notContainedIn("status", ["3", "approved"]);
        } else if(param.selectedUserType == 6) {
          query.contains("status", ["2", "rejected"]);
        }

        if(param.selectedUserType != 3) {
          if(!param.filter.deleted) {
            query.notEqualTo("deleted", true);
          }

          if(!param.filter.disabled) {
            query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
          }
        }

        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getAllUserCount = function(param, callback) {
        var query = new $bend.Query();
        //query.notEqualTo("deleted", true);
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        if(!param.filter.deleted) {
          query.notEqualTo("deleted", true);
        }

        if(!param.filter.disabled) {
          query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
        }
        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getNormalUserCount = function(param, callback) {
        var query = new $bend.Query();
        //query.notEqualTo("deleted", true);
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        query.notEqualTo("provider", true);
        if(!param.filter.deleted) {
          query.notEqualTo("deleted", true);
        }

        if(!param.filter.disabled) {
          query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
        }
        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }
      BendService.getAgentUserCount = function(param, callback) {
        var query = new $bend.Query();
        //query.notEqualTo("deleted", true);
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        query.equalTo("agent", true);
        if(!param.filter.deleted) {
          query.notEqualTo("deleted", true);
        }

        if(!param.filter.disabled) {
          query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
        }
        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }
      BendService.getProviderCount = function(param, callback) {
        var query = new $bend.Query();
        //query.notEqualTo("deleted", true);
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        query.equalTo("provider", true);
        query.contains("status", ["3", "approved"]); //approved
        if(!param.filter.deleted) {
          query.notEqualTo("deleted", true);
        }

        if(!param.filter.disabled) {
          query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
        }
        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getPendingUserCount = function(param, callback) {
        var query = new $bend.Query();
        query.and(new $bend.Query().equalTo("provider", true).or(new $bend.Query().exists("status", true)))
        query.notContainedIn("status", ["3", "approved"])
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        if(!param.filter.deleted) {
          query.notEqualTo("deleted", true);
        }

        if(!param.filter.disabled) {
          query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
        }
        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }
      BendService.getRejectedUserCount = function(param, callback) {
        var query = new $bend.Query();
        query.contains("status", ["2", "rejected"]);
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        if(!param.filter.deleted) {
          query.notEqualTo("deleted", true);
        }
        if(!param.filter.disabled) {
          query.and(new $bend.Query().exists("enabled",false).or(new $bend.Query().equalTo("enabled",true)));
        }
        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }
      BendService.getDeletedAndDisabledUserCount = function(param, callback) {
        var query = new $bend.Query();
        query.ascending("firstName").ascending("lastName");
        if(param.searchUserText && param.searchUserText != "")
          query.and(new $bend.Query().matches("firstName", new RegExp('' + param.searchUserText + '+', 'gi'))
            .or(new $bend.Query().matches("lastName", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("email", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("phoneNumber", new RegExp('' + param.searchUserText + '+', 'gi')))
            .or(new $bend.Query().matches("username", new RegExp('' + param.searchUserText + '+', 'gi'))));
        query.and(new $bend.Query().equalTo("deleted", true).or(new $bend.Query().exists("enabled",true).equalTo("enabled",false)));
        $bend.User.count(query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }
      BendService.getUser = function(userId, callback) {
        $bend.User.get(userId, {
          relations:{
            avatar:"BendFile",
            photoID:"BendFile",
            photoWithID:"BendFile"
          }
        }).then(function(user){
          callback(user);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createUser = function(Data, callback){
        var userData = _.clone(Data);
        if(userData.dateOfBirth) {
          userData.dateOfBirth = userData.dateOfBirth.getTime() * 1000000;//nanosec
        }

        userData.enabled = true;
        delete userData.passwordConfirm;

        //add rendKey
        userData.randKey = Math.random();

        $bend.User.create(userData, {
          state: false
        }).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateUser = function(user, callback){
        $bend.User.update(user).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteUser = function(user, callback){
        $bend.User.get(user._id).then(function(ret){
          ret.deleted = true;
          $bend.User.update(ret).then(function(ret2){
            if(callback)
              callback(ret);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      BendService.undeleteUser = function(user, callback){
        $bend.User.get(user._id).then(function(ret){
          ret.deleted = false;
          $bend.User.update(ret).then(function(ret2){
            if(callback)
              callback(ret);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      BendService.getUserApplication = function(userId, callback) {
        $bend.User.get(userId, {
          relations:{
            snapshot:"BendFile",
            idFront:"BendFile",
            idBack:"BendFile",
            idSnapshot:"BendFile",
          }
        }).then(function(user){
          callback(user);
        }, function(err){
          console.log(err);
        })
      }

      /** User Attributes **/
      BendService.getUserAttrList = function(callback) {
        var query = new $bend.Query();
        query.ascending("position");
        query.notEqualTo("deleted", true);
        $bend.DataStore.find("userAttribute", query).then(function(userAttrs){
          callback(userAttrs);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getUserAttr = function(id, callback) {
        $bend.DataStore.get("userAttribute", id).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createUserAttr = function(Data, callback){
        //get max position
        var query = new $bend.Query();
        query.descending("position").limit(1);
        $bend.DataStore.find("userAttribute", query).then(function(userAttrs){
          var maxPos = 0;
          if(userAttrs && userAttrs.length > 0) {
            maxPos = userAttrs[0].position + 1;
          }

          Data.position = maxPos;
          $bend.DataStore.save("userAttribute", Data).then(function(ret){
            console.log(ret);
            callback(ret);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateUserAttr = function(Data, callback){
        $bend.DataStore.update("userAttribute", Data).then(function(ret){
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteUserAttr = function(Data, callback){
        $bend.DataStore.get("userAttribute", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("userAttribute", ret).then(function(ret2){
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //product types
      BendService.getProductTypeList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        $bend.DataStore.find("productType", query).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getProductType = function(id, callback) {
        $bend.DataStore.get("productType", id).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createProductType = function(Data, callback){
        $bend.DataStore.save("productType", Data).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateProductType = function(Data, callback){
        $bend.DataStore.update("productType", Data).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteProductType = function(Data, callback){
        $bend.DataStore.get("productType", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("productType", ret).then(function(ret2){
            console.log(ret2);
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      BendService.searchProductList = function(searchWords, userId, callback) {
        var query = new $bend.Query();
        query.equalTo("enabled", true);
        query.notEqualTo("deleted", true);
        query.equalTo("user._id", userId);
        query.equalTo("user._id", userId);

        query.matches("title", new RegExp('' + searchWords + '+', 'gi'));
        $bend.DataStore.find("product", query, {
          relations:{ productType: 'productType' }
        }).then(function(products){
          callback(products);
        }, function(err){
          console.log(err);
        })
      }

      //categories
      BendService.getCategoryList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        $bend.DataStore.find("category", query, {
          relations : { productType: 'productType' }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getProductTypeCategoryList = function(typeId, callback) {
        var query = new $bend.Query();
        query.equalTo("productType._id", typeId).equalTo("enabled", true);
        $bend.DataStore.find("category", query, {
          relations : { productType: 'productType' }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createCategory = function(Data, callback){
        console.log(Data.productType);
        Data.productType = CommonUtil.makeBendRef(Data.productType._id, "productType");

        $bend.DataStore.save("category", Data).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateCategory = function(Data, callback){
        $bend.DataStore.update("category", Data).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteCategory = function(Data, callback){
        $bend.DataStore.get("category", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("category", ret).then(function(ret2){
            console.log(ret2);
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //productCategory
      BendService.getProductCategoryList = function(productId, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("product._id", productId);
        $bend.DataStore.find("productCategory", query, {
          relations : {
            product: 'product',
            category: 'category'
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createProductCategory = function(product, category, callback){
        var productCategory = {
          product:CommonUtil.makeBendRef(product._id, "product"),
          category:CommonUtil.makeBendRef(category._id, "category")
        };

        $bend.DataStore.save("productCategory", productCategory).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);

          //update cache reference + 1
          $bend.DataStore.get("category", category._id).then(function(cat){
            if(!cat.numItems)
              cat.numItems = 0;
            cat.numItems++;
            $bend.DataStore.update("category", cat);
          }, function(err){})
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteProductCategories = function(productId, callback){
        var query = new $bend.Query();
        query.equalTo("product._id", productId);
        $bend.DataStore.find("productCategory", query, {
          relations : {
            category: 'category'
          }
        }).then(function(rets){
          var cats = [];
          for(var i = 0; i < rets.length ; i++) {
            cats[i] = rets[i].category;
            cats[i].numItems--;
          }

          cats.map(function(o){
            $bend.DataStore.update("category", o);
          });

          $bend.DataStore.clean("productCategory", query).then(function(ret){
            console.log(ret);
            if(callback)
              callback(ret);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      //studio
      BendService.getStudioList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        $bend.DataStore.find("studio", query, {
          relations : { owner: 'user' }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getUserStudioList = function(userId, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("owner._id", userId);
        $bend.DataStore.find("studio", query, {
          relations : { owner: 'user' }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createStudio = function(Data, callback){
        console.log(Data.productType);
        Data.owner = CommonUtil.makeBendRef(Data.owner._id,"user");

        $bend.DataStore.save("studio", Data).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateStudio = function(Data, callback){
        $bend.DataStore.update("studio", Data).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteStudio = function(Data, callback){
        $bend.DataStore.get("studio", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("studio", ret).then(function(ret2){
            console.log(ret2);
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //product
      BendService.getProductList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        $bend.DataStore.find("product", query, {
          relations : {
            user: 'user',
            studio : 'studio',
            productType: 'productType'
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getUserProductList = function(userId, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("user._id", userId);
        $bend.DataStore.find("product", query, {
          relations : {
            user: 'user',
            studio : 'studio',
            productType: 'productType',
            coverPhoto:'File'
          }
        }).then(function(rets){
          console.log(rets);
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getUserProductPage = function(userId, typeId, param) {
        var query = new $bend.Query();
        query.equalTo("user._id", userId);
        query.equalTo("productType._id", typeId);
        query.notEqualTo("deleted", true);
        query.limit(param.limit).skip(param.limit * (param.page - 1));

        return  $bend.DataStore.find("product", query, {
          relations : {
            user: 'user',
            studio : 'studio',
            productType: 'productType',
            coverPhoto:'File'
          }
        });
      }

      BendService.getUserProductPageTotalCount = function(userId, typeId, callback) {
        var query = new $bend.Query();
        query.equalTo("user._id", userId);
        query.equalTo("productType._id", typeId);
        query.notEqualTo("deleted", true);

        $bend.DataStore.count("product", query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getProduct = function(productId, callback) {
        var query = new $bend.Query();
        $bend.DataStore.get("product", productId, {
          relations : {
            user: 'user',
            studio : 'studio',
            productType: 'productType'
          }
        }).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      var setProductObjectRefs = function(product) {
        if(product.user) {
          product.user = CommonUtil.makeBendRef(product.user._id,"user");
        }

        if(product.studio) {
          product.studio = CommonUtil.makeBendRef(product.studio,"studio");
        } else
          delete product.studio;

        if(product.productType) {
          product.productType = CommonUtil.makeBendRef(product.productType, "productType");
        } else
          delete product.productType;

        if(product.coverPhoto) {
          product.coverPhoto = CommonUtil.makeBendFile(product.coverPhoto._id);
        } else
          delete product.coverPhoto;

        if(product.previewVideo) {
          product.previewVideo = CommonUtil.makeBendFile(product.previewVideo._id);
        } else
          delete product.previewVideo;

        if(product.file) {
          product.file = CommonUtil.makeBendFile(product.file._id);
        } else
          delete product.file;
      }

      BendService.createProduct = function(Data, callback){
        var product = _.clone(Data);
        setProductObjectRefs(product);

        //add rendKey
        product.randKey = Math.random();

        $bend.DataStore.save("product", product).then(function(ret){
          console.log(ret);
          callback(ret);

          //update productCount of productType
          $bend.DataStore.get("productType", product.productType._id).then(function(ret){
            if(!ret.productCount)
              ret.productCount = 0;
            ret.productCount++;
            $bend.DataStore.update("productType", ret);
          })
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateProduct = function(Data, callback){
        var product = _.clone(Data);
        setProductObjectRefs(product);
        $bend.DataStore.update("product", product).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteProduct = function(Data, callback){
        var query = new $bend.Query();

        $bend.DataStore.get("product", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("product", ret).then(function(ret2){
            console.log(ret2);
            if(callback)
              callback(ret2);

            //update productCount of productType
            $bend.DataStore.get("productType", ret.productType._id).then(function(ret){
              if(!ret.productCount)
                ret.productCount = 0;
              ret.productCount = Math.max(ret.productCount--, 0);
              $bend.DataStore.update("productType", ret);
            })
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //tags
      BendService.getTagList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("enabled", true);
        $bend.DataStore.find("tag", query).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createTag = function(Data, callback){
       $bend.DataStore.save("tag", Data).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateTag = function(Data, callback){
        $bend.DataStore.update("tag", Data).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteTag = function(Data, callback){
        $bend.DataStore.get("tag", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("tag", ret).then(function(ret2){
            console.log(ret2);
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //productTag
      BendService.getProductTagList = function(productId, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("product._id", productId);
        $bend.DataStore.find("productTag", query, {
          relations : {
            product: 'product',
            tag: 'tag'
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createProductTag = function(product, tag, callback){
        var productTag = {
          product:CommonUtil.makeBendRef(product._id, "product"),
          tag:CommonUtil.makeBendRef(tag._id, "tag")
        };

        $bend.DataStore.save("productTag", productTag).then(function(ret){
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteProductTags = function(productId, callback){
        var query = new $bend.Query();
        query.equalTo("product._id", productId);
        $bend.DataStore.clean("productTag", query).then(function(ret){
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      //product collaborator
      BendService.getProductCollaboratorList = function(productId, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("product._id", productId);
        console.log("getProductCollaboratorList");
        $bend.DataStore.find("productCollaborator", query, {
          relations : {
            product: 'product',
            user: 'user',
            collaborator: 'collaborator'
          }
        }).then(function(rets){
          console.log("getProductCollaboratorList", rets)
          var userIds = [];
          rets.map(function(o){
            userIds.push(o.collaborator.collaborator._id);
          })

          query = new $bend.Query();
          query.contains("_id", userIds);
          $bend.User.find(query).then(function(rets){
            rets.map(function(o){
              o.fullName = o.firstName + " " + o.lastName;
            })
            callback(rets);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      BendService.createProductCollaborator = function(product, user, collaborator, callback){
        //check if collaborator exists
        BendService.getCollaborator(product, user, collaborator, function(ret){
          var collaboratorObj = ret;
          var productCollaboratorData = {
            user: CommonUtil.makeBendRef(user._id,"user"),
            collaborator: CommonUtil.makeBendRef(collaboratorObj._id,"collaborator"),
            product: CommonUtil.makeBendRef(product._id, "product")
          };
          $bend.DataStore.save("productCollaborator", productCollaboratorData).then(function(ret){
            console.log(ret);
            if(callback)
              callback(ret);
          }, function(err){
            console.log(err);
          })
        })
      }

      BendService.getCollaborator = function(product, user, collaborator, callback) {
        var collaboratorObj;
        var query = new $bend.Query().equalTo("user._id", user._id).equalTo("collaborator._id", collaborator._id);
        $bend.DataStore.find("collaborator", query).then(function(rets){
          if(rets && rets.length > 0) {
            collaboratorObj = rets[0]
            callback(collaboratorObj);
          } else {
            //need to create new collaborator
            var collaboratorData = {
              user: CommonUtil.makeBendRef(user._id,"user"),
              collaborator:CommonUtil.makeBendRef(collaborator._id,"user"),
              status:"accepted",
              enabled:true
            };

            $bend.DataStore.save("collaborator", collaboratorData).then(function(ret){
              collaboratorObj = ret;
              callback(collaboratorObj);
            }, function(err){
              console.log(err);
            })
          }
        }, function(err){
          console.log(err);
        });
      }

      BendService.deleteProductCollaborator = function(productId, callback){
        var query = new $bend.Query();
        query.equalTo("product._id", productId);
        $bend.DataStore.clean("productCollaborator", query).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      //userLinks
      BendService.getUserLinkList = function(userId, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("user._id", userId);
        $bend.DataStore.find("userLink", query, {
          relations : {
            user: 'user'
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createUserLink = function(user, title, url, callback){
        var userLinkData = {
          user:CommonUtil.makeBendRef(user._id,"user"),
          title:title,
          url:url
        };

        $bend.DataStore.save("userLink", userLinkData).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteUserLinks = function(userId, callback){
        var query = new $bend.Query();
        query.equalTo("user._id", userId);
        $bend.DataStore.clean("userLink", query).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      //broadcast
      BendService.getBroadcastList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.exists("startTime", true);
        $bend.DataStore.find("broadcast", query, {
          relations : {
            user: 'user',
            studio:'studio'
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getRecent10BroadcastList = function(userId, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.equalTo("user._id", userId);
        query.exists("startTime", true);
        query.descending("startTime");
        query.limit(10);
        $bend.DataStore.find("broadcast", query, {
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.searchBroadcastPage = function(param) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.exists("startTime", true);
        if(param.selectedBroadcastType == 1) {
          query.exists("endTime", false);
        }
        query.descending("startTime");
        query.limit(param.limit).skip(param.limit * (param.page - 1))

        return $bend.DataStore.find("broadcast", query, {
          relations : {
            user: 'user',
            studio:'studio'
          }
        })
      }

      BendService.getBroadcastPageTotalCount = function(param, callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        query.exists("startTime", true);
        if(param.selectedBroadcastType == 1) {
          query.exists("endTime", false);
        }

        $bend.DataStore.count("broadcast", query).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getBroadcast = function(id, callback) {
        $bend.DataStore.get("broadcast", id, {
          relations : {
            user: 'user',
            studio:'studio'
          }
        }).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createBroadcast = function(broadcastData, callback){
        BendService.getUserAttrList(function(results){
          var search = {};
          search["username"] = broadcastData.user["username"];
          if(broadcastData.user["dateOfBirth"]) {
            search["dateOfBirth"] = broadcastData.user["dateOfBirth"];
          }

          _.map(results, function(attr){
            if(attr.searchable){
              if(broadcastData.user[attr.name]) {
                search[attr.name] =  broadcastData.user[attr.name];
              }
            }
          })
          broadcastData.user = CommonUtil.makeBendRef(broadcastData.user._id, "user");
          broadcastData.search = search;

          $bend.DataStore.save("broadcast", broadcastData).then(function(ret){
            console.log(ret);
            if(callback)
              callback(ret);
          }, function(err){
            console.log(err);
          })
        })
      }

      BendService.updateBroadcast = function(broadcastData, callback){
        BendService.getUserAttrList(function(results){
          var search = {};
          search["username"] = broadcastData.user["username"];
          if(broadcastData.user["dateOfBirth"]) {
            search["dateOfBirth"] = broadcastData.user["dateOfBirth"];
          }
          _.map(results, function(attr){
            if(attr.searchable){
              console.log("searchable attr", attr, broadcastData.user[attr.name]);
              if(broadcastData.user[attr.name]) {
                search[attr.name] =  broadcastData.user[attr.name];
              }
            }
          })
          broadcastData.search = search;
          broadcastData.user = CommonUtil.makeBendRef(broadcastData.user._id,"user");

          console.log('broadcastData', broadcastData);
          $bend.DataStore.update("broadcast", broadcastData).then(function(ret){
            console.log(ret);
            if(callback)
              callback(ret);
          }, function(err){
            console.log(err);
          })
        })
      }

      BendService.deleteBroadcast = function(id, callback){
        var query = new $bend.Query();

        $bend.DataStore.get("broadcast", id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("broadcast", ret).then(function(ret2){
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //ProductAttachments
      BendService.getProductAttachmentList = function(productId, callback) {
        var query = new $bend.Query();
        query.equalTo("product._id", productId);
        $bend.DataStore.find("productAttachment", query, {
          relations : {
            product: 'product',
            file:'BendFile'
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createProductAttachment = function(product, file, position, callback){
        var productData = {
          product:CommonUtil.makeBendRef(product._id, "product"),
          file:CommonUtil.makeBendFile(file._id),
          position:position
        };

        $bend.DataStore.save("productAttachment", productData).then(function(ret){
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteProductAttachments = function(productId, callback){
        var query = new $bend.Query();
        query.equalTo("product._id", productId);
        $bend.DataStore.clean("productAttachment", query).then(function(ret){
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }


      //insert some initial data
      BendService.createGeography = function() {
        eachSeries(CommonUtil.AllCountries, function(o){
          var data = {
            name: o.name,
            type:"country"
          };

          return $bend.DataStore.save("geography", data);
        }).then(function(){
          console.log("country data imported");
        })

        eachSeries(CommonUtil.AllStates, function(o){
          var data = {
            name:o,
            type:"us-state"
          };

          return $bend.DataStore.save("geography", data);
        }).then(function(){
          console.log("states data imported");
        })

        eachSeries(CommonUtil.CAProvinces, function(o){
          var data = {
            name:o,
            type:"ca-province"
          };

          return $bend.DataStore.save("geography", data);
        }).then(function(){
          console.log("provinces data imported");
        })
      }

      BendService.getGeographyList = function(type, callback) {
        var query = new $bend.Query();
        query.equalTo("type", type);
        $bend.DataStore.find("geography", query).then(function(rets) {
          if(callback)
            callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      //restriction
      BendService.getRestrictionList = function(userId, type, callback) {
        var query = new $bend.Query();
        query.equalTo("user._id", userId);
        $bend.DataStore.find("restriction", query, {
          relations : {
            geography: 'geography'
          }
        }).then(function(rets) {
          callback(_.filter(rets, function(o){
            return o.geography.type == type;
          }));
        }, function(err){
          console.log(err);
        })
      }

      BendService.addRestriction = function(userId, data, callback) {
        var newData = {
          user:CommonUtil.makeBendRef(userId, "user"),
          geography:CommonUtil.makeBendRef(data._id, "geography")
        }

        $bend.DataStore.save("restriction", newData).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteRestriction = function(id, callback) {
        $bend.DataStore.destroy("restriction", id).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      //userConfig
      BendService.getUserConfig = function(userId, callback) {
        var query = new $bend.Query();
        query.equalTo("user._id", userId);

        $bend.DataStore.find("userConfig", query).then(function(ret){
          if(ret)
            callback(ret[0]);
          else
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.saveUserConfig = function(userConfig, callback) {
        userConfig.user = CommonUtil.makeBendRef(userConfig.user._id, "user");

        $bend.DataStore.save("userConfig", userConfig).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      //userFinancialInfo
      BendService.getUserFinancial = function(userId, callback) {
        var query = new $bend.Query();
        query.equalTo("user._id", userId);

        $bend.DataStore.find("userFinancialInfo", query, {
          relations : {
            taxpayerForm:'BendFile'
          }
        }).then(function(ret){
          if(ret)
            callback(ret[0]);
          else
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.saveUserFinancial = function(data, callback) {
        data.user = CommonUtil.makeBendRef(data.user._id, "user");

        if(data.taxpayerForm) {
          data.taxpayerForm = CommonUtil.makeBendFile(data.taxpayerForm._file._id);
        }

        $bend.DataStore.save("userFinancialInfo", data).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      //Note
      BendService.createNote = function(userId, noteText, callback) {
        var data = {
          user:CommonUtil.makeBendRef(userId, "user"),
          note:noteText,
          by:CommonUtil.makeBendRef($bend.getActiveUser()._id,"user")
        }

        $bend.DataStore.save("userNote", data).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getNoteList = function(userId, lastCheckTime, limit, callback) {
        var query = new $bend.Query();
        query.equalTo("user._id", userId);
        query.descending("_bmd.createdAt");
        if(lastCheckTime > 0)
          query.lessThan("_bmd.createdAt", lastCheckTime);
        query.limit(limit + 1);

        $bend.DataStore.find("userNote", query, {
          relations: {
            by: "user"
          }
        }).then(function(rets){
          var fileIds = [];
          if(rets) {
            rets.map(function(o) {
              if(o.by.avatar)
                fileIds.push(o.by.avatar._id);
            })

            query = new $bend.Query();
            query.contains("_id", fileIds);
            $bend.File.find(query).then(function(files){
              if(files) {
                for(var i = 0 ; i < files.length ; i++) {
                  var _notes = _.filter(rets, function(o){
                    if(!o.by.avatar)
                      return false;
                    return o.by.avatar._id ==files[i]._id;
                  })
                  _notes.map(function(_o){
                    _o.by.avatar = files[i];
                  })
                }
              }
            });
          }
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      //alert type
      BendService.getAlertTypeList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        $bend.DataStore.find("alertType", query).then(function(rets){
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createAlertType = function(Data, callback){
        $bend.DataStore.save("alertType", Data).then(function(ret){
          console.log(ret);
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateAlertType = function(Data, callback){
        $bend.DataStore.update("alertType", Data).then(function(ret){
          console.log(ret);
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteAlertType = function(Data, callback){
        $bend.DataStore.get("alertType", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("alertType", ret).then(function(ret2){
            console.log(ret2);
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //alert
      BendService.getAlertList = function(callback) {
        var query = new $bend.Query();
        query.notEqualTo("deleted", true);
        $bend.DataStore.find("alert", query, {
          relations:{
            user:"user",
            type:"alertType",
            refUser:"user",
            refBroadcast:"broadcast"
          }
        }).then(function(rets){
          var fileIds = [];
          if(rets) {
            rets.map(function(o) {
              if(o.user.avatar)
                fileIds.push(o.user.avatar._id);
            })

            query = new $bend.Query();
            query.contains("_id", fileIds);
            $bend.File.find(query).then(function(files){
              if(files) {
                for(var i = 0 ; i < files.length ; i++) {
                  var avatars = _.filter(rets, function(o){
                    if(!o.user.avatar)
                      return false;
                    return o.user.avatar._id ==files[i]._id;
                  })
                  avatars.map(function(_o){
                    _o.user.avatar = files[i];
                  })
                }
              }
            });
          }
          callback(rets);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createAlert = function(Data, callback){
        var newData = _.clone(Data);

        newData.user = CommonUtil.makeBendRef(Data.user._id, "user");
        if(Data.refUser)
          newData.refUser = CommonUtil.makeBendRef(Data.refUser._id, "user");
        if(Data.refBroadcast)
          newData.refBroadcast = CommonUtil.makeBendRef(Data.refBroadcast._id, "broadcast");
        if(Data.type) {
          newData.type = CommonUtil.makeBendRef(Data.type._id,"alertType");
        }

        $bend.DataStore.save("alert", newData).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.updateAlert = function(Data, callback){
        var newData = _.clone(Data);
        newData.user = CommonUtil.makeBendRef(Data.user._id, "user");
        if(Data.refUser)
          newData.refUser = CommonUtil.makeBendRef(Data.refUser._id, "user");
        if(Data.refBroadcast)
          newData.refBroadcast = CommonUtil.makeBendRef(Data.refBroadcast._id, "broadcast");
        if(Data.type) {
          newData.type = CommonUtil.makeBendRef(Data.type._id,"alertType");
        }

        $bend.DataStore.update("alert", newData).then(function(ret){
          if(callback)
            callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteAlert = function(Data, callback){
        $bend.DataStore.get("alert", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("alert", ret).then(function(ret2){
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      //Tile
      BendService.getTileList = function(userId, callback) {
        async.parallel([
          function(callback2){
            var query = new $bend.Query();
            query.notEqualTo("deleted", true);
            query.equalTo("user._id", userId);
            query.equalTo("type", "product");

            $bend.DataStore.find("tile", query, {
              relations:{
                user:"user",
              },
              public: true
            }).then(function(rets){
              async.map(rets, function(o, _callback){
                async.parallel([
                 function(callback3) {
                   if(o.object) {
                     $bend.DataStore.get("product", o.object._id, {
                       relations : {
                         coverPhoto:"BendFile",
                         previewVideo:"BendFile",
                         productType:"productType",
                       }
                     }).then(function(ret){
                       //o.object = ret;
                       callback3(null, ret);
                     }, function(err){
                       console.log(err);
                       callback3(err, null);
                     })
                   } else {
                     callback3(null, null);
                   }
                 },
                  function(callback3) {
                    if(o.object) {
                      BendService.getProductTagList(o.object._id, function(rets){
                        callback3(null, rets);
                      });
                    } else {
                      callback3(null, []);
                    }
                  }
                ], function(e, result){
                  o.object = result[0];
                  o.tags = result[1];
                  _callback(null, o);
                });
              }, function(err, results){
                callback2(null, results);
              })
            }, function(err){
              console.log(err);
            })
          },
          function(callback2){
            var query = new $bend.Query();
            query.notEqualTo("deleted", true);
            query.equalTo("user._id", userId);
            query.contains("type", ["image", "text"]);

            $bend.DataStore.find("tile", query, {
            relations:{
              user:"user",
              object:"BendFile",
            },
            public: true
          }).then(function(rets){
              callback2(null, rets);
          }, function(err){
            console.log(err);
          })}
        ], function(error,result){
          var results = [];
          result.map(function(o) {
            results = results.concat(o);
          })
          callback(results);
        });
      }

      BendService.getProductInfoForTile = function(productId, callback) {
        async.parallel([
          function(callback3) {
            $bend.DataStore.get("product", productId, {
              relations : {
                coverPhoto:"BendFile",
                previewVideo:"BendFile",
                productType:"productType",
              }
            }).then(function(ret){
              //o.object = ret;
              callback3(null, ret);
            }, function(err){
              console.log(err);
              callback3(err, null);
            })
          },
          function(callback3) {
            BendService.getProductTagList(productId, function(rets){
              callback3(null, rets);
            });
          }
        ], function(e, result){
          callback(result[0], result[1]);
        });
      }

      BendService.createTile = function(Data, callback){
        var newData = _.clone(Data);

        newData.user = CommonUtil.makeBendRef(Data.user._id, "user");

        if(newData.object) {
          if(newData.type == 'product') {
            newData.object = CommonUtil.makeBendRef(Data.object._id, "product");
          } else {
            newData.object = CommonUtil.makeBendFile(Data.object._id);
          }
        }

        $bend.DataStore.save("tile", newData).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.deleteTile = function(Data, callback){
        $bend.DataStore.get("tile", Data._id).then(function(ret){
          ret.deleted = true;
          $bend.DataStore.update("tile", ret).then(function(ret2){
            if(callback)
              callback(ret2);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        });
      }

      BendService.updateTile = function(Data, callback){
        var newData = _.clone(Data);
        delete newData.$$hashKey;
        newData.user = CommonUtil.makeBendRef(Data.user._id,"user");

        if(newData.object) {
          if(newData.type == 'product') {
            newData.object = CommonUtil.makeBendRef(Data.object._id, "product");
          } else {
            newData.object = CommonUtil.makeBendFile(Data.object._id);
          }
        }
        $bend.DataStore.update("tile", newData).then(function(ret2){
          console.log(ret2);
          if(callback)
            callback(ret2);
        }, function(err){
          console.log(err);
        })
      }

      //conversation, message
      BendService.getUserConversationList = function(userId, callback) {
        var query = new $bend.Query();
        query.and((new $bend.Query().equalTo("user1._id", userId)).or(new $bend.Query().equalTo("user2._id", userId)));
        query.descending("_bmd.updatedAt");
        $bend.DataStore.find("conversation", query, {
          relations : {
            user1: 'user',
            user2: 'user',
            lastMessage:"message"
          }
        }).then(function(rets){
          var userObjList = [];
          var fileIds = [];
          rets.map(function(o) {
            if(o.user1._id == userId) {
              if(o.user2.avatar) {
                fileIds.push(o.user2.avatar._id);
                userObjList[o.user2.avatar._id] = o.user2;
              }
            }
            else {
              if(o.user1.avatar) {
                fileIds.push(o.user1.avatar._id);
                userObjList[o.user1.avatar._id] = o.user1;
              }
            }
          });

          query = new $bend.Query();
          query.contains("_id", fileIds);
          $bend.File.find(query).then(function(files){
            if(files) {
              for(var i = 0 ; i < files.length ; i++) {
                userObjList[files[i]._id].avatar = files[i];
              }
            }

            callback(rets);
          });
        }, function(err){
          console.log(err);
        })
      }

      BendService.getUnreadConversationCount = function(userId, callback) {
        var query = new $bend.Query();
        query.and((new $bend.Query().equalTo("user1._id", userId).equalTo("read1", false)).or(new $bend.Query().equalTo("user2._id", userId).equalTo("read2", false)));
        $bend.DataStore.count("conversation", query).then(function(cnt){
          callback(cnt);
        }, function(err){
          console.log(err);
        })
      }

      BendService.getConversationMessage = function(conversation, skip, limit, callback) {
        var query = new $bend.Query();
        query.equalTo("conversation._id", conversation._id);
        query.descending("_bmd.createdAt");
        query.skip(skip);
        query.limit(limit); //only fetch recent 10 messages

        $bend.DataStore.find("message", query, {
          relations:{
            sender:"user"
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){console.log(err);})
      }

      BendService.getNewMessage = function(conversation, lastTime, callback) {
        var query = new $bend.Query();
        query.equalTo("conversation._id", conversation._id);
        query.greaterThan("_bmd.createdAt", lastTime);
        query.ascending("_bmd.createdAt");

        $bend.DataStore.find("message", query, {
          relations:{
            sender:"user"
          }
        }).then(function(rets){
          callback(rets);
        }, function(err){console.log(err);})
      }

      BendService.createConversation = function(myId, user1, user2, callback){
        //check if exists
        var query = (new $bend.Query().equalTo("user1._id", user1._id).equalTo("user2._id", user2._id)).or
          (new $bend.Query().equalTo("user1._id", user2._id).equalTo("user2._id", user1._id));

        $bend.DataStore.find("conversation", query).then(function(rets){
          if(rets && rets[0]) {
            //exist already
            console.log("find conversation");
            callback(rets[0]);
          } else {
            //create new one
            var Data = {
              user1:CommonUtil.makeBendRef(user1._id, "user"),
              user2:CommonUtil.makeBendRef(user2._id, "user"),
              read1:user1._id==myId?true:false,
              read2:user2._id==myId?true:false
            };

            $bend.DataStore.save("conversation", Data).then(function(ret){
              callback(ret);
            }, function(err){
              console.log(err);
            })
          }
        }, function(err){
          console.log(err);
        })
      }

      BendService.setConversationAsRead = function(conversation, callback){
        var Data = {
          _id:conversation._id,
          user1:CommonUtil.makeBendRef(conversation.user1._id, "user"),
          user2:CommonUtil.makeBendRef(conversation.user2._id, "user"),
          read1:true,
          read2:true,
          lastMessage:CommonUtil.makeBendRef(conversation.lastMessage._id,"message")
        };

        $bend.DataStore.update("conversation", Data).then(function(ret){
          callback(ret);
        }, function(err){
          console.log(err);
        })
      }

      BendService.createMessage = function(conversation, sender, messageData, callback){
        //create message
        var data = {
          conversation:CommonUtil.makeBendRef(conversation._id, "conversation"),
          sender:CommonUtil.makeBendRef(sender._id, "user"),
          message:messageData.message
        }

        $bend.DataStore.save("message", data).then(function(ret){
          //update conversation
          data = {
            _id:conversation._id,
            user1:CommonUtil.makeBendRef(conversation.user1._id, "user"),
            user2:CommonUtil.makeBendRef(conversation.user2._id, "user"),
            read1:sender._id==conversation.user1._id?true:false,
            read2:sender._id==conversation.user2._id?true:false,
            lastMessage:CommonUtil.makeBendRef(ret._id, "message")
          };
          $bend.DataStore.save("conversation", data).then(function(ret2){
            if(callback)
              callback(ret);
          }, function(err){
            console.log(err);
          })
        }, function(err){
          console.log(err);
        })
      }

      return BendService;
    }
  ]);
