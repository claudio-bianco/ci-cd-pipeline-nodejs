(function(){
  'use strict';
  var API_URL = window.API_URL || (window.location.origin + '/api');

  angular.module('todoApp', [])
    .factory('Todos', function($http){
      function call(method, path, body){
        var cfg = { method: method, url: API_URL + path };
        if (body) { cfg.headers = { 'Content-Type': 'application/json' }; cfg.data = body; }
        return $http(cfg).then(r => r.data);
      }
      return {
        list: () => call('GET','/todos'),
        create: (title) => call('POST','/todos',{title, done:false}),
        get: (id) => call('GET','/todos/'+id),
        update: (id, data) => call('PUT','/todos/'+id, data),
        remove: (id) => call('DELETE','/todos/'+id),
        version: () => call('GET','/version')
      };
    })
    .controller('MainCtrl', function($scope, Todos){
      var vm = this;
      vm.todos = [];
      vm.error = '';
      vm.newTitle = '';

      vm.refresh = function(){
        Todos.list().then(data => vm.todos = data)
          .catch(e => vm.error = (e.data && e.data.error) || 'Falha ao listar');
      };

      vm.create = function(){
        if(!vm.newTitle) return;
        Todos.create(vm.newTitle)
          .then(x => { vm.todos.unshift(x); vm.newTitle=''; })
          .catch(e => vm.error = (e.data && e.data.error) || 'Falha ao criar');
      };

      vm.edit = function(t){ t._editing=true; t._title=t.title; };
      vm.save = function(t){
        Todos.update(t.id, { title: t._title })
          .then(x => { t.title=x.title; t._editing=false; })
          .catch(e => vm.error = (e.data && e.data.error) || 'Falha ao atualizar');
      };

      vm.toggleDone = function(t){
        Todos.update(t.id, { done: !!t.done })
          .then(x => t.done = !!x.done)
          .catch(e => vm.error = (e.data && e.data.error) || 'Falha ao marcar');
      };

      vm.remove = function(t){
        Todos.remove(t.id)
          .then(() => vm.todos = vm.todos.filter(x => x.id!==t.id))
          .catch(e => vm.error = (e.data && e.data.error) || 'Falha ao excluir');
      };

      vm.loadVersion = function(){
        Todos.version()
          .then(function(data){ vm.version = data.version; })
          .catch(function(){ vm.version = ''; });
      };

      vm.refresh();
      vm.loadVersion();
    });
})();
