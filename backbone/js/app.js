(function(){

var Task = backbone.Model.extend({
  defaults: {
    title: 'do something!',
    completed: false
  }
});
var Tasks = Backbone.Collection.extend({model:Task});

var TaskView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#task-template').html());
  render: function(){
    var template = this.template(this.model.toJSON());
    this.$el.html(template);
    return this;
  }
});
var TasksView = Backbone.View.extend({});

var tasks = new Tasks([
  {
    title:'task1',
    completed: true
  },
  {
    title:'task2',
  },
  {
    title:'task3',
  }
]);

})();
