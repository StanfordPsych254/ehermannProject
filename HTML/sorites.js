function add(a,b) {return a+b;}
function sum(arr) {return arr.reduce(add,0);}
function mean(arr) {return sum(arr)/arr.length;}
function sd(arr) {
  var mu = mean(arr);
  var squaredDiff = arr.map(function(x){return Math.pow((x-mu),2);});
  return Math.sqrt(sum(squaredDiff)/arr.length);
}

// 48 questions
// an X that costs value is expensive
// an X that costs epsilon less than an expensive X is expensive
var epsilonDeviations = [0.01, 0.1, 0.5, 1, 2, 3];
var valueDeviations = [0, 1, 2, 3, 4];
var items = ["headphones", "sweater", "laptop", "coffee maker", "watch"];

var personalFinanceQuestions = ["In general, how knowledgable would you say you are about personal finance?",
"How would you rate your general knowledge of personal finance compared to the average American?"];
var unshuffledFinanceTerms = ["pre-rated stocks", "fixed-rate deduction", "annualized credit", "tax bracket",
"fixed-rate mortgage", "home equity", "revolving credit", "vesting", "retirement", "stock options", 
"inflation", "private equity fund", "interest rate", "Roth IRA", "whole life insurance"];

var specials = ["pre-rated stocks", "fixed-rate deduction", "annualized credit"];

var nEps = epsilonDeviations.length;
var nVals = valueDeviations.length;
var nItems = items.length;
var nQs = unshuffledFinanceTerms.length + personalFinanceQuestions.length;
var personalFinanceFirst = Math.floor(Math.random()*2);

// For debugging
// nQs = 1;

var inductivePhrasing = shuffle(["conditional", "relative"])[0];

var shuffledFinanceTerms = shuffle(unshuffledFinanceTerms);


function caps(a) {return a.substring(0,1).toUpperCase() + a.substring(1,a.length);}
function uniform(a, b) { return ( (Math.random()*(b-a))+a ); }
function showSlide(id) { $(".slide").hide(); $("#"+id).show(); }
function shuffle(v) { newarray = v.slice(0);for(var j, x, i = newarray.length; i; j = parseInt(Math.random() * i), x = newarray[--i], newarray[i] = newarray[j], newarray[j] = x);return newarray;} // non-destructive.
function be(singular) { if (singular) {return "is";} else {return "are";} }

$(document).ready(function() {
  $("#nQs").html(nQs);
  showSlide("consent");
  $("#mustaccept").hide();
});

var experiment = {
  data: {questions:[]},
  
  instructions: function() {
    if (turk.previewMode) {
      $("#instructions #mustaccept").show();
    } else {
      showSlide("instructions");
      $("#begin").click(function() { experiment.trial(0); })
    }
  },
  
  trial: function(qNumber) {
    var startTime = Date.now();
    $("#trialerror").hide();
    showSlide("trial");
    

    var financeTerm = "N/A";
    var personalFinanceQuestion = "N/A";

    if (personalFinanceFirst) {
      if (personalFinanceQuestions.length > 0) {
        personalFinanceQuestion = personalFinanceQuestions.shift();
        statement = personalFinanceQuestion;
        document.getElementById("miniInstructions").style.display = 'none';
      } else {
        financeTerm = shuffledFinanceTerms.shift();
        statement = financeTerm;
      }
    } else {
      if (shuffledFinanceTerms.length > 0) {
        financeTerm = shuffledFinanceTerms.shift();
        statement = financeTerm;
      } else {
        personalFinanceQuestion = personalFinanceQuestions.shift();
        statement = personalFinanceQuestion;
        document.getElementById("miniInstructions").style.display = 'none';
      }
    }

    $("#statement").html(statement);
    $('.bar').css('width', ( 100*qNumber/(nQs+5) + "%"));
    $("#continue").click(function() {
      var responseRaw = $("#form").serialize();
      if (responseRaw.length < 8) {
        $("#trialerror").show();
      } else {
        $("#continue").unbind("click");
        $('input[name=rating]').attr('checked',false);
        var endTime = Date.now();
        var response = responseRaw.split("=")[1];
        var rt = endTime - startTime;
        experiment.data.questions.push({
          qNumber:qNumber,
          financeTerm:financeTerm,
          personalFinanceQuestion:personalFinanceQuestion,
          response:response,
          rt:rt});
        if (qNumber + 1 < nQs) {
          experiment.trial(qNumber+1);
        } else {
          experiment.FLQuiz();
        }
      }
    })
  },

  FLQuiz: function() {
    //disable return key
    $(document).keypress( function(event){
     if (event.which == '13') {
        event.preventDefault();
      }
    });
    //progress bar complete
    showSlide("FLQuiz");
    $("#FLQuizerror").hide();
    $("#FLformsubmit").click(function() {
      
      rawResponse = $("#FLform").serialize();
      if (rawResponse.length < 77) {
        $("#FLQuizerror").show();
      } else {
        // document.write(rawResponse);
        var score = 0;
        pieces = rawResponse.split("&");
        var q1 = pieces[0].split("=");
        var q1Question = q1[0];
        var q1Answer = q1[1];
        if (q1Answer == "More+than+102") {
          score = score + 1;
        }

        var q2 = pieces[1].split("=");
        var q2Question = q2[0];
        var q2Answer = q2[1];
        if (q2Answer == "Less") {
          score = score + 1;
        }

        var q3 = pieces[2].split("=");
        var q3Question = q3[0];
        var q3Answer = q3[1];
        if (q3Answer == "Fall") {
          score = score + 1;
        }

        var q4 = pieces[3].split("=");
        var q4Question = q4[0];
        var q4Answer = q4[1];
        if (q4Answer == "True") {
          score = score + 1;
        }

        var q5 = pieces[4].split("=");
        var q5Question = q5[0];
        var q5Answer = q5[1];
        if (q5Answer == "False") {
          score = score + 1;
        }

        experiment.data[q1Question] = q1Answer;
        experiment.data[q2Question] = q2Answer;
        experiment.data[q3Question] = q3Answer;
        experiment.data[q4Question] = q4Answer;
        experiment.data[q5Question] = q5Answer;
        experiment.data["FLQuizScore"] = score;

        experiment.questionaire();
        // setTimeout(function() { turk.submit(experiment.data) }, 1000);
      }
    });
  },
  
  questionaire: function() {
    //disable return key
    $(document).keypress( function(event){
     if (event.which == '13') {
        event.preventDefault();
      }
    });
    //progress bar complete
    $('.bar').css('width', ( "100%"));
    showSlide("questionaire");
    $("#formsubmit").click(function() {
      rawResponse = $("#questionaireform").serialize();
      pieces = rawResponse.split("&");
      var age = pieces[0].split("=")[1];
      var lang = pieces[1].split("=")[1];
      var comments = pieces[2].split("=")[1];
      if (lang.length > 0) {
        experiment.data["language"] = lang;
        experiment.data["comments"] = comments;
        experiment.data["age"] = age;
        experiment.data["version"] = "feb6";
        experiment.data["phrasing"] = inductivePhrasing;
        showSlide("finished");
        setTimeout(function() { turk.submit(experiment.data) }, 1000);
      }
    });
  }
}
  
