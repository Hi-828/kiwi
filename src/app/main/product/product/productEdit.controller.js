(function ()
{
  'use strict';

  angular
    .module('app.product.product')
    .controller('ProductEditController', ProductEditController);

  /** @ngInject */
  function ProductEditController($scope, $stateParams, BendAuth, BendService, CommonUtil, $mdMedia, $mdDialog, $rootScope, $location, DashboardData, $sce, $mdToast)
  {
    BendAuth.checkAuth();

    // Data
    //create mode - /products/create?user=USER_ID&type=PRODUCT_TYPE
    console.log("$stateParams", $stateParams, $location.search());
    var userIdParam =  $location.search().user;
    var productTypeParam =  $location.search().type;
    var productId = $stateParams.id;
    var tabIdx = $location.search().tabIdx;

    $scope.createMode = true;
    if(productId)
      $scope.createMode = false;

    //check param
    if(!userIdParam || !productTypeParam) {
      $location.path("/");
      return;
    }

    $scope.user;
    $scope.productType;
    $scope.categories = [];
    $scope.productCategories = [];
    $scope.tags = [];
    $scope.productTags = [];
    $scope.searchUsers = [];
    $scope.collaborators = [];
    $scope.product = {};
    $scope.isUploading = [];
    $scope.dashboardData = DashboardData;
    $scope.CommonUtil = CommonUtil;
    $scope.isUpdatePage = true;
    $scope.attachments = [];
    $scope.filesToRemove = [];
    var changeCount = 1;

    async.parallel([
      function(callback){
        BendService.getUser(userIdParam, function(ret) {
          $scope.user = ret;
          callback(null, true);
        });
      },
      function(callback){
        BendService.getProductType(productTypeParam, function(ret){
          $scope.productType = ret;
          callback(null, true);
        });
      },
      function(callback) {
        if(productId) {
          BendService.getProduct(productId, function(ret){
            $scope.product = ret;
            if($scope.product.productType)
              $scope.product.productType = $scope.product.productType._id;
            if($scope.product.studio)
              $scope.product.studio = $scope.product.studio._id;

            if($scope.product.coverPhoto) {
              BendService.getFile($scope.product.coverPhoto, function(ret){
                $scope.product.coverPhoto = ret;
              })
            }
            if($scope.product.previewVideo) {
              BendService.getFile($scope.product.previewVideo, function(ret){
                $scope.product.previewVideo = ret;
                document.getElementById("previewVideo").src = ret._downloadURL;
              })
            }

            callback(null, true);
          })
        } else
          callback(null, true);
      },
      function(callback) {
        if(productId) {
          BendService.getProductAttachmentList(productId, function(rets){
            rets.map(function(o){
              o.file = o.file._file;
            })
            $scope.attachments = rets;
            callback(null, true);
          });
        } else
          callback(null, true);
      },
      function(callback) {
        if(productId) {
          BendService.getProductCollaboratorList(productId, function(rets){
            $scope.collaborators = rets;
            console.log($scope.collaborators);
            callback(null, true);
          });
        } else
          callback(null, true);
      },
      function(callback) {
        BendService.getProductTypeCategoryList(productTypeParam, function(ret){
          $scope.categories = ret;

          if(productId) {
            BendService.getProductCategoryList(productId, function(rets){
              rets.map(function(o){
                $scope.productCategories.push(_.find($scope.categories, function(o2){
                  return o2._id == o.category._id;
                }));
              })

              if(rets.length > 0)
                changeCount++;

              callback(null, true);
            });
          } else
            callback(null, true);
        })
      },
      function(callback) {
        BendService.getTagList(function(rets){
          $scope.tags = _.sortBy(rets, function(o){
            return o.name.toLowerCase();
          });

          if(productId) {
            BendService.getProductTagList(productId, function(rets){
              rets.map(function(o){
                $scope.productTags.push(_.find($scope.tags, function(o2){
                  return o2._id == o.tag._id;
                }));
              })
              callback(null, true);
            });
          } else {
            callback(null, true);
          }
        })
      }
    ], function(err, result){
      if($scope.createMode) {
        $scope.product = {
          enabled:true,
          title:"",
          subtitle:"",
          description:"",
          numViews:0,
          numLikes:0,
          numDownloads:0,
          avgRating:0,
          collaboration:false,
          tokenCost:0,
          downloadable:true,
          user:$scope.user,
          productType:$scope.productType._id
        };
      }

      $scope.maxAttachments = $scope.productType.maxAttachments;
      $scope.allowedTypes = $scope.productType.allowedTypes;

      $scope.isUpdatePage = false;
    })

    $scope.$watchCollection("productCategories", function(){
      changeCount--;
      if(changeCount < 0)
        $scope.inputForm.$setDirty();
    })

    $scope.update = function() {
      if(!$scope.createMode) {
        $scope.isUpdatePage = true;
        BendService.updateProduct($scope.product, function(product){
          BendService.deleteProductCategories(product._id, function(ret){
            BendService.deleteProductTags(product._id, function(ret){
              BendService.deleteProductCollaborator(product._id, function(ret){
                $scope.progressCount = $scope.productCategories.length + $scope.productTags.length + $scope.collaborators.length + $scope.attachments.length + 1;
                $scope.productCategories.map(function(o){
                  BendService.createProductCategory(product, o, function(){$scope.progressCount--;});
                });
                $scope.productTags.map(function(o){
                  BendService.createProductTag(product, o, function(){$scope.progressCount--;});
                });
                $scope.collaborators.map(function(o){
                  BendService.createProductCollaborator(product, $scope.user, o, function(){$scope.progressCount--;});
                });

                BendService.deleteProductAttachments(productId, function(ret){
                  $scope.progressCount--;
                  $scope.attachments.map(function(o){
                    BendService.createProductAttachment(product, o.file, o.position, function(){$scope.progressCount--;});
                  });
                });

                $scope.$watch("progressCount", function(newVal, oldVal){
                  if($scope.progressCount == 0) {
                    $scope.isUpdatePage = false;
                    /*$mdDialog.show(
                      $mdDialog.alert()
                        .parent(angular.element(document.querySelector('#product-detail-page')))
                        .clickOutsideToClose(true)
                        .parent(angular.element(document.body))
                        .title('Successfully saved')
                        .ok('OK')
                        .targetEvent($scope.$event)
                    );*/
                    $mdToast.show(
                      $mdToast.simple()
                        .textContent('Successfully saved')
                        .position("top right")
                        .hideDelay(2000)
                    );

                    $scope.inputForm.$setPristine();
                  }
                })
                //$location.path("/users/" + $scope.user._id + "/edit");
              });
            });
          });
        });
      }
    };

    $scope.save = function() {
      console.log($scope.product);
      $scope.isUpdatePage = true;
      BendService.createProduct($scope.product, function(product){
        //save product categories
        $scope.productCategories.map(function(o){
          BendService.createProductCategory(product, o);
        });
        //save product tags
        $scope.productTags.map(function(o){
          BendService.createProductTag(product, o);
        });
        //save collaborator
        $scope.collaborators.map(function(o){
          BendService.createProductCollaborator(product, $scope.user, o);
        });

        //save attachements
        $scope.attachments.map(function(o){
          BendService.createProductAttachment(product, o.file, o.position);
        });

        var url = "/users/" + $scope.user._id + "/product/" + $scope.productType._id;
        $location.url(url);
      });
    };

    $scope.delete = function() {
      var confirm = $mdDialog.confirm()
        .title('Would you like to delete this product?')
        /*.textContent('You cannot recover deleted data.')*/
        /* .ariaLabel('Lucky day')*/
        .targetEvent($scope.$event)
        .clickOutsideToClose(true)
        .parent(angular.element(document.body))
        .ok('OK')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        $scope.isUpdatePage = true;
        BendService.deleteProduct($scope.product, function(user){
          var url = "/users/" + $scope.user._id + "/product/" + $scope.productType._id;
          $location.url(url);
        });
      }, function() {});
    };

    $scope.cancel = function() {
      $location.path("/users/" + $scope.user._id + "/edit");
    }

    $scope.showFileLoading = function(tag, bShow) {
      $scope.isUploading[tag] = bShow;
    }

    $scope.fileProgress = [];
    $scope.onFileUpload = function (files, tag) {
      //console.log(files)
      var file = files[0];

      $scope.fileProgress[tag] = 0;
      $scope.showFileLoading(tag, true);
      BendService.upload(file,function(error,uploadedFile){
        console.log("uploadedFile", uploadedFile);
        if(error) {
          $scope.showFileLoading(tag, false);
          return;
        }

        console.log(uploadedFile);

        applyChangesOnScope($scope, function(){
          if(tag == 'coverPhoto') {
            $scope.product.coverPhoto = uploadedFile;
            BendService.getFile(uploadedFile, function(ret){
              $scope.product.coverPhoto = ret;
              $scope.showFileLoading(tag, false);
            })
          } else if(tag == 'previewVideo') {
            $scope.product.previewVideo = uploadedFile;
            document.getElementById("previewVideo").src = uploadedFile._downloadURL;
            $scope.showFileLoading(tag, false);
          } else if(tag == 'file') {
            $scope.product.file = uploadedFile;
            document.getElementById("product_file").src = uploadedFile._downloadURL;
            $scope.showFileLoading(tag, false);
          }
          $scope.inputForm.$setDirty();
        })
      },{
        _workflow: isPhoto(file)?'photo':tag
      }, function (total, prog){
        applyChangesOnScope($scope, function(){
          $scope.fileProgress[tag] = prog * 100 / total;
        })
      });
    };

    $scope.deleteFile = function(tag){
      applyChangesOnScope($scope, function(){
        if(tag=='coverPhoto')
          delete $scope.product.coverPhoto;
        else if(tag=='previewVideo')
          delete $scope.product.previewVideo;
        else if(tag=='file')
          delete $scope.product.file;
        $scope.inputForm.$setDirty();
      })
    }

    $scope.changeCategory = function() {
      $scope.inputForm.$setDirty();
    }

    $scope.openFile = function(fileName) {
      $("input[name='" + fileName + "']").click();
    }

    var searchKeyHandler = false;
    var tagKeyHandler = false;
    var oldSearchKey = "";
    $scope.searchTextFocus = function(fileName) {
      //console.log($scope.inputForm.productCategories);
      $("input[name='" + fileName + "']").focus();

      if(fileName == "collaborators" && !searchKeyHandler) {
        searchKeyHandler = true;
        $("input[name='" + fileName + "']").keyup(function(){
          var searchKey = this.value;
          if(searchKey == "") {
            oldSearchKey = "";
            applyChangesOnScope($scope, function(){
              $scope.searchUsers = [];
            });
            return;
          }

          setTimeout(function(oldText, obj){
            if(oldText == obj.value && oldSearchKey != searchKey) {
              oldSearchKey = searchKey;
              $scope.fetchUserList();
            }
          }, 200, searchKey, this);
        })
      } else if(fileName == "productTags" && !tagKeyHandler) {
        tagKeyHandler = true;
        $("input[name='" + fileName + "']").keyup(function(){
          var tagKey = this.value;
          if(tagKey=="")
            return;

          if(tagKey[tagKey.length-1] == ",") {
            console.log("createNewTag", tagKey)
            $scope.createNewTag(tagKey);
          }
        })
      }
    }

    $scope.createNewTag = function(inputParam) {
      $scope.searchUsers = [];

      var inputText;
      if(!inputParam)
        inputText = $scope.inputForm.productTags.$viewValue;
      else
        inputText = inputParam;

      if(inputText == "")
        return;

      if(inputText[inputText.length-1] == ",") {
        inputText = inputText.substring(0, inputText.length-1);
        if(inputText == "") return;
      }

      var obj = _.find($scope.productTags, function(o){
        return o.name.toLowerCase() == inputText.toLowerCase();
      })
      if(obj) {$("input[name='productTags']").val("");return};

      var obj = _.find($scope.tags, function(o){
        return o.name.toLowerCase() == inputText.toLowerCase();
      })

      if(obj) {
        $scope.productTags.push(obj);
        $("input[name='productTags']").val("");
      } else {
        //create New Tag
        BendService.createTag({
          name:inputText, enabled:true, numItems:0
        }, function(ret){
          var newTag = ret;
          $scope.productTags.push(newTag);
          $scope.tags.push(newTag);

          $("input[name='productTags']").val("");
        })
      }
    }

    $scope.fetchUserList = function() {
      $scope.searchUsers = [];
      var inputText = $scope.inputForm.collaborators.$viewValue;
      if(inputText == "")
        return;

      BendService.searchUserList(inputText, function(rets){
        //except me
        $scope.searchUsers = _.filter(rets, function(o){
          return o._id != $scope.user._id;
        });
      });
    }

    var FileStatus = {
      Existing: "existing",
      CreatingBlob: "creatingBlob",
      UploadStart: "uploadStart",
      UploadProgress: "uploadProgress",
      UploadSemiComplete: "uploadSemiComplete",
      UploadComplete: "uploadComplete",
      ProcessingComplete: "processingComplete",
      UploadErrored: "uploadErrored"
    };

    $scope.isShowAttachement = function() {
      return $scope.attachments.length > 0;
    }

    $scope.attachmentSortableOptions = {
      start: function (e, ui) {},
      update: function (e, ui) {},
      stop: function (e, ui) {
        for (var i in $scope.attachments){
          $scope.attachments[i].position=i;
        }
      }
    };

    $scope.getFilePreview = function(fileObj) {
      var _file = fileObj.file;
      var renderHTML = "";
      if(_file) {
        if (_file.mimeType.match(/image.*/)){
          renderHTML = "<img src='" + CommonUtil.getSmallImage(_file) + "'>"
        } else if(_file.mimeType.match(/video.*/)) {
          renderHTML = "<video controls><source src='" + _file._downloadURL + "' type='video/mp4'></video>"
        } else
          renderHTML = "<span>" + _file._filename + "</span>"
      } else {
        renderHTML = "<span>" + fileObj.name + "</span>"
      }

      return $sce.trustAsHtml(renderHTML);
    }
    $scope.removeAttachment = function(fileObj) {
      $scope.attachments = _.without($scope.attachments,fileObj);
      $scope.filesToRemove.push(fileObj);
      $scope.inputForm.$setDirty();
    }

    function checkFileType(type, name) {
      return CommonUtil.checkFileType($scope.allowedTypes, type, name);
    }

    $scope.isAttachmentUploading = function(fileObj) {
      return fileObj.isLoading;
    }

    var MAX_UPLOAD_COUNT = 4;
    var uploadJobCount = 0;
    var waitJobList = [];
    $scope.onFilesDropped = function(droppedFiles,section) {
      //console.log(droppedFiles, section)
      if(section == "coverPhoto" || section == "previewVideo") {
        $scope.onFileUpload(droppedFiles, section);
      } else if(section == "attachment") {
        var newFiles = [];
        var remainCount = $scope.maxAttachments -  $scope.attachments.length;
        if(remainCount <= 0) return;
        _.map(droppedFiles,function(file) {
          if(checkFileType(file.type, file.name) && remainCount > 0) {
            remainCount--;
            newFiles.push({
              name: file.name,
              droppedFile: file,
              isLoading:true
            });
          }
        });

        if (newFiles.length < 1 ){
          return;
        }

        $scope.attachments = _.union($scope.attachments, newFiles);

        for (var i in $scope.attachments){
          $scope.attachments[i].position=i;
        }
        console.log($scope.attachments);

        _.each(newFiles,function(file,index){
          runFileUpload(file, section);
        });
      }
    };

    function runFileUpload(file, section) {
      if(uploadJobCount >= MAX_UPLOAD_COUNT) {
        waitJobList.push(file);
      } else {
        uploadJobCount++;
        BendService.upload(file.droppedFile,function(error,uploadedFile){
          uploadJobCount--;
          if(waitJobList.length > 0) {
            var _file = waitJobList[0];
            waitJobList.splice(0, 1);
            runFileUpload(_file);
          }
          if(error) {
            console.log(error);
            return;
          }

          file.progress = 0;
          applyChangesOnScope($scope, function(){
            BendService.getFile(uploadedFile, function(ret){
              file.file = ret;
              file.isLoading = false;
            })
            $scope.inputForm.$setDirty();
          })
        },{
          _workflow: isPhoto(file.droppedFile)?'photo':section
        }, function(total, prog){
          applyChangesOnScope($scope, function(){
            file.progress = prog * 100 / total;
          })
        });
      }
    }

    function isPhoto(file) {
      if(file.type.match(/image.*/))
        return true;
      else
        return false;
    }

    $scope.widget1 = {
      title             : $scope.dashboardData.widget1.title,
      onlineUsers       : $scope.dashboardData.widget1.onlineUsers,
      views          : {
        title   : $scope.dashboardData.widget1.views.title,
        value   : $scope.dashboardData.widget1.views.value,
        previous: $scope.dashboardData.widget1.views.previous,
        options : {
          chart: {
            type                   : 'lineChart',
            color                  : ['#03A9F4'],
            height                 : 40,
            margin                 : {
              top   : 4,
              right : 4,
              bottom: 4,
              left  : 4
            },
            isArea                 : true,
            interpolate            : 'cardinal',
            clipEdge               : true,
            duration               : 500,
            showXAxis              : false,
            showYAxis              : false,
            showLegend             : false,
            useInteractiveGuideline: true,
            x                      : function (d)
            {
              return d.x;
            },
            y                      : function (d)
            {
              return d.y;
            },
            xAxis                  : {
              tickFormat: function (d)
              {
                var date = new Date(new Date().setDate(new Date().getDate() + d));
                return d3.time.format('%A, %B %d, %Y')(date);
              }
            },
            interactiveLayer       : {
              tooltip: {
                gravity: 's',
                classes: 'gravity-s'
              }
            }
          }
        },
        data    : $scope.dashboardData.widget1.views.chart
      },
      likes         : {
        title   : $scope.dashboardData.widget1.likes.title,
        value   : $scope.dashboardData.widget1.likes.value,
        previous: $scope.dashboardData.widget1.likes.previous,
        options : {
          chart: {
            type                   : 'lineChart',
            color                  : ['#3F51B5'],
            height                 : 40,
            margin                 : {
              top   : 4,
              right : 4,
              bottom: 4,
              left  : 4
            },
            isArea                 : true,
            interpolate            : 'cardinal',
            clipEdge               : true,
            duration               : 500,
            showXAxis              : false,
            showYAxis              : false,
            showLegend             : false,
            useInteractiveGuideline: true,
            x                      : function (d)
            {
              return d.x;
            },
            y                      : function (d)
            {
              return d.y;
            },
            xAxis                  : {
              tickFormat: function (d)
              {
                var date = new Date(new Date().setDate(new Date().getDate() + d));
                return d3.time.format('%A, %B %d, %Y')(date);
              }
            },
            interactiveLayer       : {
              tooltip: {
                gravity: 's',
                classes: 'gravity-s'
              }
            }
          }
        },
        data    : $scope.dashboardData.widget1.likes.chart
      },
      downloads     : {
        title   : $scope.dashboardData.widget1.downloads.title,
        value   : $scope.dashboardData.widget1.downloads.value,
        previous: $scope.dashboardData.widget1.downloads.previous,
        options : {
          chart: {
            type                   : 'lineChart',
            color                  : ['#E91E63'],
            height                 : 40,
            margin                 : {
              top   : 4,
              right : 4,
              bottom: 4,
              left  : 4
            },
            isArea                 : true,
            interpolate            : 'cardinal',
            clipEdge               : true,
            duration               : 500,
            showXAxis              : false,
            showYAxis              : false,
            showLegend             : false,
            useInteractiveGuideline: true,
            x                      : function (d)
            {
              return d.x;
            },
            y                      : function (d)
            {
              return d.y;
            },
            xAxis                  : {
              tickFormat: function (d)
              {
                var date = new Date(new Date().setDate(new Date().getDate() + d));
                return d3.time.format('%A, %B %d, %Y')(date);
              }
            },
            interactiveLayer       : {
              tooltip: {
                gravity: 's',
                classes: 'gravity-s'
              }
            }
          }
        },
        data    : $scope.dashboardData.widget1.downloads.chart
      },
      purchases: {
        title   : $scope.dashboardData.widget1.purchases.title,
        value   : $scope.dashboardData.widget1.purchases.value,
        previous: $scope.dashboardData.widget1.purchases.previous,
        options : {
          chart: {
            type                   : 'lineChart',
            color                  : ['#009688'],
            height                 : 40,
            margin                 : {
              top   : 4,
              right : 4,
              bottom: 4,
              left  : 4
            },
            isArea                 : true,
            interpolate            : 'cardinal',
            clipEdge               : true,
            duration               : 500,
            showXAxis              : false,
            showYAxis              : false,
            showLegend             : false,
            useInteractiveGuideline: true,
            x                      : function (d)
            {
              return d.x;
            },
            y                      : function (d)
            {
              return d.y;
            },
            xAxis                  : {
              tickFormat: function (d)
              {
                var date = new Date(new Date().setDate(new Date().getDate() + d));
                return d3.time.format('%A, %B %d, %Y')(date);
              }
            },
            yAxis                  : {
              tickFormat: function (d)
              {
                var formatTime = d3.time.format('%M:%S');
                return formatTime(new Date('2012', '0', '1', '0', '0', d));
              }
            },
            interactiveLayer       : {
              tooltip: {
                gravity: 's',
                classes: 'gravity-s'
              }
            }
          }
        },
        data    : $scope.dashboardData.widget1.purchases.chart
      }
    };
  }

})();
