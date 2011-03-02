/**
 *  Application
 */
var Application = (function() {
  var app = {}; 
  var NOW = new Date();
  var TOMORROW = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + 1);

  app.config = [];
  app.VIEWS = ["main", "setting", "help"];
  app.STORAGE_KEY = "scheduleConfig";

  //TODO refactoring me
  //default schedule
  //condition digits rules are
  //left digit
  //0   : evenryweek
  //1..6: day
  //right digit
  //0..6: day
  app.PRESET_SCHEDULE = [
    {condition: "03", trash: "燃やせるごみ"},
    {condition: "06", trash: "燃やせるごみ"},
    {condition: "25", trash: "燃やせないごみ"},
    {condition: "45", trash: "燃やせないごみ"},
    {condition: "14", trash: "新聞・雑誌・ダンボール・布類"},
    {condition: "34", trash: "新聞・雑誌・ダンボール・布類"},
    {condition: "24", trash: "カン・ビン・ペットボトル"},
    {condition: "44", trash: "カン・ビン・ペットボトル"},
    {condition: "02", trash: "プラスチック"}
  ];

  /**
   *  initialize
   */
  app.initialize = function() {
    var self = this;

    this.restoreSchedule();

    this.changeView("setting");

    //initialize input view
    this.initMainView();

    //initialize setting view
    this.initSettingView();

    //initialize menu
    this.initMenu();
  };

  /**
   *  initialize main view
   */
  app.initMainView = function() {
    var self = this;
    var year = NOW.getFullYear();
    var month = NOW.getMonth() + 1;
    var date = NOW.getDate();
    var day = this.getWeekOfDay(NOW);
    var numberOfDayOfTheWeek = this.getNumberOfDayOfTheWeek(NOW);
    $("#today").html("今日は" + year + "年" + month + "月" + date + "日" + "(" + day + ")");
    $("#day").html("第" + numberOfDayOfTheWeek + day + "曜日");
    $("#todayTrash").html(this.getTrashCollectionSchedule(NOW));
    $("#tomorrowTrash").html(this.getTrashCollectionSchedule(TOMORROW));
  };

  /**
   *  initialize setting view
   */
  app.initSettingView = function() {
    var self = this;

    //create list
    this.initScheduleList();

    //add reset button event handler
    $("#resetButton").click(function() {
      if (confirm("スケジュールを初期化しますか？")) {
        self.resetSchedule();
        self.initScheduleList();
      }
    });
  };

  /**
   *  init schedule list in setting view
   */
  app.initScheduleList = function() {
    var self = this;
    if (this.config.length === 0) {
      $("#scheduleAlert").show();
    } else {
      $("#scheduleAlert").hide();
    }

    //clear list
    $("ul#schedule").html("");
    //create list
    for (var i = 0; i < this.config.length; i++) {
      var id = i;
      var rule = this.config[i];
      var condition = rule.condition;
      var trash = rule.trash;
      var html = this.createListItemHTML(id, condition, trash);
      $("ul#schedule").append(html);
    }

    //add delete button event handler
    $("ul#schedule li div.deleteButton a").each(function(index, element) {
      $(element).click(function() {
        //get parent li id
        var id = $(this).closest("li").attr("id").match(/^item(\d+)$/)[1];
        self.removeScheduleItem(id);
      });
    });
  }

  /**
   *  create list item html
   *  @param condition day rule
   *  @param trash trash text
   *  @return list item html
   */
  app.createListItemHTML = function(id, condition, trash) {
    //left digit
    var term = condition.charAt(0);
    //right digit
    var day = condition.charAt(1);

    var conditionText;
    //every week
    if (term === "0") {
      conditionText = "毎週" + this.dayNumberToString(Number(day)) + "曜日";
    } else {
      conditionText = "第" + term + this.dayNumberToString(Number(day)) + "曜日";
    }

    var escapedTrash = this.escapeHTML(trash);

    var templateHTML = $("#scheduleItemTemplate").clone().attr("id", "").removeClass("template").html();
    templateHTML = templateHTML.replace(/###DAY###/g, conditionText);
    templateHTML = templateHTML.replace(/###TRASH###/g, escapedTrash);
    var listItemHTML = $("<li>" + templateHTML + "</li>");
    listItemHTML.attr("id", "item" + id);
    if (id % 2 === 1) {
      listItemHTML.addClass("odd");
    }
    return listItemHTML;
  };

  /**
   *  initialize menu
   */
  app.initMenu = function() {
    var self = this;
    for (var i = 0; i < this.VIEWS.length; i++) {
      var menuItem = $("ul#menu li." + this.VIEWS[i]);
      var menuLink = $("ul#menu li a." + this.VIEWS[i]);
      menuItem.removeClass("disabled");
      menuLink.click(function(event) {
        var viewName = $(event.target).attr("class");
        self.changeView(viewName);
        return false;
      });
    }
  };

  /**
   *  get trash collection schedule
   *  @param date the date
   *  @return trash
   */
  app.getTrashCollectionSchedule = function(date) {
    var leftDigit = this.getNumberOfDayOfTheWeek(date) + "";
    var rightDigit = date.getDay() + "";
    for (var i = 0; i < this.config.length; i++) {
      var rule = this.config[i];
      var condition = rule.condition;
      var trash = rule.trash;
      //specific pattern
      if (rule.condition === leftDigit + rightDigit) {
        return trash;
      //every week pattern
      } else if (rule.condition === "0" + rightDigit) {
        return trash;
      }
    }
    //not match
    return "なし";
  };

  /**
   *  save current schedule
   */
  app.saveSchedule = function() {
    localStorage[this.STORAGE_KEY] = JSON.stringify(this.config);
  };

  /**
   *  restore schedule
   */
  app.restoreSchedule = function() {
    //exist config in localStorage
    if (localStorage && localStorage[this.STORAGE_KEY]) {
      this.config = JSON.parse(localStorage[this.STORAGE_KEY]);
    //not exist then use preset
    } else {
      this.config = this.PRESET_SCHEDULE.concat();
    }
  };

  /**
   *  remove schedule rule
   *  @param id config rules index
   */
  app.removeScheduleItem = function(id) {
    this.config.splice(id, 1);
    //update view
    this.initScheduleList();

    //save config
    this.saveSchedule();
  };

  /**
   *  reset schedule
   */
  app.resetSchedule = function() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.config = this.PRESET_SCHEDULE.concat();
    this.saveSchedule();
  };

  /**
   *  validate input value
   */
  app.validateInputValue = function() {
  };

  /**
   *  change view
   *  @param view type
   */
  app.changeView = function(view) {
    for (var i = 0; i < this.VIEWS.length; i++) {
      if (this.VIEWS[i] === view) {
        $("#" + view + "View").show();
        $("ul#menu li." + view).addClass("current");
      } else {
        $("#" + this.VIEWS[i] + "View").hide();
        $("ul#menu li." + this.VIEWS[i]).removeClass("current");
      }
    }
  };

  /**
   *  escape HTML [util function]
   *  @param html the html
   *  @return escaped html
   */
  app.escapeHTML = function(html) {
    return $("<div/>").text(html).html();
  };

  /**
   *  get week of day [util function]
   *  @param date target date
   *  @return week of day
   */
  app.getWeekOfDay = function(date) {
    return this.dayNumberToString(date.getDay());
  };

  /**
   *  day number to human readable string
   *  @param day day number 0..1
   *  @return day string
   */
  app.dayNumberToString = function(day) {
    return ["日", "月", "火", "水", "木", "金", "土"][day];
  };

  /**
   *  get number of day of the week [util function]
   *  @param date target date
   *  @return number of day of the week
   */
  app.getNumberOfDayOfTheWeek = function(date) {
    return (date.getDate() + 6) / 7 >> 0;
  };

  /**
   *  capitalize [util function]
   *  @param target string
   *  @return capitalized string
   */
  app.capitalize = function(target) {
    return target.replace(/((^|\s)+)(\w+)/ig, function() {
        return arguments[1] + arguments[3].substring(0, 1).toUpperCase() + arguments[3].substring(1);
    });     
  };

  return app;
})();

/**
 *  entry point
 */
$(function() {
  Application.initialize();
});
