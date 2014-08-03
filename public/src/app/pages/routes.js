(function(angular, undefined){'use strict';

angular.module('pages')

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    title: 'Home',
    templateUrl: '/public/src/app/pages/home.html'
  });
}]);

})(angular);
