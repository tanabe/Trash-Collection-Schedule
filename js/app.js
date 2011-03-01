/**
 *  Application
 */
var Application = (function() {
  var app = {}; 
  var NOW = new Date();
  var TOMORROW = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() + 1);

  app.config = {};
  app.VIEWS = ["main", "setting", "help"];
  app.STORAGE_KEY = "scheduleConfig";

  /**
   *  initialize
   */
  app.initialize = function() {
    var self = this;

    this.restoreSchedule();

    this.changeView("main");

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
   */
  app.getTrashCollectionSchedule = function(date) {
    return this.config[this.getNumberOfDayOfTheWeek(date) + "" + date.getDay()] || this.config["0" + date.getDay()] || "なし";
  };

  /**
   *  restore schedule
   */
  app.restoreSchedule = function() {
    if (localStorage && localStorage[this.STORAGE_KEY]) {
      this.config = JSON.parse(localStorage[this.STORAGE_KEY]);
    } else {
      //default schedule
      this.config = {
        "03": "燃やせるごみ",
        "06": "燃やせるごみ",
        "25": "燃やせないごみ",
        "45": "燃やせないごみ",
        "14": "新聞・雑誌・ダンボール・布類",
        "34": "新聞・雑誌・ダンボール・布類",
        "24": "カン・ビン・ペットボトル",
        "44": "カン・ビン・ペットボトル",
        "02": "プラスチック"
      };
    }
  };

  /**
   *  reset schedule
   */
  app.resetSchedule = function() {
    localStorage.removeItem(this.STORAGE_KEY);
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
   *  get week of day [util function]
   *  @param date target date
   *  @return week of day
   */
  app.getWeekOfDay = function(date) {
    return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
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
