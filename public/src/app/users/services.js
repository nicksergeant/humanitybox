(function(angular, undefined){'use strict';

angular.module('users')

.provider('users', function UsersProvider() {
  this.$get = ['resource-api',
    function(api) {

    var service = {
      collection: function() {
        return api.query('/users', angular.extend({
          initializer: configureUser
        }));
      },
      create: function(user) {
        return api.post('/users', user);
      },
      delete: api.delete,
      get: function(path, config) {
        return api.get(path, angular.extend({
          initializer: configureUser
        }, config));
      },
      update: function(user) {
        return api.put(user.$path, user, angular.extend({
          initializer: configureUser
        }));
      }
    };

    function configureUser(user) {}

    return service;
  }];

  this.resolve = function() {
    return ['$location', '$q', '$window', 'users',
      function($location, $q, $window, usersService) {
        var deferred = $q.defer();
        if (!$window.user) {
          $location.replace().path('/login/');
        } else {
          usersService.get('/users/' + $window.user.id).$promise.then(function(user) {
            deferred.resolve(user);
          });
        }
        return deferred.promise;
      }
    ];
  };
  this.resolveAdmin = function() {
    return ['$location', '$q', '$window', 'users', function($location, $q, $window, usersService) {
      if (!$window.user || !$window.user.id) {
        $location.path('/login/');
        return $q.defer();
      } else {
        return usersService.get('/users/' + $window.user.id).$promise.then(function(user) {
          if (!user.isAdmin) {
            $location.path('/login/');
            return $q.defer();
          } else {
            return user;
          }
        });
      }
    }];
  };
  this.resolveAll = function() {
    return ['users', function(usersService) {
      return usersService.collection();
    }];
  };
});

})(angular);
