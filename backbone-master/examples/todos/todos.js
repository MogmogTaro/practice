$(function(){
  var Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "",
        order: Todos.nextOrder(),
        done: false
      };
    },
  });

  var TodoList = Backbone.Collection.extend({
    model: Todo,
    done: function() {
      return this.where({done: true});
    },
    remaining: function() {
      return this.where({done: false});
    },
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },
    comparator: 'order'

  });
  var Todos = new TodoList;
  var TodoView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#item-template').html()),
    initialize: function() {
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  var AppView = Backbone.View.extend({
    el: $("#todoapp"),
    statsTemplate: _.template($('#stats-template').html()),

    events: {
      "keypress #new-todo":  "createOnEnter"
    },
    initialize: function() {
      this.input = this.$("#new-todo");
      this.listenTo(Todos, 'add', this.addOne);
      this.listenTo(Todos, 'all', this.render);
      this.main = $('#main');
    },
    render: function() {
      var done = Todos.done().length;
      if (Todos.length) {
        this.main.show();
      } else {
        this.main.hide();
      }
    },
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.create({title: this.input.val()});
    }
  });
  var App = new AppView;
});