(function(angular){'use strict';

angular.module('admin')

.config(['$routeProvider', 'usersProvider', function($routeProvider, usersProvider) {
  $routeProvider.when('/admin/', {
    templateUrl: '/public/src/app/admin/users-list.html',
    controller: AdminUsersListView,
    resolve: {
      user: usersProvider.resolveAdmin(),
      allUsers: usersProvider.resolveAll()
    }
  });
}]);

function AdminUsersListView(user, allUsers, $filter, $scope, usersService) {
  $scope.$root.title = 'Users - Admin';
  $scope.$root.bodyClass = 'admin page';
  $scope.users = allUsers;
  $scope.newUser = {};
  $scope.editingUser = null;

  $scope.create = function(newUser) {
    usersService.create(newUser).then(function(newUser) {
      $scope.users.add(newUser);
      $scope.newUser = {};
    });
  };
  $scope.delete = function(user, e) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this user?')) {
      usersService.delete(user.$path).then(function() {
        $scope.users.remove(user);
      });
    }
  };
  $scope.save = function(user, e) {
    usersService.update(user).then(function(user) {
      delete user.password;
    });
  };
  $scope.stopPropagation = function(e) {
    e.stopPropagation();
  };

  $scope.$on('edit-user-modal-hidden', function() {
    $scope.editingUser = false;
  });

}

AdminUsersListView.$inject = [
  'user',
  'allUsers',
  '$filter',
  '$scope',
  'users'
];

})(angular);
