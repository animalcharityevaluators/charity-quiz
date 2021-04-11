"use strict";
try { window.takeQuiz = (($) => {

/* CONSTANTS */

const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzapZNftxsGTceBr9a3XU2NWn3o8MYVn8ZmuZhYxRr3VjI94TrsDEIqIHaalpatVbOR/exec",
	  TOP_CHARITY = "Top Charity",
	  STANDOUT_CHARITY = "Standout Charity",
	  PROGRAM = "Estimated impact of programs",
	  ROOM_FOR_MORE_FUNDING = "Room for more funding",
	  COST_EFFECTIVENESS = "Cost effectiveness",
	  TRACK_RECORD = "Track record",
	  LEADERSHIP_AND_CULTURE = "Leadership and culture",
	  STRATEGY = "Strategy",
	  ADAPTABILITY = "Adaptability",
	  STRONG = "Strong",
	  AVERAGE = "Average",
	  WEAK = "Weak",
	  HIGH = "High",
	  MODERATE = "Moderate",
	  LOW = "Low",
	  DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS = "Decreased consumption of animal products",
	  IMPROVEMENT_OF_WELFARE_STANDARDS = "Improvement of welfare standards",
	  INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS = "Increased availability of animal-free products",
	  INCREASED_PREVALENCE_OF_ANTISPECIESIST_VALUES = "Increased prevalence of anti-speciesist values",
	  STRONGER_MOVEMENT = "A stronger animal advocacy movement",
	  MEDIA_OUTREACH = "Media outreach",
	  CONDUCTING_RESEARCH = "Conducting research",
	  PROMOTING_RESEARCH = "Promoting research",
	  INFLUENCER_OUTREACH = "Influencer outreach",
	  CORPORATE_OUTREACH = "Corporate outreach",
	  CAMPUS_OUTREACH = "Campus outreach",
	  INVESTIGATIONS = "Investigations",
	  INFLUENCING_LEGISLATION = "Influencing legislation and legal work",
	  DEMONSTRATIONS = "Demonstrations",
      MOVEMENT_BUILDING = "Movement building",
	  EVENT_ORGANIZING = "Event organizing",
      INSTITUTIONAL_OUTREACH = "Institutional outreach",
	  PLANT_BASED_RESOURCES = "Plant-based resources",
	  DONATE_TO_AMG = "Donate to ACE Movement Grants";

/* How many times more does the criteria score count than the intervention score? */
let CRITERIA_SCORE_WEIGHT = 0.75;

/* What is the maximum (worst) rank an outcome needs to achieve in order for
   interventions influencing that outcome to be asked about? */
let INTERVENTION_FILTER_MAX_OUTCOME_RANK = 2;
	
/* BACKWARDS COMPATABILITY*/
//https://github.com/feross/fromentries
if (!Object.prototype.fromEntries) {
	Object.defineProperty(Object.prototype, 'fromEntries', {
		configurable: true,
		value: function fromEntries (iterable) {
			return [...iterable].reduce((obj, [key, val]) => {
				obj[key] = val;
				return obj;
			}, {});
		},
		writable: true
	});
}

//https://github.com/jonathantneal/array-flat-polyfill
if (!Array.prototype.flat) {
	Object.defineProperty(Array.prototype, 'flat', {
		configurable: true,
		value: function flat () {
			var depth = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
			return depth ? Array.prototype.reduce.call(this, function (acc, cur) {
				if (Array.isArray(cur)) {
					acc.push.apply(acc, flat.call(cur, depth - 1));
				} else {
					acc.push(cur);
				}
				return acc;
			}, []) : Array.prototype.slice.call(this);
		},
		writable: true
	});
}

if (!Array.prototype.flatMap) {
	Object.defineProperty(Array.prototype, 'flatMap', {
		configurable: true,
		value: function flatMap (callback) {
			return Array.prototype.map.apply(this, arguments).flat();
		},
		writable: true
	});
}

/* UTILS */

function jQueryCollection(...$objects) {
	return $objects.reduce(($objects, $object) => $objects.add($object));
}

function shuffle(array, length = array.length) { // Fisher-Yates algorithm
	for (let i = 0; i < length - 2; i++) {
		const j = randomIntBetween(i, array.length);
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array.slice(0, length);
}

	function randomIntBetween(min /* inclusive */, max /* exclusive */) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

function linkifyFirstSubstring(string, substring, url) {
	return string.replace(substring, `<a target="blank" href="${url}">${substring}</a>`);
}

function mergeMaps(maps) {
	return new Map(maps.flatMap(map => Array.from(map.entries())));
}
	
/*function* flattened_entries(obj) {
	for (const [key, value] of Object.entries(obj)) {
		Array.isArray(value) ? yield* value.map(e => [key, e]) : yield [key, value];
	}
}*/
	
function flattened_entries(obj) {
	const ret = [];
	for (const [key, value] of Object.entries(obj)) {
		if (Array.isArray(value)) {
			for (const subvalue of value) {
				ret.push([key, subvalue]);
			}
		} else {
			ret.push([key, value]);
		}
	}
	return ret;
}

function readCookie(name) {
	// from https://www.quirksmode.org/js/cookies.html
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

/* QUIZ-RELATED CLASSES */

class Quiz {
	constructor(questions, results_page, post_url) {
		this.questions = questions;
			this.questions.forEach(question => question.quiz = this);
		this.post_url = post_url; // URL to which a POST request with the quiz's answers will be sumitted
		this.questions_answered = 0;
		this.$render = undefined;
		this.elements = {
			$menu: undefined,
			$next: undefined,
			$previous: undefined,
			$reset: undefined,
		};
		this.results = undefined;
		this.results_page = results_page;
			this.results_page.quiz = this;
	}

	get questions_remaining() { return this.questions.length - this.questions_answered; }
	get is_finished() { return this.questions_remaining === 0; }
	get current_question() {
		return this.is_finished ? this.results_page : this.questions[this.questions_answered];
	}

	get answers() { return mergeMaps(this.questions.map(question => question.answers)); }
	get weights() { return mergeMaps(this.questions.map(question => question.weights)); }
	
	get results_page() { return this._results_page; }
	set results_page(page) {
		this._results_page = page;
		page.quiz = this;
	}

	displayNextQuestion(increment = 1, is_first_question = false) {
		const $question = this.elements.$question;

		if (!is_first_question) {
			this.current_question.render().detach();
			this.questions_answered += increment;
		}

		if (this.questions_remaining < 0) return this.retake();

		$question.html(this.current_question.render());
		this.refreshButtons();
		this.scrollToContainerTop();
		
		if (this.is_finished) this.sendData();
	}

		scrollToContainerTop() {
			$('html, body').scrollTop(this.$render.offset().top);
		}

	sendData() {
		const data = Object.fromEntries(this.answers);
		if (this.results) {
			Object.assign(data, {
				"1st Place": this.results[0],
				"2nd Place": this.results[1],
				"3rd Place": this.results[2],
			});
		}
		data["Google Analytics Client ID"] = readCookie("_ga");
		
		function CORSpost(post_url, data) {
			return $.ajax({
				url: post_url,
            	crossdomain: true,
				type: "POST",
				xhrFields: {
					withCredentials: false
				},
				data: data
			});
		}
		CORSpost(this.post_url, data).done(data => console.log("Results submission status: ", data.message)); //SAVE RESPONSE TO GOOGLE SHEET - comment this out during testing, remove 'done' function when done programming
	}

	refreshButtons() {
		if (this.is_finished) {
			this.displayNextButton("Retake Quiz");
			this.hideResetButton();
		} else if (this.current_question.is_answered) {
			this.displayNextButton();
			this.displayResetButton(this.current_question.reset_text);
		} else if (this.current_question.is_skippable) {
			this.displayNextButton("Skip This Question");
			this.hideResetButton();
		} else {
			this.hideNextButton();
			this.hideResetButton();
		}

		if (this.questions_answered > 0) {
			this.displayPreviousButton();
		} else {
			this.hidePreviousButton();
		}
	}

		displayResetButton(text = "Reset") {
			this.elements.$reset.html(text).css("visibility", "visible");
		}

		hideResetButton() {
			this.elements.$reset.css("visibility", "hidden");
		}

		displayPreviousButton(text = "Previous Question") {
			this.elements.$previous.html(text).css("visibility", "visible");
		}

		hidePreviousButton() {
			this.elements.$previous.css("visibility", "hidden");
		}

		displayNextButton(text = (this.questions_remaining === 1) ? "Submit Quiz" : "Next Question") {
			this.elements.$next.html(text).css("visibility", "visible");
		}

		hideNextButton() {
			this.elements.$next.css("visibility", "hidden");
		}

	render() {
		if (this.$render) return this.$render;

		const $question = this.elements.$question = $("<fieldset>");
		this.$render = $("<form class='quiz'>").append($question, this.renderMenu());
	
		this.displayNextQuestion(1, true);
		return this.$render;
	}
	
		renderMenu() {
			if (this.elements.$menu) return this.elements.$menu;

			const $menu = this.elements.$menu = $("<menu>"),
				  $previous = this.elements.$previous = $("<button>").html("Previous Question"),
				  $reset = this.elements.$reset = $("<button>").html("Reset"),
				  $next = this.elements.$next = $("<button>").html("Skip This Question");

			$next.click(() => this.displayNextQuestion());
			$reset.click(() => this.current_question.reset());
			$previous.click(() => this.displayNextQuestion(-1));

			jQueryCollection($previous, $reset, $next).attr("type", "button").appendTo($menu);
			$menu.click(event => event.target.blur());

			return $menu;
		}
	
	retake() {
		this.questions_answered = 0;
		this.questions.forEach(question => question.reset(true));
		this.displayNextQuestion(1, true);
	}
}

class RankQuestion {
	constructor(prompt, options, max_rank=5, is_skippable=true, normalise_if_blank=true) {
		this.prompt = prompt;
		this.options = shuffle(options);
			this.options.forEach(option => option.question = this);
		this.max_rank = max_rank;
		this.is_skippable = is_skippable;
		this.normalise_if_blank = normalise_if_blank;
		this.instructions = `Click up to ${this.max_rank} choices to rank them from most important to least important.`;
		this.reset_text = "Reset Ranks";
		this.options_ranked = 0;
		this.$render = undefined;
		this.is_answered = false;
		this.quiz = undefined;
		this.filter = undefined;
	}
	
	get filtered_options() {
		return this.filter ? this.options.filter(this.filter) : this.options;
	}
	get ranked_options() { return this.options.filter(option => !isNaN(option.rank)); }
	get top_choice() { return this.options.find(option => option.rank === 1); }
	
	get total_weight() {
		let weight = 0;
		for (let i = 0; i < this.max_rank; i++) {
			weight += this.weightFromRank(i);
		}
		return weight;
	}
	
	get weights() {
		const weights = new Map(),
			  uniform_weight = this.normalise_if_blank ? (this.total_weight / this.options.length) : 0;
		for (const option of this.options) {
			const weight = this.is_answered ? this.weightFromRank(option.rank) : uniform_weight;
			weights.set(option.text, weight);
		}
		return weights;
	}
	get answers() {
		const answers = new Map();
		for (const option of this.options) {
			if (option.rank > 0) answers.set(option.text, option.rank);
		}
		return answers;
	}

	render() {
		if (this.$render && !this.filter) return this.$render;
		if (this.filter && !this.ranked_options.every(this.filter)) this.reset();

		const $prompt = $("<legend>").html(this.prompt),
			  $instructions = $("<p>").html(this.instructions),
			  $options = $("<dl>").append(this.filtered_options.map(option => option.render())),
			  $render = this.$render = jQueryCollection($prompt, $instructions, $options);

		return $render;
	}

	assignNextRankTo(option) {
		if (this.options_ranked === this.max_rank) return;
		option.rank = ++this.options_ranked;
		this.is_answered = true;
		this.quiz.refreshButtons();
	}

	clearRanksBeyond(rank) {
		for (const option of this.options) {
			if (option.rank > rank) option.rank = NaN;
		}
		if (rank < this.options_ranked) this.options_ranked = rank;
		if (rank == 0) {
			this.is_answered = false;
			this.quiz.refreshButtons();
		}
	}
	
	reset(rerender = false) {
		if (rerender) {
			this.$render = undefined;
			this.options = shuffle(this.options);
		}
		this.clearRanksBeyond(0);
	}
	
	weightFromRank(rank) { return (rank > 0) ? 1 + this.max_rank - rank : 0; }
	
}

class BinaryRadioQuestion {
	constructor(key, prompt, instructions, yes_text, no_text, is_skippable = false) {
		this.prompt = prompt;
		this.key = key;
		this.id_prefix = key.replace(/ /g, '');
		this.is_skippable = is_skippable;
		this.instructions = instructions;
		this.yes_text = yes_text;
		this.no_text = no_text;
		this.$render = undefined;
		this.elements = {};
		this.quiz = undefined;
		this._answer = undefined;
	}
	
	get is_answered() { return this._answer !== undefined; }

	get answer() { return this._answer; }
	set answer(answer) {
		this._answer = answer;
		this.quiz.refreshButtons();
	}
	
	reset(rerender = false) {
		if (rerender) {
			this.elements = {};
			this.$render = undefined;
		}
		this.answer = undefined;
		if (this.elements.$options) this.elements.$options.find("input").prop('checked', false);
	}
	
	createOption(text, value, $options) {
		const $input = $("<input>").attr({
				  type: 'radio',
				  id: this.id_prefix + '-' + value,
				  name: this.id_prefix,
				  'data-value': value
			  }), $label = $("<label>").attr(
				  'for', this.id_prefix + '-' + value
			  ).html(text);
		$input.change(event => this.answer = ($(event.target).attr('data-value') === 'true'));
		return $("<div>").addClass('radio-option').append($input, $label);
	}

	render() {
		if (this.$render) return this.$render;

		const $prompt = $("<legend>").html(this.prompt).addClass("quiz-question-prompt"),
			  $options = this.elements.$options = $("<div class='radio-question-options'>"),
			  $yes = this.createOption(this.yes_text, true).appendTo($options),
			  $no = this.createOption(this.no_text, false).appendTo($options);
		let $instructions;

		if (this.instructions) {
			$instructions = this.instructions[0] == "<" ? $(this.instructions) : $("<p>").html(this.instructions);
			$instructions.addClass("quiz-question-instructions");
		} else {
			$instructions = $("");
		}

		return (this.$render = jQueryCollection($prompt, $instructions, $options));
	}
	
	get weights() { return new Map([[this.key, this.answer]]); }
	get answers() { return this.weights; }
}

class RankOption {
	constructor(text, description, iconHTML) {
		this.text = text;
		this.description = description;
		this.iconHTML = iconHTML;
		this.elements = {};
		this.question = undefined;
	}
	
	display_name(data) {
		return this.text;
	}

	render() {
		if (this.elements.$container) return this.elements.$container;

		const $text = $("<dt>").html(this.text),
			  $description = this.elements.$description = $("<dd>").html(this.description),
			  $container = this.elements.$container = $("<div>").addClass("rank-option");
	
		if (this.iconHTML) $container.append($(this.iconHTML).addClass("rank-icon"));
		$container.append($text, $description).click(() => this.onClick());
		this.rank = NaN;
		return $container;
	}
	
	onClick() {
		if (this.rank) {
			this.question.clearRanksBeyond(this.rank - 1);
		} else {
			this.question.assignNextRankTo(this);
		}
	}

	get rank() {
		return this.elements.$container ? parseInt(this.elements.$container.attr("data-rank")) : NaN;
	}
	set rank(rank) {
		const $container = this.elements.$container;

		if (rank === this.rank || !$container) return;
		rank ? $container.attr("data-rank", rank) :	$container.removeAttr("data-rank");
	}
}

/* CHARITY-RELATED CLASSES */

class Criterion {
	constructor(performance, confidence) {
		this.performance = performance;
		this.confidence = confidence;
	}
	get performance_score() {
		return Criterion.PERFORMANCE_VALUES.get(this.performance);
	}
	get confidence_score() {
		let multiplier = 0;
		if (this.performanceScore > 0) multiplier = 1;
		if (this.performanceScore < 0) multiplier = -1;
		return multiplier * Criterion.CONFIDENCE_VALUES.get(this.confidence);
	}
	score() { return this.performance_score + this.confidence_score; }
}
	Criterion.READOUT_NAMES = new Map([
		[PROGRAM, "the estimated impact of their programs"],
		[ROOM_FOR_MORE_FUNDING, "their room for more funding"],
		[COST_EFFECTIVENESS, "their cost effectiveness"],
		[TRACK_RECORD, "their track record of success"],
		[ADAPTABILITY, "their response to success and failure"],
		[LEADERSHIP_AND_CULTURE, "their leadership and culture"],
		[STRATEGY, "their strategic vision"],
		[ADAPTABILITY, "their adaptability"]
	]);

	Criterion.PERFORMANCE_VALUES = new Map([
		[STRONG, 3],
		[AVERAGE, 0],
		[WEAK, -3]
	]);

	Criterion.CONFIDENCE_VALUES = new Map([
		[HIGH, 1],
		[MODERATE, 0.5],
		[LOW, 0]
	]);

class Intervention {
	constructor(display_name, ...outcomes_influenced) {
		this.display_name = display_name;
		this.outcomes_influenced = outcomes_influenced;
	}
	
	influences(outcome) {
		return this.outcomes_influenced.flat().includes(outcome);
	}
	
		directly_influences(outcome) {
			for (let influenced_outcome in this.outcomes_influenced) {
				if (Array.isArray(influenced_outcome)) influenced_outcome = influenced_outcome[0];
				if (influenced_outcome === outcome) return true;
			}
			return false;
		}
	
	score(weights) {
		let score = 0;
		// `weights`: of the form `Map({[MOVEMENT_BUILDING]: 4, [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS]: 5})`
		for (const outcome of this.outcomes_influenced) {
			if (!Array.isArray(outcome)) {
				score += weights.get(outcome);
			} else {
				// `outcome[0]`: directly influenced outcome (e.g. "Stronger Animal Advocacy Movement")
				// `outcome.splice(1)`: array of indirectly influenced outcomes (e.g. ["Decreased Consumption of Animal Products", "Improvement of Welfare Standards"])
				score += Math.pow(weights.get(outcome[0]), 1/4);
				for (const indirect_outcome of outcome.splice(1)) {
					score += Math.sqrt(weights.get(outcome[0]) * weights.get(indirect_outcome));
				}
			}
		}
		return score;
	}
}
	
class Charity {
	constructor(name, status) {
		this.name = name;
		this.status = status;
		this.handicap = 1;
		this.rank = NaN;
		this.testing_score = 0; // for use in development

		this.make_link_in_first_use_of_name = true; // When a description of the charity is set, should the first use of the charity's name be made into a link?
		this.uses_article = false; // When using the charity's name in a sentence, is it preceded by "the"?

		this.links = {};
		this.elements = {
			$card_1: undefined,
			$card_2: undefined,
			$card_3: undefined,
			$small_card: undefined
		};
		this.description = "";
		this.why_recommended = "";
	}
	
	get interventions() { return this._interventions; }
	set interventions(dict) {
		this._interventions = dict;
		for (const key of Object.keys(dict)) {
			if (!Array.isArray(dict[key])) this._interventions[key] = [dict[key]];
		}
	}
	
	get links() { return this._links; }
	set links(value) {
		this._links = value;
		if (this.status === TOP_CHARITY) this._links.donation = "https://animalcharityevaluators.org/donate/";
	}

	get description() { return this._description || this._short_description; }
	set description(value) { this._description = this.linkifyFirstUseOfName(value); }
	get short_description() { return this._short_description || this._description; }
	set short_description(value) { this._short_description = this.linkifyFirstUseOfName(value); }
	
		linkifyFirstUseOfName(string) {
			if (this.links.website && this.make_link_in_first_use_of_name) {
				return linkifyFirstSubstring(string, this.name, this.links.website);
			} else { return string; }
		}
	
/*  applyNeglectedCountryBonus(weight) {
		// This was removed from the quiz, since working in neglected countries is no longer used to distinguish special interest standout charities, and no charity's theory of change includes an intervention like "International Expansion".
		const bonus = new Intervention();
		for (const intervention of Object.values(this.interventions)) {
			for (const [outcome, effect] of Object.entries(intervention.effect_on_outcomes)) {
				if (!(outcome in bonus.effect_on_outcomes)) bonus.effect_on_outcomes[outcome] = 0;
				const multiplier = weight + (outcome === WORKING_IN_NEGLECTED_COUNTRIES ? 1 : 0);
				bonus.effect_on_outcomes[outcome] += multiplier * effect;
			}
		}
		this.interventions[WORKING_IN_NEGLECTED_COUNTRIES] = bonus;
	}
*/
	
	render() {
		const $li = $("<li>").addClass("charity-info").attr({
			"data-rank": this.rank,
			"data-charity": this.name
		});
		if (this.rank <= 3)  return $li.append(this.renderBigCard());
		if (this.rank > 3)   return $li.append(this.renderSmallCard());
	}
	
		makeDetails() {
			const $description = $("<details open>").html(this.rank < 3 ? this.description : this.short_description),
				  $description_summary = $("<summary>").html("What they do").prependTo($description),
				  $why_recommended = $(`<details ${this.rank === 1 ? "open" : ""}>`).html(this.why_recommended),
				  $why_recommended_summary = $("<summary>").html("Why we recommend them").prependTo($why_recommended);

			return jQueryCollection($description, $why_recommended);
		}

		makeExtButton(text, link) {
			if (link && text) {
				return $("<a>").addClass('ace-button').attr({
						  "href": link,
						  "target": link
						}).html(text);
			}
		}

		makeLogo() {
			let src = this.links.long_logo;
			if (!src || this.rank > 1) {
				src = this.links.logo || src;
			} if (!src || this.rank > 3) {
				src = this.links.square_logo || src;
			}
			return $("<img>").attr({"src": src, "alt": this.name});
		}

		makeBigCard() {
			const $logo = this.makeLogo(),
				  $title = (this.links.logo || this.links.long_logo) ? $("") : $("<h4>").html(this.name),
				  $details = this.makeDetails(),
				  $donation = this.makeExtButton("Donate Now", this.links.donation),
				  $review = this.makeExtButton("Read Review", this.links.review),
				  $menu = $("<menu>").append($donation, $review);

			return jQueryCollection($logo, $title, $details, $menu);
		}
	
		renderBigCard() {
			const key = `$card_${this.rank}`;
			return (this.elements[key] || (this.elements[key] = this.makeBigCard()));
		}

		renderSmallCard() {
			if (this.elements.$small_card) return this.elements.$small_card;

			const $logo = this.makeLogo(),
				  $title = $("<h4>").html(this.name),
				  $button = this.makeExtButton("Read Review", this.links.review);

			return (this.elements.$small_card = jQueryCollection($logo, $title, $button));
		}
	
	score(weights) {
		return ((CRITERIA_SCORE_WEIGHT * this.scoreCriteria(weights)) +
			    this.scoreInterventions(weights)) * this.handicap;
	}
	
		scoreCriteria(weights) {
			let score = 0;
			for (const [key, criterion] of Object.entries(this.criteria)) {
				score += weights.get(key) * criterion.score();
			}
			return score;
		}

		scoreInterventions(weights) {
			let score = 0;
			for (const [key, intervention] of flattened_entries(this.interventions)) {
				score += weights.get(key) * intervention.score(weights);
			}
			return score;
		}
	
	static getComparisonFunctionWithWeights(weights) {
		return (a, b) => b.score(weights) - a.score(weights);
	}

	static getCharitiesSortedByAscendingScores(charities, weights) {
		return charities.slice().sort(Charity.getComparisonFunctionWithWeights(weights));
	}

	static getCharityWithHighestScore(charities, weights) {
		return this.getCharitiesSortedByAscendingScores(charities, weights)[0];
	}
}

/* CHARITY DATA */

const ASF = new Charity("The Albert Schweitzer Foundation", TOP_CHARITY);

	ASF.criteria = { //updated for 2020
		[PROGRAM]: new Criterion(STRONG, HIGH),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(AVERAGE, HIGH),
		[COST_EFFECTIVENESS]: new Criterion(WEAK, LOW),
		[TRACK_RECORD]: new Criterion(AVERAGE, MODERATE),
		[LEADERSHIP_AND_CULTURE]: new Criterion(AVERAGE, LOW),
		[STRATEGY]: new Criterion(STRONG, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, HIGH)
	};

	ASF.interventions = { //updated for 2020
		[CORPORATE_OUTREACH]: [
			new Intervention("corporate outreach", IMPROVEMENT_OF_WELFARE_STANDARDS),
			new Intervention("corporate campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS)
		],
		[INFLUENCING_LEGISLATION]: new Intervention("legal work", IMPROVEMENT_OF_WELFARE_STANDARDS),
		[MOVEMENT_BUILDING]: new Intervention("advocacy training", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]), //consumption & welfare are indirect
    [CONDUCTING_RESEARCH]: new Intervention("advocacy research", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]), //consumption & welfare are indirect
		[INSTITUTIONAL_OUTREACH]: new Intervention("working with companies to promote plant-based alternatives", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //consumption is indirect
	};
	
	ASF.links = {
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/ASF_albert-schweitzer-foundation-logo_long_rgb_official.png", //wide
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2021/03/ASF_albert-schweitzer-foundation-logo_stacked_RGB_2018.png",
		review: "https://animalcharityevaluators.org/charity-review/albert-schweitzer-foundation",
		website: "http://www.albertschweitzerfoundation.org/#utm_source=ace&utm_medium=web&utm_campaign=ace"
	};

	ASF.description = "The Albert Schweitzer Foundation (ASF) was founded in 2000. ASF primarily works in Germany, though they have a team in Poland as well. ASF works as a nonprofit \
(rather than making grants like a typical foundation). They work to improve animal welfare standards through their corporate outreach, corporate campaigns, and legal work. They also \
work with companies (distributors, producers, and restaurants) to promote plant-based alternatives to animal products. In addition, ASF works to build the capacity of the movement by \
organizing workshops and training sessions.";

	ASF.short_description = "The Albert Schweitzer Foundation (ASF) works to improve animal welfare standards through their corporate outreach, corporate campaigns, and legal work. \
They operate primarily in Germany and have strong, impactful programs and a strategic approach. We believe that ASF's corporate outreach on behalf of farmed fishes and chickens \
is particularly promising, given the large number of animals killed and the neglectedness of advocacy on their behalf.";

	ASF.why_recommended = "ASF's work seems highly effective at increasing the availability of animal-free products, improving farmed animal welfare standards, and strengthening the capacity \
of the movement. We are hopeful that their strategy and skills will lead to meaningful progress in Poland and other parts of Central and Eastern Europe, areas with relatively young animal \
advocacy movements. We believe that ASF's work prioritizing corporate outreach on behalf of farmed fishes and chickens raised for meat is particularly promising, given the large number of \
farmed chickens and fishes killed and the neglectedness of advocacy on their behalf. \n We find ASF to be an excellent giving opportunity because of their strong, impactful programs and their \
strategic approach to improving welfare standards for farmed animals.";
	
  ASF.uses_article = true;



const GFI = new Charity("The Good Food Institute", TOP_CHARITY);

	GFI.criteria = { //updated for 2020
		[PROGRAM]: new Criterion(STRONG, MODERATE),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(STRONG, HIGH),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, HIGH),
		[TRACK_RECORD]: new Criterion(STRONG, HIGH),
		[LEADERSHIP_AND_CULTURE]: new Criterion(STRONG, HIGH),
		[STRATEGY]: new Criterion(STRONG, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, MODERATE)
	};

	GFI.interventions = { //updated for 2020
		[INFLUENCING_LEGISLATION]: [
      new Intervention("legislative advocacy", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
      new Intervention("lobbying", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
    ],
    [MOVEMENT_BUILDING]: new Intervention("community organizing", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption & welfare are indirect
    [CAMPUS_OUTREACH]: new Intervention("campus outreach", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS], //consumption is indirect
                                        [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //welfare & consumption are indirect
    [EVENT_ORGANIZING]: new Intervention("event organizing", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
    [INSTITUTIONAL_OUTREACH]: new Intervention("working with companies to promote plant-based alternatives", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
    [CONDUCTING_RESEARCH]: new Intervention("research on animal product alternatives", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS], //consumption & welfare are indirect
                                           [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
	};

	GFI.description = "The Good Food Institute (GFI) was founded in 2016. GFI currently operates in the United States, Brazil, India, Hong Kong, Singapore, Europe, and Israel, where they work to increase the \
availability of animal-free products through supporting the development and marketing of plant-based and cell-cultured alternatives to animal products. For this, they make use of legislative advocacy, \
lobbying, corporate engagement, event organizing, research, and campus outreach. Their support of research, potential new talent, and the start-up community around alternative protein research also \
strengthens the capacity of the animal advocacy movement.";

	GFI.short_description = "The Good Food Institute (GFI) is working to transform the animal agriculture industry by developing and promoting alternative proteins, including cell-cultured products. \
They currently operate in the United States, Brazil, India, Hong Kong, Singapore, Europe, and Israel. GFI has strong, cost-effective programs, a good track record with increasing the availability of \
animal-free products and strengthening the movement, and a healthy organizational culture.";

	GFI.why_recommended = "Developing and promoting alternatives to animal products is a promising way to transform the animal agriculture industry. We think GFI runs effective programs for increasing \
the availability of animal-free products and strengthening the movement. GFI is one of few charities focusing on cell-cultured alternatives to animal products. \n We find GFI to be an excellent giving \
opportunity because of their strong, cost-effective programs, their track record in increasing the availability of animal-free products and strengthening the movement, and their healthy organizational culture.";
  
	GFI.links = {
		review: "https://animalcharityevaluators.org/charity-review/the-good-food-institute",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2021/03/GFI_Primary_Seaweed_Black@4x.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/11/tc-gfi.png",
		website: "https://www.gfi.org"
	};

const THL = new Charity("The Humane League", TOP_CHARITY);

	THL.criteria = {
		[PROGRAM]: new Criterion(STRONG, HIGH),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(STRONG, LOW),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, HIGH),
		[TRACK_RECORD]: new Criterion(STRONG, HIGH),
		[LEADERSHIP_AND_CULTURE]: new Criterion(STRONG, HIGH),
		[STRATEGY]: new Criterion(STRONG, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, HIGH)
	};

	THL.interventions = { //updated for 2020
		[CORPORATE_OUTREACH]: [
      new Intervention("corporate outreach", IMPROVEMENT_OF_WELFARE_STANDARDS),
      new Intervention("corporate campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS)
    ],
    [MEDIA_OUTREACH]: new Intervention("media outreach", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [MOVEMENT_BUILDING]: new Intervention("supporting other advocacy organizations", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS]), //welfare is indirect
    [CONDUCTING_RESEARCH]: new Intervention("advocacy research", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS]), //welfare is indirect
    [CAMPUS_OUTREACH]: new Intervention("campus outreach", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS]) //welfare is indirect
	};

	THL.description = "The Humane League (THL) was founded in 2005. THL currently operates in the U.S., Mexico, the United Kingdom, and Japan, where they work to improve animal welfare standards \
through their corporate outreach, media outreach, and grassroots campaigns. They also work to strengthen the animal advocacy movement by producing advocacy research, organizing community \
outreach, training advocates, hosting conferences, recruiting advocates on college campuses, and supporting animal advocacy organizations. They work to build the animal advocacy movement \
internationally through the Open Wing Alliance (OWA), a coalition founded by THL whose mission is to end battery cages globally. THL also works to decrease the consumption of animal products \
through seasonal promotion of the Veganuary veg*n pledge program.";

	THL.short_description = "The Humane League (THL) currently operates in the U.S., Mexico, the United Kingdom, and Japan, where they run strong, cost-effective programs, especially their \
corporate campaigns to increase welfare standards. They have a robust track record of strengthening the global movement by producing research, engaging in community outreach, organizing \
conferences, and training advocates and organizations through the Open Wing Alliance.";

	THL.why_recommended = "We believe that THL's corporate campaigns and work to strengthen the animal advocacy movement are especially strong, and they often take the lead in collaborating \
with other groups to facilitate knowledge-sharing about their strategic approach. They seem to have played an important role in strengthening the animal advocacy movement outside the U.S. \
through their work producing advocacy research; training, recruiting, and supporting advocates and organizations through the OWA; engaging in community outreach; and organizing conferences. \n \
We find THL to be an excellent giving opportunity because of their strong, cost-effective programs, their robust track record of strengthening the movement, and their healthy organizational culture.";

	THL.links = {
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/thl-logo-charity-quiz-2020.jpg",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2019/03/thl-mended-heart-logo@2x-315x315@2x.jpg",
		long_logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/THL_the-humane-league-logo_long_2color_@2x_2019.png",
		review: "https://animalcharityevaluators.org/charity-review/the-humane-league",
		website: "https://thehumaneleague.org/"
	};
  
const WAI = new Charity("Wild Animal Initiative", TOP_CHARITY);
  	WAI.interventions = { //updated for 2020
		[EVENT_ORGANIZING]: new Intervention("event organizing", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS]),
		[CONDUCTING_RESEARCH]: new Intervention("research on wild animal welfare", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //consumption & welfare are indirect
  	};
	
  	WAI.criteria = { //updated for 2020
    	[PROGRAM]: new Criterion(STRONG, LOW),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(STRONG, MODERATE),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, LOW),
		[TRACK_RECORD]: new Criterion(WEAK, LOW),
		[LEADERSHIP_AND_CULTURE]: new Criterion(STRONG, LOW),
		[STRATEGY]: new Criterion(STRONG, HIGH),
		[ADAPTABILITY]: new Criterion(AVERAGE, HIGH)
  };
  
  WAI.description = "Wild Animal Initiative (WAI) was founded in 2019. WAI currently operates in the U.S., where they work to strengthen the animal advocacy movement through creating \
an academic field dedicated to wild animal welfare. They compile literature reviews, write theoretical and opinion articles, and publish research results on their website and/or in \
peer-reviewed journals. WAI focuses on identifying and sharing possible research avenues and connecting with more established fields. They also work with researchers from various \
academic and non-academic institutions to identify potential collaborators, and they recently launched a grant assistance program. WAI also co-organizes the annual Wild Animal \
Welfare Summit and hosts discussions at conferences.";

	WAI.short_description = "Wild Animal Initiative (WAI), based in the U.S., is one of only a few charities conducting and promoting research to help wild animals. We believe \
that WAI's goal of building an academic field for wild animal welfare is an ambitious but promising avenue for creating long-term change. WAI has a strong strategy and a healthy \
organizational culture.";

	WAI.why_recommended = "WAI is working in an important and relatively neglected area: conducting and promoting research to help wild animals. We believe that building an \
academic field is an ambitious but promising avenue for creating change for wild animals in the long term. There are few charities working in this area, and WAI seems to have \
a responsible and thorough approach to building a collaborative community of researchers and advocates as well as a strong strategy and healthy organizational culture.\n \
We find Wild Animal Initiative to be an excellent giving opportunity because of their strong, cost-effective programs and their thorough strategy.";

	WAI.links = {
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2021/03/WAI-logo-square-teal-on-white.png",
    logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/11/wai-logo-horiz-featured@2x.png",
		review: "https://animalcharityevaluators.org/charity-review/wild-animal-initiative",
		website: "https://www.wildanimalinitiative.org"
	};
  
const AI = new Charity("Anima International", STANDOUT_CHARITY);

	AI.criteria = { //updated for 2020
		[PROGRAM]: new Criterion(STRONG, HIGH),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(STRONG, HIGH),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW),
		[TRACK_RECORD]: new Criterion(STRONG, MODERATE),
		[LEADERSHIP_AND_CULTURE]: new Criterion(WEAK, MODERATE),
		[STRATEGY]: new Criterion(AVERAGE, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, MODERATE)
	};

	AI.interventions = { //updated for 2020
		[CORPORATE_OUTREACH]: [
			new Intervention("corporate outreach", IMPROVEMENT_OF_WELFARE_STANDARDS),
      new Intervention("corporate campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS)
      ],
    [INVESTIGATIONS]: new Intervention("investigations", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [INFLUENCING_LEGISLATION]: new Intervention("legal work", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [MEDIA_OUTREACH]: new Intervention("media outreach", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [DEMONSTRATIONS]: new Intervention("protests", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [MOVEMENT_BUILDING]: [
      new Intervention("community organizing", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //welfare & consumption are indirect
      new Intervention("advocacy trainings", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //welfare & consumption are indirect
    ],
    [INFLUENCER_OUTREACH]: new Intervention("building alliances with key influencers", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //welfare & consumption are indirect
    [EVENT_ORGANIZING]: new Intervention("event organizing", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS], [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //welfare & consumption are indirect
    [INSTITUTIONAL_OUTREACH]: new Intervention("institutional campaign",[INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
    [CONDUCTING_RESEARCH]: new Intervention("research on animal product alternatives", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
  };

	AI.description = "Anima International was founded in 2018 as an umbrella of several organizations, including Anima, which has been working in Scandinavia since 2000, and Otwarte Klatki \
(Open Cages), which has been working in Poland and other countries in Eastern Europe, including Lithuania, Estonia, and Ukraine, since 2012. Anima International's ten member organizations \
currently work in Denmark, Poland, Lithuania, Belarus, Estonia, Norway, Ukraine, the United Kingdom, Russia, and France. Anima International works to improve welfare standards for farmed \
animals through corporate outreach, investigations, legislative work, and media outreach. They also work to increase the availability of animal-free products by conducting research, hosting \
events, and working with companies to encourage the development of the alternative protein industry. In addition, Anima International works to strengthen the capacity of the animal advocacy \
movement through organizing community outreach, training advocates, supporting other animal advocacy organizations, and advancing the field of animal law.";

	AI.short_description = "Anima International is an umbrella of several organizations working primarily in relatively neglected areas of Eastern Europe. They have a strong track record \
and run effective programs, and their strategy of expanding their reach by finding and supporting autonomous local groups seems like an especially promising way to build the capacity of the movement.";

	AI.why_recommended = "Anima International operates in Eastern Europe and Russia, where we believe animal advocacy is relatively neglected. They run effective programs, and their \
strategy of expanding their reach by finding and supporting autonomous local groups seems like an especially promising way to build the capacity of the movement.\n \
We find Anima International to be an excellent giving opportunity due to their impactful programs and their strong track record of building the capacity of the movement \
in relatively neglected areas in Eastern Europe.";
  
	AI.links = {
    donation: "https://animainternational.org/donate",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/anima-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2019/11/anima-international-logo-square@2x-630x630.png",
		review: "https://animalcharityevaluators.org/charity-review/anima",
		website: "https://animainternational.org/"
	};

const CIWF = new Charity("Compassion in World Farming USA", STANDOUT_CHARITY);

	CIWF.criteria = { //updated for 2020
    	[PROGRAM]: new Criterion(STRONG, LOW), //2019 C1
		[ROOM_FOR_MORE_FUNDING]: new Criterion(WEAK, MODERATE), //2019 C2
		[COST_EFFECTIVENESS]: new Criterion(WEAK, MODERATE), //2019 C4
		[TRACK_RECORD]: new Criterion(AVERAGE, MODERATE), //2019 C3
		[LEADERSHIP_AND_CULTURE]: new Criterion(STRONG, MODERATE), //per Jamie S, since 2019 criteria were different
		[STRATEGY]: new Criterion(STRONG, LOW), //per Jamie S, since 2019 criteria were different
		[ADAPTABILITY]: new Criterion(AVERAGE, LOW) //per Jamie S, since 2019 criteria were different
  };
  CIWF.interventions = { //updated for 2020
		[CORPORATE_OUTREACH]: new Intervention("welfare campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [INFLUENCING_LEGISLATION]: new Intervention("grassroots campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [MEDIA_OUTREACH]: [
      new Intervention("media outreach", IMPROVEMENT_OF_WELFARE_STANDARDS),
      new Intervention("online outreach", IMPROVEMENT_OF_WELFARE_STANDARDS)
    ],
    [CONDUCTING_RESEARCH]: new Intervention("welfare research", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS]) //welfare is indirect
	};

	CIWF.description = "Compassion in World Farming is an international organization working to improve farmed animal welfare. Their mission is to end all factory farming practices \
and advance the well-being of farmed animals globally. Founded in 1967 by a British dairy farmer against the introduction of factory farming practices and the increasingly poor \
conditions in which animals were being kept, they have nearly 50 years of campaigning experience.\n \
In 2011 they formed a branch specific to the United States. This review focuses on their U.S. branch only.1 In the U.S., they are focused on changing corporate practices and policies \
through corporate campaigns, their Food Business program, and their 25×25 program. These programs seek to influence retailers, food services, and manufacturers to adopt animal welfare \
policies and practices that measurably improve the lives of farmed animals or reduce the number of animals in supply chains. In support of this, they run initiatives to harness public \
engagement to influence these companies. To a smaller extent, they also support national legislative efforts as they pertain to banning close confinement systems and &ldquo;ag-gag&CloseCurlyDoubleQuote; bills.";
  
	CIWF.short_description = "Compassion in World Farming USA is the U.S. branch of an international organization that has been working for nearly 50 years to end all factory \
farming practices and improve the well-being of farmed animals globally. In the U.S., their corporate campaign programs seek to influence companies and manufacturers to adopt \
stronger animal welfare policies or reduce the number of animals in their supply chains. They also support animal welfare legislation and &ldquo;ag-gag&CloseCurlyDoubleQuote;Close bills.";
  
	CIWF.why_recommended = "Compassion USA focuses on reducing the suffering of farmed animals, which we believe is a high-impact cause area. They engage in programs \
that seem likely to be highly impactful for animals in the short to medium term and that have the potential to be impactful in the long term when implemented thoughtfully: \
For instance, their corporate outreach campaigns to improve the welfare of broiler chickens and egg-laying hens are likely to reduce the suffering of a large number of animals. \
What's more, their recent program to reduce the number of animals in food supply chains has the potential to reduce a large amount of animal products in major food businesses, \
and therefore to spare many farmed animals.\n \
In general, we believe that Compassion USA has a strong commitment to effectiveness: They have demonstrated an ability to self-identify areas of success and failure and respond \
appropriately, and their strategy seems to be impact-driven and thoughtfully implemented based on research.";
  
	CIWF.links = {
		donation: "https://donate.ciwf.com/page/12128/donate/1",
		review: "https://animalcharityevaluators.org/charity-review/compassion-in-world-farming-usa-ciwf/",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/CIWF-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2016/09/logo-compassion-in-world-farming-usa-2400x2400-315x315@2x.jpg",
		website: "https://www.ciwf.com/"
	};
  
  const Essere = new Charity("Essere Animali", STANDOUT_CHARITY);
  
  Essere.criteria = { //updated for 2020
    	[PROGRAM]: new Criterion(AVERAGE, MODERATE),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(STRONG, MODERATE),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW),
		[TRACK_RECORD]: new Criterion(AVERAGE, LOW),
		[LEADERSHIP_AND_CULTURE]: new Criterion(AVERAGE, MODERATE),
		[STRATEGY]: new Criterion(STRONG, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, HIGH)
  };
  Essere.interventions = { //updated for 2020
		[CORPORATE_OUTREACH]: new Intervention("corporate campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS),
		[INVESTIGATIONS]: new Intervention("investigations", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]), //welfare & consumption are indirect
		[INFLUENCING_LEGISLATION]: new Intervention("legal work", IMPROVEMENT_OF_WELFARE_STANDARDS),
		[MEDIA_OUTREACH]: new Intervention("media outreach", IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS),
		[DEMONSTRATIONS]: new Intervention("demonstrations", IMPROVEMENT_OF_WELFARE_STANDARDS),
		[PLANT_BASED_RESOURCES]: [
      new Intervention("vegan pledge program", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS),
		  new Intervention("leafleting", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS)
    ]
	  };
  Essere.links = {
		donation: "https://www.essereanimali.org/en/support-us/",
		review: "https://animalcharityevaluators.org/charity-review/essere-animali-being-animals/",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/03/essere-animali-logo_2019.svg",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2021/03/Essere_Animali_logo-square-cropped-2020.jpg",
		website: "https://www.essereanimali.org/en/"
	};
  Essere.description = "Essere Animali was founded in 2011. They currently operate in Italy, where they work to improve animal welfare standards through undercover investigations, \
corporate campaigns, legal actions, and media outreach. They work to influence individuals to decrease their consumption of animal products through pledge programs, leafleting, \
social media, online ads, and by running an institutional campaign to reduce animal product consumption. They also work to strengthen the animal advocacy movement by using undercover \
investigations of animal farms to develop legal actions and corporate campaigns, and by organizing veg fests as part of their vegan outreach campaigns.";
  
	Essere.short_description = "Essere Animali, which operates in Italy, has a strong investigations program that strategically supports the rest of their campaigns and contributes to growing the capacity \
of the animal advocacy movement. They also work in a neglected and promising area: improving the welfare of fishes. Essere Animali has a strong approach to strategic planning, goal setting, and self-assessment.";
  
	Essere.why_recommended = "Essere Animali has a strong investigations program which strategically supports the rest of their campaigns and contributes to growing the capacity of the \
animal advocacy movement. They also work in a neglected and impactful area: improving the welfare of fishes. Essere Animali has a strong approach to strategic planning, goal setting, and self-assessment.";
  
  const Faun = new Charity("Faunalytics", STANDOUT_CHARITY);

	Faun.criteria = { //updated for 2020
		[PROGRAM]: new Criterion(AVERAGE, LOW),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(WEAK, HIGH),
		[TRACK_RECORD]: new Criterion(AVERAGE, MODERATE), //2019 C3
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW), //2019 C4
		[ADAPTABILITY]: new Criterion(AVERAGE, LOW), //per Jamie S, since 2019 criteria were different
		[STRATEGY]: new Criterion(AVERAGE, LOW), //per Jamie S, since 2019 criteria were different
		[LEADERSHIP_AND_CULTURE]: new Criterion(STRONG, MODERATE) //per Jamie S, since 2019 criteria were different
	};

	Faun.interventions = { //updated for 2020
		[CONDUCTING_RESEARCH]: [
      new Intervention("independent research", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]), //welfare & consumption are indirect
      new Intervention("parnter projects", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]) //welfare & consumption are indirect
    ],
    [PROMOTING_RESEARCH]: [
      new Intervention("research library", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]), //welfare & consumption are indirect
      new Intervention("promoting research", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]) //welfare & consumption are indirect
    ]
	};

	Faun.description = "Faunalytics is a U.S.-based organization working to connect animal advocates with information. This mostly involves creating independent research, working \
directly with client organizations on various research projects, and promoting existing research and data for individual advocates through the content library they host on their \
website, all of which are forms of capacity building.";
  
	Faun.short_description = "Faunalytics is a U.S.-based organization working to connect animal advocates with information. This mostly involves creating independent research, working \
directly with client organizations on various research projects, and promoting existing research and data for individual advocates through the content library hoted on their website, \
all of which are forms of capacity building.";
  
	Faun.why_recommended = "Faunalytics is working in an important and relatively neglected area of animal advocacy: research and support for other advocates. Their research is generally \
of good quality relative to other animal advocacy research, and their work helps the movement to become more effective and more evidence-based.";
  
	Faun.links = {
		donation: "https://faunalytics.org/donate/",
		review: "https://animalcharityevaluators.org/charity-review/faunalytics",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/faunalytics-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2016/08/logo-faunalytics2400x2400-315x315@2x.jpg",
		website: "https://faunalytics.org/"
	};


const FIAPO = new Charity("Federation of Indian Animal Protection Organisations", STANDOUT_CHARITY);

	FIAPO.criteria = { //updated for 2020
		[PROGRAM]: new Criterion(AVERAGE, MODERATE),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(WEAK, HIGH),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, LOW), //2019 C4
		[TRACK_RECORD]: new Criterion(AVERAGE, LOW), //2019 C3
		[LEADERSHIP_AND_CULTURE]: new Criterion(AVERAGE, LOW), //2019 C7
		[STRATEGY]: new Criterion(AVERAGE, LOW), //2019 C6
		[ADAPTABILITY]: new Criterion(AVERAGE, LOW) //2019 C5
	};

	FIAPO.interventions = { //updated for 2020
		[INFLUENCING_LEGISLATION]: new Intervention("legislative work", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [MOVEMENT_BUILDING]: [
      new Intervention("grassroots outreach", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
      new Intervention("movement building", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //consumption is indirect
    ],
    [INFLUENCER_OUTREACH]: new Intervention("influencer outreach", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS),
    [INSTITUTIONAL_OUTREACH]: new Intervention("increasing veg options", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
    [PLANT_BASED_RESOURCES]: new Intervention("pledge program", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS)
	};

	FIAPO.uses_article = true;

	FIAPO.description = "The Federation of Indian Animal Protection Organisations (FIAPO) is an Indian organization founded in 2010. They are primarily focused on reducing the suffering \
of farmed animals and position themselves as a key driver of movement building in India. FIAPO engages in several different types of programs including media and online outreach, \
veg pledges, individual grassroots outreach, grassroots political campaigning, and legislative advocacy. They also provide strategic assistance and training for other organizations \
and activists, organize conferences, increase access to and availability of vegan options, and build cross-movement alliances with other organizations.";
  
	FIAPO.short_description = "The Federation of Indian Animal Protection Organisations (FIAPO) primarily works to reduce the suffering of farmed animals through media outreach, individual \
outreach, political campaigning, and legislative advocacy. They also provide strategic assistance and training for other organizations and activists, organize conferences, increase the \
availability of vegan options, and build cross-movement alliances with other organizations.";
  
	FIAPO.why_recommended = "FIAPO focuses on reducing the suffering of farmed animals, which we believe is a high-impact cause area. They engage in programs that seem likely to be highly \
impactful for animals in the short to medium term and that may have the potential to be impactful in the long term when implemented thoughtfully. For example, FIAPO collaborates with food \
and beverage companies and retailers to encourage them to offer more vegan products, likely making it easier for individuals to reduce their consumption of animal products, thereby \
potentially reducing the suffering of a large number of animals. In addition, their work to build the capacity of the movement in India by training activists, assisting other animal \
advocacy organizations, and organizing conferences to bring together leaders in animal advocacy has the potential to increase the effectiveness of other projects and organizations. \
As farmed animal advocacy in India is currently neglected, we believe that FIAPO's work to build the capacity of the movement has the potential to be highly effective.";
  
	FIAPO.links = {
		donation: "http://www.fiapo.org/donation/",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2019/12/2019-FIAPO-Logo-circle.jpg",
		review: "https://animalcharityevaluators.org/charity-review/federation-of-indian-animal-protection-organizations",
		website: "http://www.fiapo.org/fiaporg/"
	};
  
const GFF = new Charity("The Good Food Fund", STANDOUT_CHARITY);
  GFF.criteria = { //updated for 2020
    [PROGRAM]: new Criterion(STRONG, LOW),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(AVERAGE, LOW),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW),
		[TRACK_RECORD]: new Criterion(AVERAGE, LOW),
		[LEADERSHIP_AND_CULTURE]: new Criterion(AVERAGE, LOW),
		[STRATEGY]: new Criterion(WEAK, LOW),
		[ADAPTABILITY]: new Criterion(AVERAGE, LOW)
  };
  
  GFF.interventions = { //updated for 2020
    [EVENT_ORGANIZING]: new Intervention("event organizing", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS], //welfare & consumption are indirect
                                        [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //consumption is indirect
  };
  GFF.description = "The Good Food Fund (GFF) was founded in 2017. GFF currently operates in China, where they work to strengthen the animal advocacy community by hosting an annual \
summit (The Good Food Summit) and other events about dietary transformation. GFF also works to increase the availability of animal-free products by hosting events to promote \
plant-based products and diets among chefs, institutional food services, and the public. They run festivals, cooking demos, and other events, promoting plant-based cooking and \
connecting businesses and institutions to co-create &ldquo;a new culinary culture.&rdquo;";
  
  GFF.short_description = "The Good Food Fund (GFF) operates in China, where animal farming is large in scale but a relatively neglected cause. GFF works to contextualize \
and legitimize animal-free products and farmed animal welfare in China. We think their strategic multi-issue, multi-stakeholder approach to shifting markets, consumers, \
and policy-makers toward plant-based food can help support the cause as a whole.";
  
  GFF.why_recommended = "GFF operates in China, a country that we view as a promising area for pursuing large-scale change for farmed animals. They work toward food system transformation \
through programs that seem to successfully contextualize and legitimize animal-free products and the farmed animal advocacy community in China. We think their strategic multi-issue, \
multi-stakeholder approach to shifting markets, consumers, and policy-makers toward plant-based food can help support the growth of the community as a whole. As farmed animal advocacy \
in China is currently neglected, we believe that GFF's work to build the capacity of the community has the potential to be highly effective.\n \
In general, we believe that GFF is an excellent giving opportunity because of their strong programmatic work and their commitment to community building in China.";
  
  GFF.links = {
		donation: "", //we're assuming we can't have a donation link to GFF, until we hear otherwise
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2021/03/GFF-square-logo-with-space.png",
		review: "https://animalcharityevaluators.org/charity-review/good-food-fund/",
		website: "http://goodfoodchina.net/"
	};
  
  
const SA = new Charity("Sinergia Animal", STANDOUT_CHARITY);

	SA.criteria = { //updated for 2020
		[PROGRAM]: new Criterion(AVERAGE, MODERATE),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(AVERAGE, HIGH),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, MODERATE),
		[TRACK_RECORD]: new Criterion(AVERAGE, MODERATE),
		[LEADERSHIP_AND_CULTURE]: new Criterion(STRONG, MODERATE),
		[STRATEGY]: new Criterion(AVERAGE, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, MODERATE)
	};

	SA.interventions = { //updated for 2020
		[CORPORATE_OUTREACH]: [
      new Intervention("corporate outreach", IMPROVEMENT_OF_WELFARE_STANDARDS),
      new Intervention("corporate campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS)
    ],
    [INVESTIGATIONS]: new Intervention("investigations", IMPROVEMENT_OF_WELFARE_STANDARDS,
                                       [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //welfare & consumption are indirect
    [MEDIA_OUTREACH]: new Intervention("media outreach", IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS),
    [MOVEMENT_BUILDING]: new Intervention("community organization", [STRONGER_MOVEMENT, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS, IMPROVEMENT_OF_WELFARE_STANDARDS]), //welfare & consumption are indirect
    [INFLUENCER_OUTREACH]: new Intervention("building alliances with key influencers", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS,
                                           [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //welfare & consumption are indirect
	};

	SA.description = "Sinergia Animal was founded in 2017. Sinergia Animal currently operates in Brazil, Argentina, Chile, Colombia, Thailand, and Indonesia, where they work to improve the \
welfare standards of farmed animals through their corporate outreach, investigations, and media outreach. They work to decrease individuals' consumption of animal products through \
institutional meat reduction work as well as traditional, alternative, and social media outreach&ndash;sometimes by partnering with influencers and celebrities. In addition, Sinergia Animal \
works to strengthen the animal advocacy movement through community organizing and collaborating with and supporting other groups.";
  
	SA.why_recommended = "Sinergia Animal operates in Latin America and Southeast Asia, where the animal advocacy movement is relatively neglected. Their cage-free corporate outreach \
work and investigations program are particularly cost effective at improving welfare standards of farmed animals and strengthening the animal advocacy movement. Relative to other \
charities we evaluated this year, Sinergia Animal seems to have strong leadership and a healthy organizational culture.\n \
We find Sinergia Animal to be an excellent giving opportunity because of their strategic approach, cost-effective work, and their commitment to building the capacity of the movement \
and improving welfare standards for farmed animals in relatively neglected regions.";
  
  SA.short_description = "Sinergia Animal operates in Latin America and Southeast Asia, two regions where animal advocacy is relatively neglected. Their corporate outreach and \
investigations programs are particularly cost effective at improving welfare standards for farmed animals and strengthening the movement. Overall, they have a strategic approach \
and are committed to building the capacity of the movement.";
  
	SA.links = {
		donation: "https://www.sinergiaanimalinternational.org/donate",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/sinergia-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2018/11/sinergia-animal-logo_square_light-bg_@2x_2018-630x630.jpg",
		review: "https://animalcharityevaluators.org/charity-review/sinergia-animal",
		website: "https://www.sinergiaanimal.org/"
	};

const SVB = new Charity("Sociedade Vegetariana Brasileira", STANDOUT_CHARITY);

	SVB.criteria = { //updated for 2020
		[PROGRAM]: new Criterion(AVERAGE, LOW),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(AVERAGE, HIGH),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, MODERATE),
		[TRACK_RECORD]: new Criterion(STRONG, MODERATE),
		[LEADERSHIP_AND_CULTURE]: new Criterion(AVERAGE, MODERATE),
		[STRATEGY]: new Criterion(AVERAGE, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, LOW)
	};

	SVB.interventions = { //updated for 2020
		[MEDIA_OUTREACH]: new Intervention("media outreach", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS,
                                      [INCREASED_PREVALENCE_OF_ANTISPECIESIST_VALUES, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
    [MOVEMENT_BUILDING]: new Intervention("community organizing", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //welfare & consumption are indirect
    [INFLUENCER_OUTREACH]: new Intervention("training health professionals", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS),
    [INSTITUTIONAL_OUTREACH]: new Intervention("institutional campaigns", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS,
                                              [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
    [PLANT_BASED_RESOURCES]: new Intervention("vegan product labeling", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //consumption is indirect
	};

	SVB.uses_article = true;

	SVB.description = "Sociedade Vegetariana Brasileira (SVB) was founded in 2003. They currently operate in Brazil, where they work to increase the availability of animal-free products \
through their vegan product certification program and by working with restaurants and catering service providers to offer plant-based meals. SVB works to influence individuals to decrease \
their consumption of animal products by running institutional campaigns, engaging in media outreach, and training health professionals. SVB also works to influence individuals to adopt \
more animal-friendly attitudes through social media. In addition, they engage in community organizing with volunteers who provide strategic support to their other campaigns.";
  
	SVB.short_description = "Sociedade Vegetariana Brasileira (SVB) operates in Brazil, where particularly large numbers of animals are farmed. SVB likely has an advantage over international \
organizations with branches there and is in a strong position to contribute to the growth of the local movement. SVB has a strong track record and impactful programs, including their work \
to shift consumers and markets toward plant-based foods.";
  
	SVB.why_recommended = "SVB operates in Brazil, a country that we view as a target for pursuing large-scale change for farmed animals. While other organizations are also engaged in promising \
work in Brazil, SVB has the advantage of being a local group as opposed to a branch of an international organization. Therefore, we think SVB is in a strong position to contribute to the \
growth of the movement in Brazil.\n \
We find SVB to be an excellent giving opportunity because of their impactful programs, strong track record, and their work to shift consumers and markets in Brazil toward plant-based foods.";
  
	SVB.links = {
		donation: "https://www.svb.org.br/filiacao",
		review: "https://animalcharityevaluators.org/charity-review/sociedade-vegetariana-brasileira-svb",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/SVB-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2018/11/svb-stacked@2x-315x315@2x.jpg",
		website: "https://www.svb.org.br/"
	};

const VEGHOY = new Charity("Vegetarianos Hoy", STANDOUT_CHARITY);
  VEGHOY.criteria = { //updated for 2020
    [PROGRAM]: new Criterion(STRONG, MODERATE),
		[ROOM_FOR_MORE_FUNDING]: new Criterion(WEAK, LOW),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW),
		[TRACK_RECORD]: new Criterion(AVERAGE, MODERATE),
		[LEADERSHIP_AND_CULTURE]: new Criterion(AVERAGE, LOW),
		[STRATEGY]: new Criterion(AVERAGE, MODERATE),
		[ADAPTABILITY]: new Criterion(AVERAGE, MODERATE)
  };
  
  VEGHOY.interventions = { //updated for 2020
    [CORPORATE_OUTREACH]: new Intervention("corporate campaigns", IMPROVEMENT_OF_WELFARE_STANDARDS),
    [INFLUENCING_LEGISLATION]: [
      new Intervention("legislative advocacy", [INCREASED_PREVALENCE_OF_ANTISPECIESIST_VALUES, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
      new Intervention("lobbying", [INCREASED_PREVALENCE_OF_ANTISPECIESIST_VALUES, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]) //consumption is indirect
    ],
    [INSTITUTIONAL_OUTREACH]: new Intervention("institutional campaigns", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS),
    [PROMOTING_RESEARCH]: new Intervention("virtual library of advocacy research", [STRONGER_MOVEMENT, IMPROVEMENT_OF_WELFARE_STANDARDS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //welfare & consumption are indirect
    [PLANT_BASED_RESOURCES]: [
      new Intervention("vegan pledge program", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS),
      new Intervention("vegan product labeling", [INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS, DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS]), //consumption is indirect
      new Intervention("mobile app for plant-based diet", DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS)
    ]
  };
  VEGHOY.description = "Vegetarianos Hoy was founded in 2012. Vegetarianos Hoy currently works in Chile, Colombia, and Mexico, where they work to improve animal welfare standards by \
influencing corporations to adopt cage-free egg commitments. They also work to influence individuals to decrease their consumption of animal products through veg*n pledge programs and \
a mobile phone app that provides resources and guidance for following a plant-based diet, and by working with institutions to introduce more plant-based meal options. In Chile and other \
Latin American countries, Vegetarianos Hoy runs a vegan product labeling program. They work to spread and solidify anti-speciesist values through a legislative campaign to increase \
animal rights and a campaign to stop rodeo from being considered Chile's national sport. Finally, Vegetarianos Hoy works to strengthen the animal advocacy movement by disseminating \
animal advocacy research and resources.";
  
  VEGHOY.short_description = "Vegetarianos Hoy operates in Chile, Mexico, and Colombia, countries with relatively younger and smaller animal advocacy movements that we view as important \
for pursuing large-scale global change for farmed animals. They run highly effective programs to increase farmed animal welfare, decrease consumption of animal products, and increase \
the availability of alternatives, and they are building the capacity of the movement in relatively neglected regions.";
  
  VEGHOY.why_recommended = "Vegetarianos Hoy operates in Chile, Mexico, and Colombia, countries with relatively younger and smaller animal advocacy movements that we view as targets \
for pursuing large-scale change for farmed animals. We think Vegetarianos Hoy is well positioned to contribute to the growth of the movement in this region. They run highly effective \
programs to increase farmed animal welfare, decrease consumption of animal products, and increase the availability of alternatives to animal products.\n \
We find Vegetarianos Hoy to be an excellent giving opportunity because of their impactful programs and their commitment to improving the welfare of farmed animals and building the \
capacity of the movement in relatively neglected regions.";
  
  VEGHOY.links = {
    donation: "https://vegetarianoshoy.org/en/donate/",
		review: "https://animalcharityevaluators.org/charity-review/vegetarianos-hoy/",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2018/11/vegetarianos-hoy-logo_2019-316x315.jpg",
		website: "https://vegetarianoshoy.org/"
  };
  

const AMG = new Charity("ACE Movement Grants");

	AMG.links = {
		donation: "https://animalcharityevaluators.org/donation-advice/ace-movement-grants/?form=mg",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/10/ace-movement-grants-featured@2x-381x200.png",
		website: "https://animalcharityevaluators.org/donation-advice/ace-movement-grants"
	};

	AMG.make_link_in_first_use_of_name = false;

	AMG.description = `Consider <a target= "_blank" href="${AMG.links.website}">learning more about</a> or <a target="_blank" href="${AMG.links.donation}">donating to</a> <b>ACE Movement Grants</b>.`;

	AMG.render = function () {
		if (this.elements.$container) return this.elements.$container;
	
		const $description = $("<p>").html(this.description);
		return (this.elements.$container = $("<li>").addClass("amg").append($description));
	};

	AMG.reset = () => {};

const charities = [ASF, GFI, THL, WAI, AI, CIWF, Essere, Faun, FIAPO, GFF, SA, SVB, VEGHOY];
let handicaps = [0.95, 0.75, 0.77, 1, //TCs ----  AFTER DEBUGGING CHANGE `let` to `const`
                 0.72, 1.0, 0.9, 1.35, 1.3, 1.85, 0.85, 0.97, 1]; //SCs  Essere 1.18->1.05
window.setHandicaps = (new_handicaps) => {handicaps = new_handicaps; } // COMMENT THIS LINE OUT AFTER DEBUGGING!!!!
charities.forEach((charity, index) => charity.handicap = handicaps[index]);

/* QUESTIONS */

const criteria_question = new RankQuestion(
	"Which factors do you think are the most important for comparing different charities?", [
		new RankOption(
			PROGRAM,
			"Does the charity engage in programs that seem likely to be highly impactful?"
		), new RankOption(
			ROOM_FOR_MORE_FUNDING,
			"Will additional funding enable the charity to carry out high-impact activities that it could not pursue otherwise?"
		), new RankOption(
			COST_EFFECTIVENESS,
			"Does the charity operate its programs with a smaller budget relative to other charities we reviewed?"
		), new RankOption(
			TRACK_RECORD,
			"Does the charity have a record of achieving smaller goals, or has it demonstrated progress toward larger goals?"
		), new RankOption(
			LEADERSHIP_AND_CULTURE,
			"Does the charity have a strong leadership and a healthy organizational culture?"
		), new RankOption(
			ADAPTABILITY,
			"Does the charity have the capacity to respond to areas of success and failure appropriately?"
		), new RankOption(
			STRATEGY,
			"Does the charity have a clear and well-developed strategy?"
		)
	], 5, true, false
), outcomes_question = new RankQuestion(
	"Which outcomes do you think are the most important for helping animals?", [
		new RankOption(
			DECREASED_CONSUMPTION_OF_ANIMAL_PRODUCTS,
			"Some interventions aim to encourage and support individuals to decrease their consumption or use of animal products."
		), new RankOption(
			IMPROVEMENT_OF_WELFARE_STANDARDS,
			"Some interventions aim to improve the welfare of animals used by humans."
		), new RankOption(
			INCREASED_AVAILABILITY_OF_ANIMAL_FREE_PRODUCTS,
			"Some interventions aim to increase the availability and improve the quality of plant-based and cell-cultured options."
		), new RankOption(
			INCREASED_PREVALENCE_OF_ANTISPECIESIST_VALUES,
			"Some interventions aim to spread and solidify anti-speciesist values that recognize the importance of animals' wellbeing."
		), new RankOption(
			STRONGER_MOVEMENT,
			"Some interventions aim to develop a stronger animal advocacy movement."
		)
	]
), interventions_question = new RankQuestion(
	"Which interventions do you think most effectively achieve these outcomes?", [
		//new RankOption(
			//GRASSROOTS_PROJECTS,
			//"Charities work with networks of activists not employed by animal advocacy organisations to advocate for plant-based diets, support legislative initiatives, and carry out corporate campaigns."
		//),
    new RankOption(
			MEDIA_OUTREACH,
			"Charities use social media and online advertisements to educate viewers about industrial agriculture, farmed animals, and vegetarian or vegan eating."
		), new RankOption(
			DEMONSTRATIONS,
			"Charities use demonstrations to inform the public about animal welfare issues and forms of animal exploitation."
		), new RankOption(
			CAMPUS_OUTREACH,
			"Charities use campus outreach programs to spread concern for animals among college students."
		), new RankOption(
			INFLUENCER_OUTREACH,
			"Charities work with individual celebrities, key decision-makers, and organizations advocating for related causes, such as human rights or environmental protection, to create change for animals."
		), new RankOption(
			CORPORATE_OUTREACH,
			"Charities work to influence restaurant chains, supermarkets, and other businesses to create or strengthen animal welfare policies."
		), new RankOption(
			INFLUENCING_LEGISLATION,
			"Charities work with lobbying firms or meet with state or national elected officials to influence and create legislation that affects animals; charities file and prosecute lawsuits to attain recognition of animal rights and get existing protections for animals enforced."
		), new RankOption(
			MOVEMENT_BUILDING,
			"Charities strengthen the animal advocacy movement by training advocates and building solidarity and coordination between organizations."
		), new RankOption(
			INSTITUTIONAL_OUTREACH,
			"Charities work with institutions, such as school districts and hospitals, to implement meat reduction programs and increase the availability of vegetarian and vegan options."
		), new RankOption(
			EVENT_ORGANIZING,
			"Charities organize conferences and events to connect advocates and stakeholders and promote knowledge sharing."
		), new RankOption(
			CONDUCTING_RESEARCH,
			"Charities conduct research to answer relevant foundational questions and better understand the most impactful ways to help animals."
		), new RankOption(
			PROMOTING_RESEARCH,
			"Charities collect and promote existing research to make insights more accessible to advocates or organizations."
		), new RankOption(
			INVESTIGATIONS,
			"Charities use undercover investigations to document animal abuse and raise awareness of various forms of animal suffering."
		), new RankOption(
			PLANT_BASED_RESOURCES,
			"Charities support the adoption of plant-based diets through pledge programs, food labeling, mobile apps, and leafleting."
		)
	]
);

	interventions_question.filter = (intervention_option) => {
		/* Return true iff intervention directly influences an outcome that received rank above
		   `INTERVENTION_FILTER_MAX_OUTCOME_RANK`in the question `outcomes_question`. */
		if (outcomes_question.is_answered === false) return true;
		for (const charity of charities) {
			if (!charity.interventions) continue;
			const interventions = charity.interventions[intervention_option.text];
			if (!interventions) continue;
			for (let outcome of interventions.map(intervention => intervention.outcomes_influenced).flat()) {
				if (Array.isArray(outcome)) outcome = outcome[0]; // only consider directly influenced outcomes
				if (outcomes_question.answers.has(outcome) && 
					outcomes_question.answers.get(outcome) <= INTERVENTION_FILTER_MAX_OUTCOME_RANK) {
					return true;
				}
			}
		}
		return false;
	};
	
	const stronger_movement_outcome = outcomes_question.options.find(option => option.text === STRONGER_MOVEMENT);
	stronger_movement_outcome.display_name = (charity) => {
		return charity === GFF ? "Stronger Animal Advocacy Community" : stronger_movement_outcome.text;
	}

const EAAF_question = new BinaryRadioQuestion(
	DONATE_TO_AMG,
	"Are you interested in supporting ACE Movement Grants?",
	"<p>ACE Movement Grants (formerly &ldquo;Effective Animal Advocacy Fund&CloseCurlyDoubleQuote;) is for anyone who is interested in making the animal advocacy movement more effective. Donations to ACE Movement \
Grants will be distributed to promising projects around the globe working to reduce animal suffering. The annual disbursement will be determined by our review committee. Learn more \
about <a href='https://animalcharityevaluators.org/blog/announcing-our-fall-2020-ace-movement-grants/' target='_blank' rel='noopener'>our most recent round of grants</a>.</p>\
<p>Donors who are interested in higher-risk investments may be more drawn to ACE Movement Grants, while donors who are more risk-averse may find the Recommended Charity Fund to be a better fit.</p>",
	"I am interested in supporting ACE Movement Grants.",
	"I am not interested in supporting ACE Movement Grants."
);

/* RESULTS PAGE */

class CharityResultsPage {
	
	constructor() {
		this.quiz = undefined;
	}
	
	orderCharities() {
		if (this.quiz.questions.some(question => question !== EAAF_question && question.is_answered)) {
			return Charity.getCharitiesSortedByAscendingScores(charities, this.quiz.weights);
		} else {
			const top_charities = charities.filter(charity => charity.status === TOP_CHARITY),
				  standout_charities = charities.filter(charity => charity.status === STANDOUT_CHARITY);
			return shuffle(top_charities).concat(shuffle(standout_charities));
		}
	}

	render() {
		const sorted_charities = this.orderCharities();
	
		const first_choice = sorted_charities[0],
			  $top_title = $("<h3>").html("Your Results"),
			  $top_explanation = $("<p>").html(`${this.makeSuccessString(first_choice)} Use our <a href="https://forms.gle/5b3y2pvmZTnJHBZR7" target="_blank">feedback form</a> to let us know what you think about this quiz and your results.`),
			  $top_results = $("<ol>").addClass("quiz-top-results"),
			  $more_title = $("<h3>").html("Other Recommended Charities"),
			  $more_results = $("<ol>").addClass("quiz-more-results");
		
		this.quiz.results = sorted_charities.map(charity => charity.name);

		if (this.quiz.answers.get(DONATE_TO_AMG)) $top_results.append(AMG.render());
		for (const [index, charity] of sorted_charities.entries()) {
			charity.rank = index + 1;
			(index <= 2 ? $top_results : $more_results).append(charity.render());
		}
		$more_results.append(this.makeReviewProcessCard());

		return jQueryCollection($top_title, $top_explanation, $top_results, $more_title, $more_results);
	}
	
		makeSuccessString(charity) {
			const top_criterion = criteria_question.top_choice,
				  top_outcome = outcomes_question.top_choice,
				  top_intervention = interventions_question.top_choice,
				  specific_top_interventions = top_intervention ? charity.interventions[top_intervention.text] : undefined;
			let intervention_names_for_boast = [];
			if (top_outcome && specific_top_interventions) {
				intervention_names_for_boast = shuffle(specific_top_interventions.filter(intervention => intervention.influences(top_outcome.text)).map(intervention => intervention.display_name), 2);
			}
			let ret = ""; //return string
			if (top_criterion && charity.criteria[top_criterion.text].performance === STRONG) {
				ret += `${charity.uses_article ? "The " : ""}<b>${charity.name}</b> performs strongly in our assessment of ${Criterion.READOUT_NAMES.get(top_criterion.display_name(charity))}.`;
			}
			if (top_outcome && intervention_names_for_boast.length > 0) {
				ret += ret ? "They also work" : `${charity.uses_article ? "The " : ""}<b>${charity.name}</b> works`;
				ret += ` toward ${top_outcome.display_name(charity).toLowerCase()} through ${intervention_names_for_boast.join(" and ")}.`;
			}
			if (ret) return ret;
			return `The charity which most closely matches your preferences is ${charity.uses_article ? "the " : ""}<b>${charity.name}</b>.`;
		}

		makeReviewProcessCard() {
			const $title = $("<h4>").addClass("charity-name").html("Our Review Process"),
				  $contents = $('<p>ACE evaluates animal charities in order to find those that are able to do the most good with additional donations. Following anti-speciesist principles, \
we recognize that success can take many forms; we aim to compare these different types of success by the amount of animal suffering they can prevent or reduce. \
<b>Read more about our <a href="https://animalcharityevaluators.org/charity-reviews/evaluating-charities" target="_blank" rel="noopener">evaluation process</a>.</b></p>');
			return $("<li>").addClass("charity-info our-review-process").append($title, $contents);
		}
}

const quiz = new Quiz([criteria_question, outcomes_question, interventions_question,
					   EAAF_question], new CharityResultsPage(), APP_SCRIPT_URL); //FOR DEBUG MODE: DebugResultsPage instead of CharityResultsPage
	
return function takeQuiz() { $(".entry-content").html(quiz.render()); };

})(jQuery);

} catch (e) {
	console.log(e);
	jQuery(".entry-content").html("Your browser is unsupported, or there was an unexpected error. Try updating your browser, or <a href='https://animalcharityevaluators.org/about/contact-us/'>contact us</a> if you think there is another issue.");
}
