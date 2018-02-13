(function(){

var Task = Backbone.Model.extend({
  defaults: {
    title: "do something!",
    completed: false
  }
});

var task1 = new Task({
  completed: true
});

console.log(task1.toJSON());

})();
