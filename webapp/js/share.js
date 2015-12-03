var app = angular.module('app',[]);

var domain = "http://121.41.117.10:8889/"; 
app.factory('Citycategory',function() {
	return {
		region: function(data) {
			return $.get(domain+'city/region',data);
		},
	}
});

app.factory('Geo',['$q',function($q){
	return {
		currentLocation:function(){
			var deferred = $q.defer();
			//定位对象
			var geoc = new BMap.Geocoder();
			var geolocation = new BMap.Geolocation();
			geolocation.getCurrentPosition(function(r){
			  if(this.getStatus() == BMAP_STATUS_SUCCESS){
			    geoc.getLocation(r.point, function(rs){
			    	deferred.resolve(rs);
			    });
			  }
			},{enableHighAccuracy: true});
			return deferred.promise; 
		},
	}
}]);

app.controller('mapController',['$scope','Geo',
function($scope,Geo){
	Geo.currentLocation().then(function(address){
		province = address.addressComponents.province;
		city = address.addressComponents.city;
		area = address.addressComponents.district;
		street = address.addressComponents.street;
		console.log(address.addressComponents);
		$scope.region = province+city+area+street;
	});
}])

app.controller('categoryController', ['$scope','Citycategory',
function($scope,Citycategory){
$scope.two_cates = [];
$scope.third_cates = [];
Citycategory.region().success(function(res){
	$scope.categories = res;
	$scope.$apply();
});
$scope.num = 1;
$scope.children_cate = function(){
	$scope.category_id = $scope.category.id;
	$("#region_id").val($scope.category.id);
	Citycategory.region({id:$scope.category_id}).success(function(res){
		$scope.two_cates = res;
		$scope.third_cates=[];
		if(res.length>0){
			$scope.num = 2;
		}else{
			$scope.num = 1;
		}
		$scope.$apply();
	});
}
$scope.children_cate1 = function(category1){
	$("#region_id").val(category1);
	Citycategory.region({id:category1}).success(function(res){
		$scope.third_cates = res;
		if(res.length>0){
			$scope.num = 3;
		}else{
			$scope.num = 2;
		}
		$scope.$apply();
	});
}
$scope.children_cate2 = function(category2){
	$("#region_id").val(category2);
}
}]);