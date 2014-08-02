(function(window, undefined){'use strict';

window.humanitybox = {};

var deps = [
  'epixa-resource',
  'ngRoute',
  'users',
  'admin'
];

humanitybox = angular.module('humanitybox', deps);
humanitybox.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.otherwise({
    templateUrl: '/public/src/app/errors/404.html'
  });
}]);
humanitybox.run(['resource-api', function(api) {
  api.defaults.transformPath.push(function apiPrefix(path) {
    return '/api' + path;
  });
}]);
humanitybox.directive('ngApp', ['$window', 'users', function($window, usersService) {
  return {
    link: function(scope, element, attrs) {

      scope.message = $window.message || null;

      if ($window.user) {
        usersService.get('/users/' + $window.user.id).$promise.then(function(user) {
          scope.user = user;
        });
      }

      scope.$on('$routeChangeStart', function() {
        window.NProgress.start();
      });
      scope.$on('$routeChangeSuccess', function() {
        window.NProgress.done();
      });

    }
  };
}]);

}(window));
