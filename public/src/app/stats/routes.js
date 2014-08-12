(function(angular, undefined){'use strict';

angular.module('users')

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/stats', {
    title: 'Login',
    templateUrl: '/public/src/app/stats/list.html',
    controller: function(stats, $scope) {
      $scope.$parent.bodyClass = 'stats';
      $scope.stats = stats;
    },
    resolve: { stats: ['stats', function(statsService) {
      return statsService.collection();
    }]}
  });
}]);

})(angular);
