(function(angular, undefined){'use strict';

angular.module('pages')

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    title: 'Home',
    templateUrl: '/public/src/app/pages/home.html',
    controller: function($scope) {
      $scope.$parent.bodyClass = 'home';
    }
  });
  $routeProvider.when('/about', {
    templateUrl: '/public/src/app/pages/home.html',
    controller: function($location) {
      $location.path('/').hash('about');
    }
  });
  $routeProvider.when('/contact', {
    templateUrl: '/public/src/app/pages/home.html',
    controller: function($location) {
      $location.path('/').hash('contact');
    }
  });
  $routeProvider.when('/install', {
    templateUrl: '/public/src/app/pages/home.html',
    controller: function($location) {
      $location.path('/').hash('install');
    }
  });
}]);

})(angular);
