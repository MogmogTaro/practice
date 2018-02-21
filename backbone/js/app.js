(function(){

// Model

var Task = Backbone.Model.extend({
  defaults: {
    title: "do something!",
    completed: false
  }
});

var task = new Task();

// view

var TaskView = Backbone.View.extend({
  tagName: 'li'
});
var taskView = new TaskView({model : task});
console.log(taskView.$el)
//$でjqueryのメソッドになる
})();
