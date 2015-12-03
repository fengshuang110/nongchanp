var app = angular.module('app', ['ngRoute'])

domain = "http://api.yidiano2o.com/";


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
app.factory('Cookie',['$q',function() {
	return {
		getCookie: function(c_name) {
			if (document.cookie.length > 0) {
				c_start = document.cookie.indexOf(c_name + "=")
				if (c_start != -1) {
					c_start = c_start + c_name.length + 1
					c_end = document.cookie.indexOf(";", c_start)
					if (c_end == -1) c_end = document.cookie.length
					return unescape(document.cookie.substring(c_start, c_end)).replace(/\"/g, "");
				}
			}
			return null;
		},
		setCookie: function(name, value, seconds) {  
		     seconds = seconds || 0;   //seconds有值就直接赋值，没有为0，这个根php不一样。  
		     var expires = "";  
		     if (seconds != 0 ) {      //设置cookie生存时间  
		     var date = new Date();  
		     date.setTime(date.getTime()+(seconds*1000));  
		     expires = "; expires="+date.toGMTString();  
		     }  
		     document.cookie = name+"="+escape(value)+expires+"; path=/";   //转码并赋值  
		}
	}
}]);
//用户登录数据共享
app.factory('UserService', ['$rootScope','$q','Cookie', function ($rootScope,$q,Cookie) {  
	 return {
		 loginStatus : false,
		 username : '',
		 verifylogin : function() {  
			  var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行  
			  var data = {access_token:Cookie.getCookie('access_token')}
		 	  $.get(domain + "auth/verify",data)
		      	.success(function(res) {  
		      		deferred.resolve(res);  // 声明执行成功，即http请求数据成功，可以返回数据了  
		      	}).error(function(res) {  
			       		 deferred.reject(res);   // 声明执行失败，即服务器返回错误  
		      	});  
			  	return deferred.promise; 
			       // 返回承诺，这里并不是最终数据，而是访问最终数据的API  
			}, // end verifylogin
	 		saveAddress :function(data){
	 			return $.post(domain+'user/address/save',data);
	 		},
	 		addresses :function(){
	 			return $.get(domain+'user/addresses');
	 		},
	 		getAddressById:function(data){
	 			return $.get(domain+'user/addressbyid',data);
	 		},
	 	};
}]);
app.factory('AuthService', function() {
	return {
		login: function(data) {
			return $.post(domain+'auth/login',data);
		},
		register: function(data) {
			return $.post(domain+'auth/register',data);
		},
	}
});
app.factory('GoodsService', function() {
	return {
		category: function() {
			return $.get(domain+'goods/category');
		},
		recommend: function() {
			return $.get(domain+'goods/recommend');
		},
		categoryGoods:function(data){
			return $.get(domain+'goods/lists',data);
		},
		search: function(data){
			return $.get(domain+'goods/search',data);
		},
	}
});

app.factory('CartService', function() {
	return {
		add: function(data) {
			return $.post(domain+'cart/add',data);
		},
		del: function(data) {
			return $.post(domain+'cart/del',data);
		},
		update:function(data){
			return $.post(domain+'cart/update',data);
		},
		lists:function(data){
			return $.get(domain+'cart/lists',data);
		},
	}
});

app.factory('OrderService', function() {
	return {
		before: function() {
			return $.get(domain+'order/before');
		},
		create: function(data){
			return $.post(domain+'order/create',data);
		},
		lists: function(data) {
			return $.get(domain+'order/lists',data);
		},
		orderDetail:function(data){
			return $.get(domain+'order/detail',data);
		}
	}
});

app.controller('appCtrl',['$rootScope',
  function($rootScope){
	
}]);

app.controller('address',['$scope','$rootScope','$location','UserService',
function($scope,$rootScope,$location,UserService){
	UserService.verifylogin().then(function(data){
		if(data.code !=0 ){
			$location.path('/auth/login');
		}
	})
	UserService.addresses().success(function(res){
		$scope.addresses = res.data;
		$scope.$apply();
	});
	$scope.selectAddress =function(item){
		if($rootScope.selectAddress){
			$rootScope.address = item;
			$location.path('/order/before');
			$scope.$apply();
		}
	}
	
}]);     

app.controller('addAddress',['$scope','$rootScope','$location','Geo','UserService',
function($scope,$rootScope,$location,Geo,UserService){
	UserService.verifylogin().then(function(data){
		if(data.code !=0 ){
			$location.path('/auth/login');
		}
	})
	
	$scope.address={};

	Geo.currentLocation().then(function(address){
		$scope.address.province = address.addressComponents.province;
		$scope.address.city =address.addressComponents.city;
		$scope.address.area =address.addressComponents.district;
		$scope.address.region = $scope.address.province+$scope.address.city+$scope.address.area;
	});
	
	$scope.saveAddress = function(){
		UserService.saveAddress($scope.address).success(function(res){
			if(res.code * 1 == 0){
				if($rootScope.selectAddress){
					$scope.address.id = res.data.addr_id;
					$rootScope.address = $scope.address;
					$location.path('/order/before');
					$scope.$apply();
				}else{
					$location.path('/user/address/');
					$scope.$apply();
				}
			}
		});
	}
}])

app.controller('me',['$scope','$location','UserService','AuthService','Cookie','Geo',
function($scope,$location,UserService,AuthService,Cookie,Geo){
	UserService.verifylogin().then(function(data){
		if(data.code !=0 ){
			$location.path('/auth/login');
		}
	}); 
 }]);
 
 
app.controller('auth',['$scope','$location','AuthService','UserService','Cookie',
  function($scope,$location,AuthService,UserService,Cookie){
	$scope.login = function(){
		AuthService.login($scope.user).success(function(res){
			if(res.code == 0){
				Cookie.setCookie('access_token',res.data.access_token,86400);
				UserService.loginStatus = true;
				$location.path('/me');
				
				$scope.$apply();
			}else{
				alert(res.message);
			}
		});
	}
	$scope.register = function(){
		if($scope.user.password != $scope.user.password){
			return ;
		}
		AuthService.register($scope.user).success(function(res){
			if(res.code * 1 == 0){
				Cookie.setCookie('access_token',res.data.access_token,86400);
				UserService.loginStatus = true;
				$location.path('/home/shop');
				$scope.$apply();
			}else{
				alert(res.message);
			}
		})
		//注册
	}
}])

app.controller('cartEmpty',['$scope','$location',
function($scope,$location){
	$scope.go_shop = function(){
		$location.path('/home/shop');
	}
}]);

app.controller('cart',['$scope','$rootScope','$location','CartService','UserService',
function($scope,$rootScope,$location,CartService,UserService){
	UserService.verifylogin().then(function(data){
		if(data.code !=0 ){
			$location.path('/auth/login');
		}
	}); 
	
	$scope.total = 0;
	
	CartService.lists().success(function(res){
		if(res.data.carts.length <= 0){
			$location.path('cart/empty')
		}
		$scope.carts = res.data.carts;
		$scope.min_cost = res.data.min_cost;
		globleCart = new Array();
		angular.forEach(res.data.carts, function (item,index) {
			$scope.total += item.goods_number * item.real_sell_price;
			globleCart[item.goods_id] = item.goods_number;
  	   });
		$rootScope.globleCart = $scope.globleCart = globleCart;
		$scope.$apply();
	});
	
	//计算总价
	var getTotal = function(){
		$scope.total = 0;
		angular.forEach($scope.carts, function (item,index) {
			$scope.total += item.goods_number * item.real_sell_price;
  	   });
	}
	//添加减少购物车
	$scope.updatecart = function(item,type){
		data={'goods_id':item.goods_id}
		if(type == 2){
			data.quantity = parseInt(item.goods_number)-1
		}else{
			data.quantity = parseInt(item.goods_number)+1
		}
		CartService.add(data).success(function(res){
			if(res.code * 1 == 0){
				item.goods_number = data.quantity;
				getTotal();
				$scope.globleCart[data.goods_id] = data.quantity;
				$rootScope.globleCart = $scope.globleCart;
				$scope.$apply();
			}
		})
	}
	
	$scope.balance = function(){
		$location.path('/order/before');
	}
}]);

app.controller('home',['$scope','$rootScope','$location','GoodsService','CartService','UserService',
function($scope,$rootScope,$location,GoodsService,CartService,UserService){

	GoodsService.category().success(function(res){
		$scope.categories = res.data;
		$scope.$apply();
	});
	
	//计算全局购物车数量
	CartService.lists().success(function(res){
		globleCart = new Array();
		angular.forEach(res.data.carts, function (item,index) {
			globleCart[item.goods_id] = item.goods_number;
  	   });
		$rootScope.globleCart = $scope.globleCart = globleCart;
	})
	
	$scope.selectCate = function(item){
		$scope.cate = item;
		GoodsService.categoryGoods({category_id:item.id}).success(function(res){
			$scope.goodses = res.data.items;
			$scope.$apply();
		});
	}
	
	GoodsService.recommend({type:1}).success(function(res){
		$scope.goodses = res.data.items;
		$scope.$apply();
	});
	
	$scope.search = function(){
		GoodsService.search({keyword:$scope.keyword}).success(function(res){
			$scope.goodses = res.data;
			$scope.$apply();
		});
	}
	$scope.addcart = function(item){
		if(!UserService.loginStatus){
			UserService.verifylogin().then(function(data){
				if(data.code !=0 ){
					$location.path('/auth/login');
				}else{
					UserService.loginStatus=true;
				}
			})
		}
		
		if($scope.globleCart[item.goods_id]){
			quantity= parseInt($scope.globleCart[item.goods_id])+1;
		}else{
			quantity = 1;
		}
		data={
			'goods_id':item.id,
			'quantity':quantity
		}
		CartService.add(data).success(function(res){
			if(res.code * 1 == 0){
				$scope.globleCart[item.goods_id] = quantity;
				$rootScope.globleCart = $scope.globleCart;
				$scope.$apply();
			}
		})
	}
	
	
}]);

app.controller('beforeOrder',['$scope','$rootScope','$location','UserService','OrderService',
function($scope,$rootScope,$location,UserService,OrderService){
	UserService.verifylogin().then(function(data){
		if(data.code !=0 ){
			$location.path('/auth/login');
		}
	})
	$scope.payment_id = 0;
	OrderService.before().success(function(res){
		if(res.code*1 == 0){
			$scope.carts = res.data.carts;
			$scope.goods_total = res.data.goods_total;
			$scope.freight = res.data.freight;
			if($rootScope.selectAddress){
				$scope.address = $rootScope.address;
			}else{
				$scope.address = res.data.address[0];
			}
			$scope.payments = res.data.payments;
			$scope.cart_count = res.data.cart_count;
			$scope.min_cost = res.data.min_cost;
			$scope.$apply();
		}else{
			$location.path('/home/shop');
			$scope.$apply();
		}
	});
	$scope.create = function(){
		if($scope.payment_id != 0){
			alert('由于商户号未申请，暂不支持在线支付')
			return;
		}
		data = {
				payment_id:$scope.payment_id,
				addr_id : $scope.address.id
		}
		OrderService.create(data).success(function(res){
			
			if(res.code * 1 == 0){
				$rootScope.selectAddress = false;
				if(data.payment_id == 0){
					$location.path('/order/success/'+res.data.order_id);
					$scope.$apply();
				}
			}else{
				alert(res.message);
			}
		})
		
	}
	$scope.selectPayment = function(item){
		//选择支付方式
		if(item.id != 0){
			alert('由于商户号未申请，暂不支持在线支付')
			return;
		}
		$scope.payment_id = item.id;
	}
	$scope.changeAddress = function(){
		$rootScope.selectAddress = true;
		$location.path('/user/address');
		$scope.$apply();
	}
	$scope.addressAdd = function(){
		$rootScope.selectAddress = true;
		$location.path('/user/addressadd');
		$scope.$apply();
	}
}]);

app.controller('orderList',['$scope','$location','OrderService','UserService',
function($scope,$location,OrderService,UserService){
	UserService.verifylogin().then(function(data){
		if(data.code !=0 ){
			$location.path('/auth/login');
		}
	})
	$scope.status = 'all';
	OrderService.lists().success(function(res){
		$scope.orders = res.data;
		$scope.$apply();
	});
	$scope.getorder = function(status){
		$scope.status = status;
		OrderService.lists({type:status}).success(function(res){
			if(res.code * 1 == 0){
				$scope.orders = res.data;
				$scope.$apply();
			}
		});
	}
	$scope.detail = function(item){
		$location.path('/order/detail/'+item.id);
	}
}]);

app.controller('orderSuccess',['$scope','$location','$routeParams',
function($scope,$location,$routeParams){
   	$scope.params = $routeParams;
   	$scope.go_order = function(){
   		$location.path('/order/detail/'+$scope.params.order_id);
   	}
   	$scope.go_shop = function(){
   		$location.path('/home/shop');
   	}
}]);

app.controller('orderDetail',['$scope','$routeParams','OrderService','UserService',
function($scope,$routeParams,OrderService,UserService){
	UserService.verifylogin().then(function(data){
		if(data.code !=0 ){
			$location.path('/auth/login');
		}
	})
	
	$scope.toggle_tab = function(tab){
		$scope.tab = tab;
	}
	OrderService.orderDetail({order_id:$routeParams.order_id}).success(function(res){
		if(res.code * 1 == 0){
			$scope.order = res.data;
			$scope.$apply();
		}
	});
}]);


app.config(['$routeProvider',function($routeProvider) {
	$routeProvider.when('/site/index', {
			templateUrl: 'template/index.html',
			controller: 'site'
		}).when('/auth/login', {
			templateUrl: 'template/login.html',
			controller: 'auth'
		}).when('/auth/register', {
			templateUrl: 'template/register.html',
			controller: 'auth'
		}).when('/home/shop', {
			templateUrl: 'template/shop.html',
			controller: 'home'
		}).when('/cart/list', {
			templateUrl: 'template/cartlist.html',
			controller: 'cart'
		}).when('/order/before', {
			templateUrl: 'template/orderbefore.html',
			controller: 'beforeOrder'
		}).when('/order/list', {
			templateUrl: 'template/orderlist.html',
			controller: 'orderList'
		}).when('/order/detail/:order_id', {
			templateUrl: 'template/orderdetail.html',
			controller: 'orderDetail'
		}).when('/me', {
			templateUrl: 'template/me.html',
			controller: 'me'
		}).when('/cart/empty', {
			templateUrl: 'template/cartempty.html',
			controller: 'cartEmpty'
		}).when('/order/success/:order_id', {
			templateUrl: 'template/ordersuccess.html',
			controller: 'orderSuccess'
		}).when('/user/address', {
			templateUrl: 'template/address.html',
			controller: 'address'
		}).when('/user/addressadd', {
			templateUrl: 'template/editaddress.html',
			controller: 'addAddress'
		}).otherwise({
			redirectTo: '/site/index'
		});
	$.ajaxPrefilter(function(options) {
		access_token = getcookie("access_token");
		if (access_token) {
			options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + 'access_token=' + access_token;
		} else {
			var matches = document.cookie.match(/access_token%22%3A%22(\w+)/);
			if (matches) {
				options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + 'access_token=' + matches[1];
			}
		}
	});
	}
]);
