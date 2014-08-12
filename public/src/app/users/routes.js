(function(angular, undefined){'use strict';

angular.module('users')

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    title: 'Login',
    templateUrl: '/public/src/app/users/login.html',
    resolve: { notLoggedIn: ['$location', '$q', '$window', function($location, $q, $window) {
      var deferred = $q.defer();
      $window.user ? $location.replace().path('/') : deferred.resolve();
      return deferred.promise;
    }]}
  });
}]);

})(angular);
