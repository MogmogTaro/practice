$(function(){
  var Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        title: '',
        // order: Todos.order(),
        done: false,
        name: ''
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
    }
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
      // エンターを押して編集モードを終了するときに、上書きなどの処理も一緒にする
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
    // エンターを押して編集モードを終了するときに、上書きなどの処理も一緒にする
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
      var value = this.input.val();
      var name = this.model.get('name');
      if(!value) {
        return name;
      } else {
        this.model.save({
          title: value,
          name: value
        });
      }
      // changeしたときにとか、フォーカスが外れたときvalueがからだったら、nameを当てはめる
      // でもこのイベントはblurがついてる
    },
    doneToggle: function() {
      this.model.toggle();
    }
  });



  var AppView = Backbone.View.extend({
    el: $("#todoapp"),
    statsTemplate: _.template($('#stats-template').html()),

    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "allDelete",
      "click #toggle-all": "allCheck"
    },
    initialize: function() {
      this.input = this.$("#new-todo");
      this.allCheckBox = this.$("#toggle-all")[0];

      this.listenTo(Todos, 'add', this.addOne);
      this.listenTo(Todos, 'reset', this.addAll);
      this.listenTo(Todos, 'all', this.render);

      this.main = $('#main');
      this.footer = this.$('footer');
      Todos.fetch();
    },
    render: function() {
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;

      if (Todos.length) {
        this.main.show();
        this.footer.show();
        this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
        this.footer.hide();
      }
      this.allCheckBox.checked = !remaining;
    },
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },
    addAll: function() {
      Todos.each(this.addOne, this);
    },
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.create({
        title: this.input.val(),
        name: this.input.val()
      });
      this.input.val('');
    },
    comparator: 'name',
    comparator: function(todo) {
      return todo.get('name');
    },
    allDelete: function(){
      _.invoke(Todos.done(), 'destroy');
    },
    allCheck: function() {
      var done = this.allCheckBox.checked;
      Todos.each(function (todo) {todo.save({'done': done}); });
    }
  });
  var App = new AppView;
});
