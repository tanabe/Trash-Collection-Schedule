$(function() {

  var config;

  /**
   *
   */
  var addRule = function(term, day, text) {
    var term = term || 0;
    var day = day || 0;
    var text = text || "";

    var template = $(".ruleTemplate").clone().removeClass("ruleTemplate");
    var terms = $(template.children()[0]);
    var days = $(template.children()[1]);
    terms.children("option[value='" + term + "']").attr("selected", "selected");
    days.children("option[value='" + day + "']").attr("selected", "selected");

    template.children("input").attr("value", text);
    
    $("#rules").append(template);
  }

  /**
   *
   */
  var saveRules = function() {
    var rules = $("#config .rule");
    var config = {};
    rules.each(function(index, rule) {
      var term = $(rule).children("select[name='term']").children("option:selected").attr("value");
      var day = $(rule).children("select[name='day']").children("option:selected").attr("value");
      var text = $(rule).children("input").attr("value");
      config[term + "" + day] = text;
    });
    localStorage.config = JSON.stringify(config);

    location.reload();
  }

  /**
   *
   */
  var deleteRule = function(target) {
    $(target).parent().remove();
  }

  var setDefaultRules = function() {
    localStorage.removeItem("config");
    location.reload();
  }

  /**
   *
   */
  var initConfig = function(config) {
    for (var p in config) {
      var term = p.charAt(0);
      var day = p.charAt(1);
      var text = config[p];
      addRule(term, day, text);
    }
  }

  if (localStorage && localStorage.config) {
    config = JSON.parse(localStorage.config);
  } else {
    //default config
    config = {
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
  initConfig(config);

  var getNumberOfDayOfTheWeek = function(date) {
    return (date.getDate() + 6) / 7 >> 0;
  };

  var getWeekOfMonth = function(date) {
    return (13 + date.getDate() - date.getDay()) / 7 >> 0;
  };

  var getGarbageCollection = function(date) {
    return  config[getNumberOfDayOfTheWeek(date) + "" + date.getDay()] || config["0" + date.getDay()] || "なし";
  };

  var getWeekOfDay = function(date) {
    return ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];
  };

  var render = function() {
    var today = new Date();
    var tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    document.getElementById("today").innerHTML = [
      today.getFullYear(), "年",
      today.getMonth() + 1, "月",
      today.getDate(), "日",
      "(", getWeekOfDay(today), ")",
      "<br>",
      "第", getNumberOfDayOfTheWeek(today), "",
      getWeekOfDay(today), "曜日",
      "<br>",
      //today.getHours(), "時", today.getMinutes(), "分", today.getSeconds(), "秒",
      //"<br>",
      "今日出せるゴミ：",
      getGarbageCollection(today),
      "<br>",
      "明日出せるゴミ：",
      getGarbageCollection(tomorrow)
    ].join("");
  }
  //setInterval(render, 1000);
  render();

  $("#toggleConfigButton").click(function() {
    $("#config").slideToggle();
  });

  $("#config").hide();
});
