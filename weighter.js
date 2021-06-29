// UTILS

(($) => {

function global(key, ...props) {
	let target = window[key];
	for (const prop of props) {
		target = target[prop];
	}
	return new Proxy(target, {});
}

function floatToNDecimals(float, N) {
	return float.toLocaleString(undefined, {minimumFractionDigits: N});
}


function strToNDecimalFloat(float, N) {
	return parseFloat(parseFloat(float).toFixed(N));
}

function floatToSignedPercent(float) {
	return (float > 0 ? '+' : '') + 
		   float.toLocaleString(undefined, {style: "percent", minimumFractionDigits: 1});
}

class DefaultMap extends Map {
	get(key) {
        return super.get(key) ?? this.defaultVal;
    }
	constructor(defaultVal, ...args) {
		super(...args);
		this.defaultVal = defaultVal;
	}
}

class ZeroMap extends DefaultMap {
	constructor(...args) {
        super(0, ...args);
    }
}

function ordinal_suffix_of(i) { // https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number
    const j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

function decreaseStep(n, times=1, max_step=1) {
    let s = max_step;
    while (times-- > 0) {
        while (s > n) {
            s /= 10;
        }
        n = n - s;
        if (n < s) n = 0.9 * s;
    }
    return n;
}

// CONSTANTS

const charities = global("ACEQuiz", "charities"),
	  Charity = window.ACEQuiz.Charity,
	  TOP_CHARITY = window.ACEQuiz.TOP_CHARITY,
	  STANDOUT_CHARITY = window.ACEQuiz.STANDOUT_CHARITY,
	  quiz = window.ACEQuiz.quiz;

Object.defineProperty(charities, "weights", {
  get() { return charities.map(charity => charity.handicap); },
  set(weights) { return charities.forEach((charity, i) => charity.handicap = weights[i]); }
});

const places_to_points = new ZeroMap([
	[1, 3],
	[2, 1],
	[3, 0.5]
]);

let TOLERANCE_FOR_SUGGESTIONS = 0.1,
	TC_RATIO = 2;

// CHANGES TO PREEXISTING CLASSES
let question_weights_table,
	desired_scores;

Charity.prototype.renderWeightDisplay = function () {
	const id = this.name.replaceAll(' ', '') + "-weight",
		  $range = $("<input>").attr({"id": id, "type": "number", "step": 0.02})
							   .val(this.handicap).data("charity", this),
		  $img = $("<img>").attr({"src": this.links.square_logo, "alt": this.name, "width": "1em", "height": "1em"});
	let $score;

	if (question_weights_table) {
		const [score, explanation] = this.calculateTestScore(true),
			  deviation = this.calculateTestError(); // note this actually computes the test score twice
		$score = $("<details>").html(`<summary><b>${this.name}</b>: ${score} (${floatToSignedPercent(deviation)})</summary>${explanation}`);
		if (deviation < -1 * TOLERANCE_FOR_SUGGESTIONS) $score.addClass("low");
		if (deviation > TOLERANCE_FOR_SUGGESTIONS) $score.addClass("high");
	} else {
		$score = $("<label>").attr("for", id).html(this.name);
	}
	
	$range.change(e => this.handicap = $range.val());
	return $("<li>").append($range, $img, $score);
};

	Charity.prototype.calculateTestScore = function (include_explanation=false) {
		let total = 0, explanation = "";
		for (let [place, times] of this.testing_scores.entries()) {
			if (times === 0) continue;
			place++; // stored 0 indexed before now
			total += places_to_points.get(place) * times;
			if (include_explanation) explanation += (explanation ? ", " : "") + `${ordinal_suffix_of(place)}\u2014${times}`;
		}
		return include_explanation ? [total, explanation] : total;
	};

	Charity.prototype.calculateTestError = function () {
		const desired_score = desired_scores[this.status];
		return (this.calculateTestScore() - desired_score) / desired_score;
	};


// MAIN

function csv_to_question_weights_table(csv) {
	// IMPORTANT - if we change how many answers to rank on a question, this would need updating
	// adapted from here - http://techslides.com/convert-csv-to-json-in-javascript
	var lines = csv.split("\n");
	const result = [],
		  headers  = lines[0].split(",");
	for (let i = 1; i <  lines.length; i++) {
		const map = new ZeroMap(),
			  currentline = lines[i].split(",");
		for (let j = 0; j < headers.length; j++) {
			if (parseInt(currentline[j])) map.set(headers[j], 6 - parseInt(currentline[j]));
		}
		result.push(map);
	}
	return result;
}

function submitNRandomQuizzes(N) {
	for (let i = 0; i < N; i++) {
		for (const question of quiz.questions) {
			if (!question.ranked_options) continue;
			question.reset(true);
			question.render();
			quiz.randomizeAnswers();
		}
		quiz.sendData();
	}
}

function calculateDesiredScores(trials) {
	const total_scores = Array.from(places_to_points.values()).slice(0, charities.length).reduce((a, b) => a + b, 0) * trials,
		  n_top = charities.filter(charity => charity.status === TOP_CHARITY).length,
		  n_standout  = charities.filter(charity => charity.status === STANDOUT_CHARITY).length,
		  desired_top = TC_RATIO * total_scores / (n_standout + (TC_RATIO * n_top)),
		  desired_standout = (1 / TC_RATIO) * desired_top;
	
	//console.log(trials, total_scores, n_top, n_standout, desired_top, desired_standout);
	return {
		[TOP_CHARITY]: desired_top, [STANDOUT_CHARITY]: desired_standout
	};
}

function displayCharities() {
	if (question_weights_table) {
		$("#desired_scores").html(`Desired scores: ${floatToNDecimals(desired_scores[TOP_CHARITY])} for TC, ${floatToNDecimals(desired_scores[STANDOUT_CHARITY])} for SC.`);
		$("#tolerance-for-suggestions").val(TOLERANCE_FOR_SUGGESTIONS * 100);
		updateResults();
	}
	$("#weights ul").html("");
	if (!$("#weights-arr").is(":focus")) $("#weights-arr").html(charities.weights.toString());
	charities.forEach(charity => {
		$charity = charity.renderWeightDisplay();
		$charity.find("input").change(e => {
			charity.handicap = parseFloat(e.target.value);
			displayCharities();
			document.getElementById(e.target.id).focus();
		});
		$charity.appendTo($("#weights ul"));
	});
}

	function updateResults() {
		charities.forEach(charity => charity.testing_scores = new Array(charities.length).fill(0, 0, charities.length));
		for (const weights of question_weights_table) {
			const scored_charities = Charity.getCharitiesSortedByAscendingScores(charities, weights);
			scored_charities.forEach((charity, place) => { charity.testing_scores[place]++; });
		}
	}

function automatically_weight(charities, turns = 350) {
	let step = Math.min(0.01 - 0.1 * (0.1 - TOLERANCE_FOR_SUGGESTIONS), 0.01),
		made_a_change = false,
		last_change,  // charity, increased
		best_weights = charities.weights,
		best_test_error;
	
	updateResults();
	best_test_error = maxTestError(charities);
	while (turns >= 0) {
		updateResults();
		let made_a_change = false;
		for (const charity of charities) {
			const deviation = charity.calculateTestError();
			if (deviation < -1 * TOLERANCE_FOR_SUGGESTIONS) { // score too low, increase weight
				if (last_change?.[0] === charity && !last_change[1]) continue; // is stuck in a loop
				last_change = [charity, true];
				charity.handicap += step;
				made_a_change = true;
				//console.log(charity.name + "+" + step.toFixed(4) + " => " + charity.handicap);
			} else if (deviation > TOLERANCE_FOR_SUGGESTIONS) {  // score too high, decrease weight
				if (last_change?.[0] === charity && last_change[1]) continue;  // is stuck in a loop
				last_change = [charity, false];
				charity.handicap -= step;
				made_a_change = true;
				//console.log(charity.name + "-" + step.toFixed(4) + " => " + charity.handicap);
			}
		}
		if ((!made_a_change || turns % 100 === 0) && maxTestError(charities) < best_test_error) {
			best_weights = charities.weights;
			best_test_error = maxTestError(charities);
			console.log("saving", best_test_error);
					
		}
		if (!made_a_change) {
			if (TOLERANCE_FOR_SUGGESTIONS <= 0.01) break;
			TOLERANCE_FOR_SUGGESTIONS -= 0.01;
			step = Math.min(0.01 - 0.1 * (0.1 - TOLERANCE_FOR_SUGGESTIONS), 0.01);
			last_change = undefined;
		}
		turns--;
	}
	updateResults();
	console.log("saved error: ", best_test_error, "new error: ", maxTestError(charities));
	if (maxTestError(charities) > best_test_error) {
		console.log("changing");
		charities.weights = best_weights;
	}
	TOLERANCE_FOR_SUGGESTIONS = parseFloat(TOLERANCE_FOR_SUGGESTIONS.toFixed(2));
	return charities.forEach(charity => charity.handicap = parseFloat(charity.handicap.toFixed(4)));
}
	function maxTestError(charities) {
		return Math.max(...charities.map(charity => Math.abs(charity.calculateTestError())));
	}

function devpage_init() {
	$(".postupload").hide();
	displayCharities();
	$("#csv").change(e => {
	  const reader = new FileReader();
	  reader.addEventListener('load', (load_event) => {
		  question_weights_table = csv_to_question_weights_table(load_event.target.result);
		  desired_scores = calculateDesiredScores(question_weights_table.length);
		  displayCharities();
		  $(".preupload").hide();
		  $(".postupload").show();
	  });
	  reader.readAsText(e.target.files[0]);
	});
	$("#tolerance-for-suggestions").change(e => {
		TOLERANCE_FOR_SUGGESTIONS = parseInt(e.target.value) / 100;
		displayCharities();
	});
	$("#TC-ratio").change(e => {
		TC_RATIO = parseFloat(e.target.value);
		desired_scores = calculateDesiredScores(question_weights_table.length);
		displayCharities();
	});
	$("#weights-arr").attr("contenteditable", true).on("input", e => {
		charities.weights = e.target.innerHTML.split(",").map(weight => strToNDecimalFloat(weight, 3));
		displayCharities();
	});
	$("#weight_automatically").click(e => {
		$("#automatic_progress").html("Weighting in progress; please be patient.");
		window.setTimeout(() => {
			automatically_weight(charities);
			displayCharities();
			$("#automatic_progress").html("Weighting round complete; press button again to resume.");
		}, 500);
	});
	$("#generate_randoms").click(e => {
		submitNRandomQuizzes($("#n_random_quizzes").val());
	});
}

$(devpage_init);
	
})(jQuery);