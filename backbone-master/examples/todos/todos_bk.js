
$(function(){


  var Todo = Backbone.Model.extend({

    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false
      };
    },
    //model.toggle()の処理
    toggle: function() {
      //done にdoneを渡す
      this.save({done: !this.get("done")});
    }

  });

  // TodoListというコレクション(大枠？)の定義
  // このTodoListの中にmodel（情報）が入っていく
  // TodoListなので、この中にリストの情報がはいっていく
  var TodoList = Backbone.Collection.extend({
    model: Todo,

    // サーバーではなく、Backbone.LocalStorageを使っているようだ
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    done: function() {
      return this.where({done: true});
    },

    remaining: function() {
      return this.where({done: false});
    },

    // あんまりわかってないけど、order+1なので順番つけているのかな
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // ↑で1を足していってcomparatorで順番にしているようだ
    comparator: 'order'

  });

  // Todos というインスタンス
  var Todos = new TodoList;


  var TodoView = Backbone.View.extend({

    // viewが追加された際に<li></li>で作成される
    tagName:  "li",

    // Underscoreテンプレ機能を使う
    template: _.template($('#item-template').html()),

    //使いたいイベントたちを関数にする
    events: {
      // toggle をクリックしたらtoggleDoneが作動
      "click .toggle"   : "toggleDone",
      // viewをダブルクリックするとeditが作動
      "dblclick .view"  : "edit",
      // destroyをクリックするとclearが作動
      "click a.destroy" : "clear",
      // edit(フォーム)でボタンを押すとupdateOnEnter作動
      "keypress .edit"  : "updateOnEnter",
      "blur .edit"      : "close"
    },

    // カンペ  Modelが更新されたらViewを更新するためにlistenToを使う。
    initialize: function() {
      //値が変わったらrenderが走る。この場合、チェックボックスのcheckedに変わる
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    // modelの内容をhtmlに入れる
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      // エレメント（この場合li）.doneをtoggleさせる
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

    // modelがtoggleする
    toggleDone: function() {
      this.model.toggle();
    },

    // inputにeditingというクラスをつける
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // ↑の処理（editなので多分編集）が終わったら、入力されたtitleを保存してeditingを外す
    close: function() {
      var value = this.input.val();
      if (!value) {
        // フォームに値がなければclearなので削除
        this.clear();
      } else {
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },

    // 13なのでエンターが押されたら終了
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // 書かれていたmodelを削除する
    clear: function() {
      this.model.destroy();
    }

    //新しく書く、元あったデータを消す、閉じるで編集の処理になる？

  });

  // Viewの定義
  var AppView = Backbone.View.extend({

    // todoappにAppViewを入れる
    el: $("#todoapp"),

    // stats-templateっていうのをテンプレートに使う
    statsTemplate: _.template($('#stats-template').html()),

    //イベントと紐づく関数
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      //id="toggle-all"をクリックすると作動
      "click #toggle-all": "toggleAllComplete"
    },


    initialize: function() {

      this.input = this.$("#new-todo");
      //allCheckboxがtoggle-allの配列
      this.allCheckbox = this.$("#toggle-all")[0];

      //  Modelが更新されたらViewを更新するためにlistenToを使う。おそらくここも
      this.listenTo(Todos, 'add', this.addOne);
      this.listenTo(Todos, 'reset', this.addAll);
      this.listenTo(Todos, 'all', this.render);
      // Todos はcollection

      this.footer = this.$('footer');
      this.main = $('#main');

      Todos.fetch();
    },

    // remainingなので、残りのtodoについて
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

      //全てのチェックボックスがdoneになったら、allCheckBox(toggle-all)もdoneにする
      this.allCheckbox.checked = !remaining;
    },


    //id="todo-list"にtodoが追加されていく
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },

    addAll: function() {
      Todos.each(this.addOne, this);
    },

    //エンターを押すとtodoが生成される
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

      Todos.create({title: this.input.val()});
      this.input.val('');
    },

    // doneになったtodoを削除する
    clearCompleted: function() {
      _.invoke(Todos.done(), 'destroy');
      return false;
    },

    // checkedになったものがdone
    //これはtoggleAllCompleteがcheckになったら発動する動作
    toggleAllComplete: function () {
      //allCheckbox(toggle-all)がcheckedになったら
      var done = this.allCheckbox.checked;
      //Todosの中の配列(addOneで作成されたリストたち)にdoneをつける
      Todos.each(function (todo) { todo.save({'done': done}); });
    }

  });

  // AppViewをインスタンスに
  var App = new AppView;

});
