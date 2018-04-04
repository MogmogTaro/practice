$(function(){
  var Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "",
        order: Todos.order(),
        done: false
      };
    },
    toggle: function() {
      this.save({done: !this.get('done')});
    }
  });

  var TodoList = Backbone.Collection.extend({
    model: Todo,
    localStorage: new Backbone.LocalStorage("todos-backbone"),
    done: function() {
      return this.where({done: true});
    },
    remaining: function() {
      return this.where({done: false});
    },
    order: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },
    comparator: 'order'

  });

  var Todos = new TodoList;
  var TodoView = Backbone.View.extend({
    tagName:  "li",
    template: _.template($('#item-template').html()),

    events: {
      "click a.destroy": "delete",
      "dblclick .view": "edit",
      "keypress .edit": "close",
      "blur .edit": "overwrite",
      "click .toggle": "doneToggle"
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
      this.$el.toggleClass('done', this.model.get('done'));
      return this;
    },
    delete: function() {
      this.model.destroy();
    },
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },
    close: function(e) {
      if (e.keyCode == 13) {
        this.$el.removeClass("editing");
        return;
      }
      this.input.focus();
    },
    overwrite: function() {
      var title = this.input.val();
      if(!title) {
        this.delete();
      } else {
        this.model.save({title: title});
      }
    },
    doneToggle: function() {
      this.model.toggle();
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
