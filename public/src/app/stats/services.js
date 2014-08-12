(function(angular, undefined){'use strict';

angular.module('stats')

.provider('stats', function StatsProvider() {
  this.$get = ['resource-api',
    function(api) {
    var service = {
      collection: function() {
        return api.query('/stats');
      }
    };
    return service;
  }];
});

})(angular);
