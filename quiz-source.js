"use strict";
let takeQuiz = (($) => {

/* CONSTANTS */

const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby49-0TN6tsByhtDrKYHqdL7rDKf5J117LzWSGsM-_kKUJAqiA/exec",
	  TOP_CHARITY = "Top Charity",
	  STANDOUT_CHARITY = "Standout Charity",
	  IMPACTFULNESS_OF_PROGRAM = "Projected Impact of Programs",
	  COST_OF_EXPANSION_PLANS = "Cost of Expansion Plans",
	  TRACK_RECORD = "Track Record",
	  COST_EFFECTIVENESS = "Cost-Effectiveness",
	  RESPONSE_TO_SUCCESS_AND_FAILURE = "Response to Success and Failure",
	  LEADERSHIP_AND_STRATEGIC_VISION = "Leadership and Strategic Vision",
	  CULTURE_AND_STRUCTURE = "Culture and Structure",
	  STRONG = "Strong",
	  AVERAGE = "Average",
	  WEAK = "Weak",
	  HIGH = "High",
	  MODERATE = "Moderate",
	  LOW = "Low",
	  INFLUENCING_INDUSTRY = "Influencing Industry",
	  INFLUENCING_POLICY_AND_THE_LAW = "Influencing Policy and the Law",
	  INFLUENCING_PUBLIC_OPINION = "Influencing Public Opinion",
	  BUILDING_ALLIANCES = "Building Alliances",
	  CAPACITY_BUILDING = "Capacity Building",
	  GRASSROOTS_PROJECTS = "Grassroots Projects",
	  ONLINE_AND_MEDIA_OUTREACH = "Online and Media Outreach",
	  RESEARCH = "Research",
	  INFLUENCER_OUTREACH = "Influencer Outreach",
	  CORPORATE_OUTREACH = "Corporate Outreach",
	  LEGAL_WORK = "Legal Work",
	  INVESTIGATIONS = "Investigations",
	  MOVEMENT_STRENGTHENING = "Movement Strengthening",
	  INCREASE_VEGAN_OPTIONS = "Increase Vegan Options",
	  GOVERNMENT_OUTREACH = "Government Outreach",
	  ORGANISING_CONFERENCES_AND_EVENTS = "Organising Conferences and Events",
	  SUPPORTING_FOOD_INNOVATION = "Supporting Food Innovation",
	  WORKING_IN_NEGLECTED_COUNTRIES = "Working in Neglected Countries",
	  DONATE_TO_EAAF = "Donate to the EAA Fund";

const INFLUENCING_INDUSTRY_ICON_HTML = '<svg class="svg-inline--fa fa-chart-line fa-w-16" aria-hidden="true" data-prefix="fas" data-icon="chart-line" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M500 384c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v308h436zM456 96H344c-21.4 0-32.1 25.9-17 41l32.9 32.9-72 72.9-55.6-55.6c-4.7-4.7-12.2-4.7-16.9 0L96.4 305c-4.7 4.6-4.8 12.2-.2 16.9l28.5 29.4c4.7 4.8 12.4 4.9 17.1.1l82.1-82.1 55.5 55.5c4.7 4.7 12.3 4.7 17 0l109.2-109.2L439 249c15.1 15.1 41 4.4 41-17V120c0-13.3-10.7-24-24-24z"></path></svg>',
	  INFLUENCING_POLICY_AND_THE_LAW_ICON_HTML = '<svg class="svg-inline--fa fa-balance-scale fa-w-20" aria-hidden="true" data-prefix="fas" data-icon="balance-scale" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" data-fa-i2svg=""><path fill="currentColor" d="M352 448h168c13.255 0 24 10.745 24 24v16c0 13.255-10.745 24-24 24H120c-13.255 0-24-10.745-24-24v-16c0-13.255 10.745-24 24-24h168V153.324C264.469 143.04 246.836 121.778 241.603 96H120c-13.255 0-24-10.745-24-24V56c0-13.255 10.745-24 24-24h135.999C270.594 12.57 293.828 0 320 0s49.406 12.57 64.001 32H520c13.255 0 24 10.745 24 24v16c0 13.255-10.745 24-24 24H398.397c-5.233 25.778-22.866 47.04-46.397 57.324V448zm287.981-112c.001-16.182 1.342-8.726-85.048-181.506-17.647-35.294-68.186-35.358-85.865 0C381.94 328.75 384.019 320.331 384.019 336H384c0 44.183 57.308 80 128 80s128-35.817 128-80h-.019zM512 176l72 144H440l72-144zM255.981 336c.001-16.182 1.342-8.726-85.048-181.506-17.647-35.294-68.186-35.358-85.865 0C-2.06 328.75.019 320.331.019 336H0c0 44.183 57.308 80 128 80s128-35.817 128-80h-.019zM128 176l72 144H56l72-144z"></path></svg>',
	  INFLUENCING_PUBLIC_OPINION_ICON_HTML = '<svg class="svg-inline--fa fa-users fa-w-20" aria-hidden="true" data-prefix="fas" data-icon="users" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" data-fa-i2svg=""><path fill="currentColor" d="M320 64c57.99 0 105 47.01 105 105s-47.01 105-105 105-105-47.01-105-105S262.01 64 320 64zm113.463 217.366l-39.982-9.996c-49.168 35.365-108.766 27.473-146.961 0l-39.982 9.996C174.485 289.379 152 318.177 152 351.216V412c0 19.882 16.118 36 36 36h264c19.882 0 36-16.118 36-36v-60.784c0-33.039-22.485-61.837-54.537-69.85zM528 300c38.66 0 70-31.34 70-70s-31.34-70-70-70-70 31.34-70 70 31.34 70 70 70zm-416 0c38.66 0 70-31.34 70-70s-31.34-70-70-70-70 31.34-70 70 31.34 70 70 70zm24 112v-60.784c0-16.551 4.593-32.204 12.703-45.599-29.988 14.72-63.336 8.708-85.69-7.37l-26.655 6.664C14.99 310.252 0 329.452 0 351.477V392c0 13.255 10.745 24 24 24h112.169a52.417 52.417 0 0 1-.169-4zm467.642-107.09l-26.655-6.664c-27.925 20.086-60.89 19.233-85.786 7.218C499.369 318.893 504 334.601 504 351.216V412c0 1.347-.068 2.678-.169 4H616c13.255 0 24-10.745 24-24v-40.523c0-22.025-14.99-41.225-36.358-46.567z"></path></svg>',
	  BUILDING_ALLIANCES_ICON_HTML = '<svg class="svg-inline--fa fa-handshake fa-w-20" aria-hidden="true" data-prefix="far" data-icon="handshake" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" data-fa-i2svg=""><path fill="currentColor" d="M616 96h-48c-7.107 0-13.49 3.091-17.884 8H526.59l-31.13-36.3-.16-.18A103.974 103.974 0 0 0 417.03 32h-46.55c-17.75 0-34.9 4.94-49.69 14.01C304.33 36.93 285.67 32 266.62 32h-32.11c-28.903 0-57.599 11.219-79.2 32.8L116.12 104H89.884C85.49 99.091 79.107 96 72 96H24c-13.255 0-24 10.745-24 24v240c0 13.255 10.745 24 24 24h48c10.449 0 19.334-6.68 22.629-16h18.801l75.35 67.57c25.542 26.45 59.925 44.43 96.58 44.43 16.39 0 32.28-3.85 46.1-10.93 24.936.496 51.101-10.368 69.07-31.41 19.684-5.579 37.503-17.426 50.72-34.6 20.989-4.401 40.728-16.492 53.42-35.06h40.701c3.295 9.32 12.18 16 22.629 16h48c13.255 0 24-10.745 24-24V120c0-13.255-10.745-24-24-24zM48 352c-8.837 0-16-7.163-16-16s7.163-16 16-16 16 7.163 16 16-7.163 16-16 16zm412.52-5.76c-15.35 14.295-36.884 11.328-39.95 8 1.414 13.382-18.257 41.043-49.08 38.88-5.541 18.523-28.218 33.826-51.49 25.75-8.89 8.89-22.46 13.13-34.64 13.13-24.95 0-47.77-14.54-63.14-30.91l-81.3-72.91a31.976 31.976 0 0 0-21.36-8.18H96V152h26.75c8.48 0 16.62-3.37 22.62-9.37l43.88-43.88A64.004 64.004 0 0 1 234.51 80h32.11c5.8 0 11.51.79 17 2.3l-43.27 50.49c-23.56 27.48-23.84 67.62-.66 95.44 32.388 38.866 91.378 39.228 124.48 1.98l25.98-30.08L462.59 296c13.44 14.6 10.95 38.13-2.07 50.24zM544 320h-24.458c.104-20.261-6.799-39.33-19.762-54.4L421.7 162.28c4.51-9.51 2.34-21.23-6.01-28.45-10.075-8.691-25.23-7.499-33.86 2.48l-53.63 62.12c-13.828 15.41-38.223 15.145-51.64-.93a25.857 25.857 0 0 1 .23-33.47l57.92-67.58A47.09 47.09 0 0 1 370.48 80h46.55c16.11 0 31.44 6.94 42.07 19.04L504.52 152H544v168zm48 32c-8.837 0-16-7.163-16-16s7.163-16 16-16 16 7.163 16 16-7.163 16-16 16z"></path></svg>',
	  CAPACITY_BUILDING_ICON_HTML = '<svg class="svg-inline--fa fa-bullhorn fa-w-18" aria-hidden="true" data-prefix="fas" data-icon="bullhorn" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" data-fa-i2svg=""><path fill="currentColor" d="M576 224c0-20.896-13.36-38.666-32-45.258V64c0-35.346-28.654-64-64-64-64.985 56-142.031 128-272 128H48c-26.51 0-48 21.49-48 48v96c0 26.51 21.49 48 48 48h43.263c-18.742 64.65 2.479 116.379 18.814 167.44 1.702 5.32 5.203 9.893 9.922 12.88 20.78 13.155 68.355 15.657 93.773 5.151 16.046-6.633 19.96-27.423 7.522-39.537-18.508-18.026-30.136-36.91-19.795-60.858a12.278 12.278 0 0 0-1.045-11.673c-16.309-24.679-3.581-62.107 28.517-72.752C346.403 327.887 418.591 395.081 480 448c35.346 0 64-28.654 64-64V269.258c18.64-6.592 32-24.362 32-45.258zm-96 139.855c-54.609-44.979-125.033-92.94-224-104.982v-69.747c98.967-12.042 169.391-60.002 224-104.982v279.711z"></path></svg>';

/* How many times more does the criteria score count than the intervention score? */
let CRITERIA_SCORE_WEIGHT = 0.75;

/* What is the maximum (worst) rank an outcome needs to achieve in order for
   interventions affecting that outcome to be asked about? */
let INTERVENTION_FILTER_MAX_OUTCOME_RANK = 2;

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
		if (this.is_finished) this.onSubmit();

		$question.html(this.current_question.render());
		this.refreshButtons();
		this.scrollToContainerTop();
	}

		scrollToContainerTop() {
			$('html, body').scrollTop(this.$render.offset().top);
		}

	onSubmit() {
		const data = Object.fromEntries(this.answers);
		data["Google Analytics Client ID"] = readCookie("_ga");
		$.post(this.post_url, data);
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

	Criterion.PERFORMANCE_VALUES = new Map([
		[STRONG, 3],
		[AVERAGE, 0],
		[WEAK, -3]
	]);

	Criterion.CONFIDENCE_VALUES = new Map([
		[HIGH, 2],
		[MODERATE, 1],
		[LOW, 0]
	]);

class Intervention {
	constructor(...args) {
		this.effect_on_outcomes = {};
		if (args.length == 1) {
			for (const [outcome, value] of Object.entries(args[0])) {
				this.effect_on_outcomes[outcome] = value;
			}
		} else if (args.length == 5) {
			if (args[0] > 0) this.effect_on_outcomes[GRASSROOTS_PROJECTS] = args[0];
			if (args[1] > 0) this.effect_on_outcomes[INFLUENCING_POLICY_AND_THE_LAW] = args[1];
			if (args[2] > 0) this.effect_on_outcomes[INFLUENCING_PUBLIC_OPINION] = args[2];
			if (args[3] > 0) this.effect_on_outcomes[BUILDING_ALLIANCES] = args[3];
			if (args[4] > 0) this.effect_on_outcomes[CAPACITY_BUILDING] = args[4];
		}
	}
	
	score(weights) {
		let score = 0;
		for (const [key, effect] of Object.entries(this.effect_on_outcomes)) {
			score += weights.get(key) * effect;
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
	
	get links() { return this._links; }
	set links(value) {
		this._links = value;
		Object.defineProperty(this._links, "comprehensive_review",
							  {get: () => this.links.review + "/#comprehensive-review"});
		if (this.status === TOP_CHARITY) this._links.donation = "https://animalcharityevaluators.org/donate/#tc";
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
	
	applyNeglectedCountryBonus(weight) {
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
			return $("<a>").addClass('ace-button').attr({
					  "href": link,
					  "target": link
					}).html(text);
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
				  $review = this.makeExtButton("Read Comprehensive Review", this.links.comprehensive_review),
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
			for (const [key, intervention] of Object.entries(this.interventions)) {
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

const ASF = new Charity("Albert Schweitzer Foundation", TOP_CHARITY);

	ASF.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(STRONG, MODERATE),
		[COST_OF_EXPANSION_PLANS]: new Criterion(AVERAGE, LOW),
		[TRACK_RECORD]: new Criterion(STRONG, MODERATE),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, MODERATE),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(STRONG, MODERATE),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(STRONG, MODERATE),
		[CULTURE_AND_STRUCTURE]: new Criterion(AVERAGE, HIGH)
	};

	ASF.interventions = {
		[GRASSROOTS_PROJECTS]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 1}),
		[ONLINE_AND_MEDIA_OUTREACH]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 1 + 1}),
		[RESEARCH]: new Intervention({[CAPACITY_BUILDING]: 2}),
		[CORPORATE_OUTREACH]: new Intervention({[INFLUENCING_INDUSTRY]: 2 * 2,
											  [BUILDING_ALLIANCES]: 2* 2}),
		[LEGAL_WORK]: new Intervention({[INFLUENCING_POLICY_AND_THE_LAW]: 2 * 2}),
		[MOVEMENT_STRENGTHENING]: new Intervention({[BUILDING_ALLIANCES]: 1})
	};

	ASF.description = "The Albert Schweitzer Foundation (ASF) works primarily in Germany, though they now have a branch in Poland as well. They work as a nonprofit (rather than making grants like a typical foundation).  They conduct corporate outreach campaigns encouraging companies to (i) adopt cage-free policies, (ii) make broiler chicken and fish welfare commitments, and (iii) commit to providing additional and improved vegan options. ASF also engages in legal work; for instance, in the last year, they have funded a lawsuit against a state Minister of Agriculture and defended undercover investigators in a trespassing case in Germany. Additionally, their scientific division researches topics related to animal welfare and ways to make their work more effective.";

	ASF.short_description = "The Albert Schweitzer Foundation (ASF) conducts corporate outreach campaigns encouraging companies to improve their animal welfare policies or provide more vegan options. They also run vegetarian outreach campaigns, and their scientific division researches ways to improve the quality of their work as well as other topics related to animal welfare.";

	ASF.why_recommended = "ASF has a solid track record of corporate outreach in Germany, and we are optimistic that their strategy and skills will lead to meaningful progress in Poland and other parts of Central and Eastern Europe, an area with a younger and smaller animal advocacy movement. Additionally, ASF is one of the first animal charities beginning to prioritize corporate outreach on behalf of farmed fishes. We believe that farmed fish advocacy can be particularly impactful due to the large scale and neglectedness of farmed fish suffering.";

	ASF.links = {
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/ASF_albert-schweitzer-foundation-logo_long_rgb_official.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/ASF-square-charity-quiz-2020.jpeg",
		review: "https://animalcharityevaluators.org/charity-review/albert-schweitzer-foundation",
		website: "'http://www.albertschweitzerfoundation.org/#utm_source=ace&utm_medium=web&utm_campaign=ace'"
	};

const AI = new Charity("Anima International", TOP_CHARITY);

	AI.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(STRONG, MODERATE),
		[COST_OF_EXPANSION_PLANS]: new Criterion(AVERAGE, LOW),
		[TRACK_RECORD]: new Criterion(STRONG, MODERATE),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, MODERATE),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(AVERAGE, LOW),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(STRONG, HIGH),
		[CULTURE_AND_STRUCTURE]: new Criterion(STRONG, HIGH)
	};

	AI.interventions = {
		[ONLINE_AND_MEDIA_OUTREACH]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 1 + (2 * 1)}),
		[RESEARCH]: new Intervention({[CAPACITY_BUILDING]: 2}),
		[CORPORATE_OUTREACH]: new Intervention({[INFLUENCING_INDUSTRY]: 2 * 2}),
		[LEGAL_WORK]: new Intervention({[INFLUENCING_POLICY_AND_THE_LAW]: 1}),
		[INVESTIGATIONS]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 2}),
		[MOVEMENT_STRENGTHENING]: new Intervention({[CAPACITY_BUILDING]: 2 * 2}),
		[INCREASE_VEGAN_OPTIONS]: new Intervention({[INFLUENCING_INDUSTRY]: 2,
													[BUILDING_ALLIANCES]: 1}),
		[GOVERNMENT_OUTREACH]: new Intervention({[INFLUENCING_POLICY_AND_THE_LAW]: 2}),
		[ORGANISING_CONFERENCES_AND_EVENTS]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 0.5,
															   [BUILDING_ALLIANCES]: 0.5}) //not in original TOC
	};

	AI.applyNeglectedCountryBonus(0.05);

	AI.description = 'Anima International was founded in 2018 through a merger of two organizations: Anima, which has been working in Scandinavia since 2000, and <a href="https://animalcharityevaluators.org/charity-review/open-cages/">Otwarte Klatki</a> (Open Cages), which has been working in Poland and other countries in Eastern Europe including Lithuania, Estonia, and Ukraine since 2012. Anima International runs corporate campaigns, releases undercover investigations, and engages in online and offline ad campaigns and outreach. They also organize protests, found and train advocacy groups, organize conferences on animal advocacy and the legal protection of animals, reach out to restaurants and foodservice companies to increase the prevalence of plant-based options, and organize VegFests.';

	AI.short_description = "Anima International runs corporate campaigns, releases undercover investigations, and engages in ad campaigns and outreach in Scandinavia and Eastern Europe. They also organize protests, found and train advocacy groups, organize conferences on animal advocacy and the legal protection of animals, reach out to restaurants and foodservice companies to increase plant-based options, and organize VegFests.";

	AI.why_recommended = "Anima International has shown a strong commitment to strategy and to adapting their advocacy based on new information and developments. Their approach to using their media campaigns as a way to directly support and increase the cost-effectiveness of their other programs seems like a particularly effective tactic. Anima International has been building the capacity of the movement and working to overcome gaps in skills and diversity in relatively neglected countries with young movements. Their strategy of expanding their reach by finding and supporting local groups seems especially promising, and we believe that their extensive volunteer program could also be a potential pool from which to hire full-time staff. In general, we find Anima International to be an excellent giving opportunity because of their strategic approach and commitment to movement building.";

	AI.links = {
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/anima-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2019/11/anima-international-logo-square@2x-630x630.png",
		review: "https://animalcharityevaluators.org/charity-review/anima",
		website: "https://animainternational.org/"
	};

const GFI = new Charity("The Good Food Institute", TOP_CHARITY);

	GFI.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(STRONG, LOW),
		[COST_OF_EXPANSION_PLANS]: new Criterion(STRONG, HIGH),
		[TRACK_RECORD]: new Criterion(AVERAGE, LOW),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, LOW),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(AVERAGE, LOW),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(AVERAGE, MODERATE),
		[CULTURE_AND_STRUCTURE]: new Criterion(STRONG, MODERATE)
	};

	GFI.interventions = {
		[ONLINE_AND_MEDIA_OUTREACH]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 2}),
		[RESEARCH]: new Intervention({[INFLUENCING_INDUSTRY]: 2,
									  [CAPACITY_BUILDING]: 2}),
		[LEGAL_WORK]: new Intervention({[INFLUENCING_INDUSTRY]: 0.5}), //not in original TOC
		[INCREASE_VEGAN_OPTIONS]: new Intervention({[INFLUENCING_INDUSTRY]: 2,
													[BUILDING_ALLIANCES]: 2}),
		[SUPPORTING_FOOD_INNOVATION]: new Intervention({[INFLUENCING_INDUSTRY]: 2 * 2}),
		[GOVERNMENT_OUTREACH]: new Intervention({[INFLUENCING_POLICY_AND_THE_LAW]: 2 * 2,
												 [BUILDING_ALLIANCES]: 2 * 1}),
		[WORKING_IN_NEGLECTED_COUNTRIES]: new Intervention({[CAPACITY_BUILDING]: 2 * 2})
	};

	GFI.description = "The Good Food Institute (GFI), which is headquartered in the U.S., works to transform the animal agriculture industry by promoting the development of competitive alternatives to animal-based meat, dairy, and eggs. GFI seeks out entrepreneurs and scientists to join or form start-ups in the plant-based and cell-cultured meat (i.e., meat grown in a culture without animal slaughter, also called cell-based meat, clean meat, and cultivated meat) market sectors. They provide business, legal, scientific, and strategic guidance for plant-based and cellular product companies. They also engage in regulatory and statutory policy work to level the playing field for plant-based and cell-cultured products in the consumer market. GFI builds relationships with food processing companies (e.g., Tyson, ADM), chain restaurants, grocery stores, and foodservice companies to improve and promote cell-cultured and plant-based alternatives to animal products. Finally, GFI works with grant-making institutions, universities, corporations, and governments to mobilize resources for research in plant-based and cell-cultured meat.";

	GFI.short_description = "The Good Food Institute (GFI), which is headquartered in the U.S., works to transform the animal agriculture industry by promoting the development of plant-based and cell-cultured alternatives to animal-based meat, dairy, and eggs. GFI supports start-ups in these market sectors; engages in policy work to level the playing field for their products; and works with academia, industry, and government to conduct relevant research.";

	GFI.why_recommended = "Animal advocates have been working for decades to weaken the animal agriculture industry by encouraging individuals and institutions to reduce the demand for animal products and implement humane reforms. We are happy to support the effective implementation of those interventions, but we also believe that engaging in a wider range of promising tactics may increase the animal advocacy movement's chance of success. Developing and promoting attractive alternatives to animal products seems like a promising way to transform the animal agriculture industry. There are few charities working in this area, and GFI has shown strong leadership and efficiency.";

	GFI.links = {
		review: "https://animalcharityevaluators.org/charity-review/the-good-food-institute",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/gfi-logo-charity-quiz-2020.jpg",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2016/11/tc-gfi@2x-315x315@2x.jpg",
		website: "https://www.gfi.org"
	};

const THL = new Charity("The Humane League", TOP_CHARITY);

	THL.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(STRONG, MODERATE),
		[COST_OF_EXPANSION_PLANS]: new Criterion(STRONG, HIGH),
		[TRACK_RECORD]: new Criterion(STRONG, MODERATE),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, MODERATE),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(STRONG, HIGH),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(STRONG, HIGH),
		[CULTURE_AND_STRUCTURE]: new Criterion(STRONG, HIGH)
	};

	THL.interventions = {
		[GRASSROOTS_PROJECTS]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 2 * 1,
												 [CAPACITY_BUILDING]: 2 * 1}),
		[ONLINE_AND_MEDIA_OUTREACH]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 2}),
		[RESEARCH]: new Intervention({[CAPACITY_BUILDING]: 2}),
		[CORPORATE_OUTREACH]: new Intervention({[INFLUENCING_INDUSTRY]: 2 * 2}),
		[GOVERNMENT_OUTREACH]: new Intervention({[INFLUENCING_POLICY_AND_THE_LAW]: 2}),
		[WORKING_IN_NEGLECTED_COUNTRIES]: new Intervention({[CAPACITY_BUILDING]: 2 * 2})
	};

	THL.description = "The Humane League (THL)'s mission is to end the abuse of animals raised for food. THL engages in a variety of programs designed to persuade individuals and organizations to adopt behaviors that reduce farmed animal suffering. They are headquartered in the U.S. but they operate globally, with a team based in Japan as well as independent charities in the U.K. and Mexico. THL's largest programs, based on their budget, are their corporate campaigns and grassroots organizing. They encourage corporations to enact policies dictating higher animal welfare standards and they educate the public using outreach materials such as humane education presentations and online videos. Through their grassroots offices and campus leadership program, they recruit and train new animal advocates. THL also works to build the animal advocacy movement internationally through the <a href='https://openwingalliance.org/'>Open Wing Alliance</a> (OWA), a global coalition founded by THL whose mission is to end the use of cages to confine egg-laying hens. The OWA offers funding and training to advocacy groups interested in working on corporate campaigns.";

	THL.short_description = "The Humane League (THL) persuades individuals and organizations around the world to adopt animal-friendly behaviors. They also recruit and train new animal advocates. THL founded and continues to support the <a href='https://openwingalliance.org/'>Open Wing Alliance</a> (OWA), an international coalition whose mission is to end the use of cages to confine egg-laying hens.";

	THL.why_recommended = "THL has an exceptionally strong commitment to using studies and systematic data collection to guide their approach to advocacy. Their corporate campaigns are especially strong, and they often take the lead in collaborating with other groups to facilitate knowledge-sharing about their strategic approach. They have been flexible in using their grassroots network for a variety of advocacy efforts—including individual outreach, support for corporate campaigns, and grassroots legislative advocacy. We find THL to be an excellent giving opportunity because of their strong programs and evidence-driven outlook.";

	THL.links = {
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/thl-logo-charity-quiz-2020.jpg",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2019/03/thl-mended-heart-logo@2x-315x315@2x.jpg",
		long_logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/THL_the-humane-league-logo_long_2color_@2x_2019.png",
		review: "https://animalcharityevaluators.org/charity-review/the-humane-league",
		website: "https://thehumaneleague.org/"
	};

const Faun = new Charity("Faunalytics", STANDOUT_CHARITY);

	Faun.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(AVERAGE, LOW),
		[COST_OF_EXPANSION_PLANS]: new Criterion(WEAK, HIGH),
		[TRACK_RECORD]: new Criterion(AVERAGE, MODERATE),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(AVERAGE, MODERATE),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(AVERAGE, MODERATE),
		[CULTURE_AND_STRUCTURE]: new Criterion(STRONG, HIGH)
	};

	Faun.interventions = {
		[RESEARCH]: new Intervention({[CAPACITY_BUILDING]: 2 * 1 + 2 * 1 + 2 * 1 + 1}),
		[MOVEMENT_STRENGTHENING]: new Intervention({[CAPACITY_BUILDING]: 2 * 1}) //double-counting partner projects
	};

	Faun.description = "Faunalytics is a U.S.-based organization working to connect animal advocates with information. This mostly involves creating independent research, working directly with client organizations on various research projects, and promoting existing research and data for individual advocates through the content library they host on their website, all of which are forms of capacity building. We think that even small improvements made through research can substantially increase the number of animals helped if they are applied by many animal advocates. In the last 2–3 years, Faunalytics has increased their number of independent research publications on topics relevant to effective animal advocacy. They have published research on (i) the characteristics of donors to animal causes, (ii) attitudes towards farmed animals, (iii) corporate commitments, and more. Their research projects are highly transparent, publicly available, and seem to be the result of an impact-focused project prioritization process. Faunalytics also appears to have a particularly healthy organizational culture.";

	Faun.short_description = "Faunalytics is a U.S.-based organization working to connect animal advocates with information. This mostly involves creating independent research, working directly with client organizations on various research projects, and promoting existing research and data for individual advocates through the content library they host on their website, all of which are forms of capacity building.";

	Faun.why_recommended = "Faunalytics is working in an important and relatively neglected area of animal advocacy: research and support for other advocates. Their research is generally of good quality relative to other animal advocacy research, and their work helps the movement to become more effective and more evidence-based.";

	Faun.links = {
		donation: "https://faunalytics.org/donate?utm_source=ACE",
		review: "https://animalcharityevaluators.org/charity-review/faunalytics",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/faunalytics-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2016/08/logo-faunalytics2400x2400-315x315@2x.jpg",
		website: "https://faunalytics.org/"
	};

const CIWF = new Charity("Compassion in World Farming USA", STANDOUT_CHARITY);

	CIWF.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(STRONG, LOW),
		[COST_OF_EXPANSION_PLANS]: new Criterion(WEAK, MODERATE),
		[TRACK_RECORD]: new Criterion(AVERAGE, MODERATE),
		[COST_EFFECTIVENESS]: new Criterion(WEAK, MODERATE),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(STRONG, MODERATE),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(STRONG, MODERATE),
		[CULTURE_AND_STRUCTURE]: new Criterion(STRONG, HIGH)
	};

	CIWF.interventions = {
		[GRASSROOTS_PROJECTS]: new Intervention({[INFLUENCING_POLICY_AND_THE_LAW]: 2}),
		[ONLINE_AND_MEDIA_OUTREACH]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 1 + 1}),
		[RESEARCH]: new Intervention({[CAPACITY_BUILDING]: 2}),
		[CORPORATE_OUTREACH]: new Intervention({[INFLUENCING_INDUSTRY]: 2 * 2,
											    [BUILDING_ALLIANCES]: 2 * 2})
	};

	CIWF.description = "Compassion in World Farming USA (Compassion USA) has a strong understanding of the worst abuses that occur in animal farming and they have tailored their approach to focus on combating the causes of the highest levels of suffering. They focus on welfare reforms for chickens raised for meat and egg-laying hens, and they are currently piloting a program to support companies in reducing the number of animals in their supply chains. Compassion USA plays a different role in corporate campaigns than many of the other charities we evaluate: Rather than running negative campaigns, they maintain collaborative working relationships with corporations in order to help them write and implement more animal-friendly policies. To a smaller extent, Compassion USA also supports national legislative efforts as they pertain to banning close confinement systems and \"ag-gag\" bills.";

	CIWF.short_description = "Compassion in World Farming USA (Compassion USA) is focused on improving the lives of farmed animals through collaboratively working with companies to reform relevant policies and practices. To a smaller extent, they also support national legislative efforts as they pertain to banning close confinement systems and \"ag-gag\" bills.";

	CIWF.why_recommended = "Compassion USA's corporate outreach campaigns are likely to reduce the suffering of a large number of animals. What’s more, their recent program to reduce the number of animals in food supply chains has the potential to reduce a large amount of animal products in major food businesses. In general, we believe that Compassion USA has a strong commitment to effectiveness: They have demonstrated an ability to self-identify areas of success and failure and respond appropriately, and their strategy seems to be impact-driven and thoughtfully implemented based on research.";

	CIWF.links = {
		donation: "https://donate.ciwf.com/page/12128/donate/1?utm_source=ACE",
		review: "https://animalcharityevaluators.org/charity-review/compassion-in-world-farming-usa-ciwf",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/CIWF-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2016/09/logo-compassion-in-world-farming-usa-2400x2400-315x315@2x.jpg",
		website: "https://www.ciwf.com/"
	};

const FIAPO = new Charity("Federation of Indian Animal Protection Organisations", STANDOUT_CHARITY);

	FIAPO.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(AVERAGE, MODERATE),
		[COST_OF_EXPANSION_PLANS]: new Criterion(WEAK, HIGH),
		[TRACK_RECORD]: new Criterion(AVERAGE, LOW),
		[COST_EFFECTIVENESS]: new Criterion(STRONG, LOW),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(AVERAGE, LOW),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(AVERAGE, LOW),
		[CULTURE_AND_STRUCTURE]: new Criterion(AVERAGE, LOW)
	};

	FIAPO.interventions = {
		[GRASSROOTS_PROJECTS]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 2 * 1}),
		[ONLINE_AND_MEDIA_OUTREACH]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 2 * 1}),
		[INFLUENCER_OUTREACH]: new Intervention({[BUILDING_ALLIANCES]: 1}),
		[MOVEMENT_STRENGTHENING]: new Intervention({[CAPACITY_BUILDING]: 2 * 2}),
		[INCREASE_VEGAN_OPTIONS]: new Intervention({[INFLUENCING_INDUSTRY]: 2,
													[INFLUENCING_PUBLIC_OPINION]: 1,
													[BUILDING_ALLIANCES]: 1}),
		[GOVERNMENT_OUTREACH]: new Intervention({[INFLUENCING_POLICY_AND_THE_LAW]: 2 * 2})
	};

	FIAPO.applyNeglectedCountryBonus(0.25);

	FIAPO.uses_article = true;

	FIAPO.description = "The Federation of Indian Animal Protection Organisations (FIAPO) is an Indian organization founded in 2010. They are primarily focused on reducing the suffering of farmed animals and position themselves as a key driver of movement building in India. FIAPO engages in several different types of programs including media and online outreach, veg pledges, individual grassroots outreach, grassroots political campaigning, and legislative advocacy. They also provide strategic assistance and training for other organizations and activists, organize conferences, increase access to and availability of vegan options, and build cross-movement alliances with other organizations.";

	FIAPO.short_description = "The Federation of Indian Animal Protection Organisations (FIAPO) is an organization that positions itself as a key driver of movement building in India. FIAPO engages directly in several different types of outreach and advocacy to individuals, governments, and food companies. They also provide strategic assistance and training to other organizations and activists, and build cross-movement alliances.";

	FIAPO.why_recommended = "FIAPO collaborates with food and beverage companies and retailers to encourage them to offer more vegan products, likely making it easier for individuals to reduce their consumption of animal products, thereby potentially reducing the suffering of a large number of animals. In addition, their work to build the capacity of the movement in India by training activists, assisting other animal advocacy organizations, and organizing conferences to bring together leaders in animal advocacy has the potential to increase the effectiveness of other projects and organizations. As farmed animal advocacy in India is currently neglected, we believe that FIAPO's work to build the capacity of the movement has the potential to be highly effective.";
		
	FIAPO.links = {
		donation: "http://www.fiapo.org/donation/",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2019/12/2019-FIAPO-Logo-circle.jpg",
		review: "https://animalcharityevaluators.org/charity-review/federation-of-indian-animal-protection-organizations",
		website: "http://www.fiapo.org/fiaporg/"
	};

const SVB = new Charity("Sociedade Vegetariana Brasileira", STANDOUT_CHARITY);

	SVB.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(AVERAGE, LOW),
		[COST_OF_EXPANSION_PLANS]: new Criterion(WEAK, LOW),
		[TRACK_RECORD]: new Criterion(STRONG, LOW),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(STRONG, LOW),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(AVERAGE, LOW),
		[CULTURE_AND_STRUCTURE]: new Criterion(WEAK, LOW)
	};

	SVB.interventions = {
		[INCREASE_VEGAN_OPTIONS]: new Intervention({[INFLUENCING_INDUSTRY]: 2 * 4,
													[BUILDING_ALLIANCES]: 2 * 4}),
		[ORGANISING_CONFERENCES_AND_EVENTS]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 1,
															   [BUILDING_ALLIANCES]: 2})
	};

	SVB.applyNeglectedCountryBonus(0.25);

	SVB.uses_article = true;

	SVB.description = 'The Sociedade Vegetariana Brasileira (SVB) was founded in 2003. They promote plant-based diets by organizing veg fests, promoting Meatless Mondays, administering a <a target="_blank" href="http://www.selovegano.com.br/">Vegan Label</a>, and working with restaurants to increase vegan offerings through their <a target="_blank" href="http://opcaovegana.svb.org.br/">Vegan Option Program</a>. SVB works collaboratively with <a target="_blank" href="http://www.hsi.org/">Humane Society International</a> (HSI) and <a href="/charity-review/mercy-for-animals/">Mercy For Animals</a> (MFA), and they seem to prioritize reducing duplication of efforts. SVB also works with health professionals to spread knowledge of the health benefits of a plant-based diet. They offer a 16-hour <a target="_blank" href="http://www.cursonutricaovegetariana.com.br/">course</a> and have begun organizing a <a target="_blank" href="http://www.plantbasedconference.com.br/">plant-based conference</a> for health professionals in 2018.';

	SVB.short_description = "The Sociedade Vegetariana Brasileira (SVB) promotes plant-based diets by organizing veg fests, promoting Meatless Mondays, administering a Vegan Label, and working with restaurants to increase vegan offerings. SVB also works with health professionals to spread knowledge of the health benefits of plant-based diets. They collaborate with health/environmental activists as well as other animal welfare organizations.";

	SVB.why_recommended = 'SVB operates in Brazil, a country that we <a href="/blog/roundtable-how-can-we-effectively-help-animals-in-brazil/">view</a> as a target for pursuing large-scale change for farmed animals. While other organizations are also engaged in promising work in Brazil, SVB has the advantage of being a local group as opposed to a branch of an international organization. We think this factor could give them more credibility and enable them to better influence public opinion through their outreach. Given their focus on effectiveness and their ability to assess areas of success and failure, we think that donors who are interested in bringing about large-scale change for animals in Brazil should consider donating to SVB.';

	SVB.links = {
		donation: "https://www.svb.org.br/filiacao",
		review: "https://animalcharityevaluators.org/charity-review/sociedade-vegetariana-brasileira-svb",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/SVB-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2018/11/svb-stacked@2x-315x315@2x.jpg",
		website: "https://www.svb.org.br/"
	};

const SA = new Charity("Sinergia Animal", STANDOUT_CHARITY);

	SA.criteria = {
		[IMPACTFULNESS_OF_PROGRAM]: new Criterion(STRONG, LOW),
		[COST_OF_EXPANSION_PLANS]: new Criterion(WEAK, LOW),
		[TRACK_RECORD]: new Criterion(WEAK, LOW),
		[COST_EFFECTIVENESS]: new Criterion(AVERAGE, LOW),
		[RESPONSE_TO_SUCCESS_AND_FAILURE]: new Criterion(AVERAGE, LOW),
		[LEADERSHIP_AND_STRATEGIC_VISION]: new Criterion(AVERAGE, LOW),
		[CULTURE_AND_STRUCTURE]: new Criterion(AVERAGE, LOW)
	};

	SA.interventions = {
		[ONLINE_AND_MEDIA_OUTREACH]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 1}),
		[CORPORATE_OUTREACH]: new Intervention({[INFLUENCING_INDUSTRY]: 2 * 2}),
		[INVESTIGATIONS]: new Intervention({[INFLUENCING_PUBLIC_OPINION]: 1})
	};

	SA.applyNeglectedCountryBonus(0.25);

	SA.description = '<a href="https://www.sinergiaanimal.org/">Sinergia Animal</a> is a new organization founded in Brazil in October 2017 and operating in four Latin American countries (Brazil, Chile, Colombia, and Argentina). They work to reduce animal suffering and to decrease the consumption of animal products, with the long-term goal of ending animal exploitation altogether. Sinergia Animal plans to expand further in the Global South, focusing especially on countries where major international animal advocacy organizations are not currently working. They aim to work as pioneers, paving the way for other organizations to expand their operations. Sinergia Animal promotes a range of dietary changes including reductionism, flexitarianism, vegetarianism, and veganism. Their goal is to work towards a paradigm shift in global consumption patterns. They also engage in corporate outreach—at this stage, their campaigns focus on phasing out the use of cages to confine egg-laying hens and pregnant sows.';

	SA.why_recommended = 'Sinergia operates in Latin America, where the animal advocacy movement is relatively smaller than in the U.S., and the marginal impact of additional work may be high. Rather than starting from scratch, they are learning from the successes of corporate campaigns in the U.S. and applying the same strategies in more neglected countries. They seem to have strong leadership and a clear strategy based on maximizing the effectiveness of their work.';

	SA.links = {
		donation: "https://www.sinergiaanimal.org/donacionesarg",
		logo: "https://animalcharityevaluators.org/wp-content/uploads/2020/04/sinergia-logo-charity-quiz-2020.png",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2018/11/sinergia-animal-logo_square_light-bg_@2x_2018-630x630.jpg",
		review: "https://animalcharityevaluators.org/charity-review/sinergia-animal",
		website: "https://www.sinergiaanimal.org/"
	};

const EAAF = new Charity("Effective Animal Advocacy Fund");

	EAAF.links = {
		donation: "https://animalcharityevaluators.org/donate/#eaafund",
		square_logo: "https://animalcharityevaluators.org/wp-content/uploads/2017/08/ace-logo-circle@2x.png",
		website: "https://animalcharityevaluators.org/donation-advice/effective-animal-advocacy-fund/"
	};

	EAAF.make_link_in_first_use_of_name = false;

	EAAF.description = `Consider <a target= "_blank" href="${EAAF.links.website}">learning more about</a> or  <a target="_blank" href="${EAAF.links.donation}">donating to</a> our <b>Effective Animal Advocacy Fund</b>.`;

	EAAF.render = function () {
		if (this.elements.$container) return this.elements.$container;
	
		const $description = $("<p>").html(this.description);
		return (this.elements.$container = $("<li>").addClass("eaaf").append($description));
	};

	EAAF.reset = () => {};

const charities = [ASF, AI, GFI, THL, Faun, CIWF, FIAPO, SVB, SA];
const handicaps = [1.25, 1.02, 0.945, 1.02, 1.4, 1.4, 1.15, 0.75, 2];
charities.forEach((charity, index) => charity.handicap = handicaps[index]);

/* QUESTIONS */

const criteria_question = new RankQuestion(
	"Which factors do you think are the most important for comparing different charities?", [
		new RankOption(
			IMPACTFULNESS_OF_PROGRAM,
			"Does the charity engage in programs that seem likely to be highly impactful?"
		), new RankOption(
			COST_OF_EXPANSION_PLANS,
			"Does the charity have room for more funding and concrete plans for growth?"
		), new RankOption(
			TRACK_RECORD,
			"Does the charity possess a strong track record of success?"
		), new RankOption(
			COST_EFFECTIVENESS,
			"Does the charity operate cost-effectively, according to our best estimates?"
		), new RankOption(
			RESPONSE_TO_SUCCESS_AND_FAILURE,
			"Does the charity identify areas of success and failure and respond appropriately?"
		), new RankOption(
			LEADERSHIP_AND_STRATEGIC_VISION,
			"Does the charity have strong leadership and a well-developed strategic vision?"
		), new RankOption(
			CULTURE_AND_STRUCTURE,
			"Does the charity have a healthy culture and a sustainable structure?"
		)
	], 5, true, false
), outcomes_question = new RankQuestion(
	"Which outcomes do you think are the most important for helping animals?", [
		new RankOption(
			INFLUENCING_INDUSTRY,
			"Advocates can effect change for animals suffering on factory farms by targeting companies such as food producers and by supporting innovative alternatives to animal products.",
			INFLUENCING_INDUSTRY_ICON_HTML
		), new RankOption(
			INFLUENCING_POLICY_AND_THE_LAW,
			"Encoding protections for animals into the law can impact many animals at once and may also contribute to a shift in the way people think about animals' status in society.",
			INFLUENCING_POLICY_AND_THE_LAW_ICON_HTML
		), new RankOption(
			INFLUENCING_PUBLIC_OPINION,
			"Shifts in public opinion and consumer preferences can drive changes in industry practices and government policies that affect the lives of farmed animals.",
			INFLUENCING_PUBLIC_OPINION_ICON_HTML
		), new RankOption(
			BUILDING_ALLIANCES,
			"Work to build alliances strengthens the connection between the animal advocacy movement and other social movements, industries, and key influencers.",
			BUILDING_ALLIANCES_ICON_HTML
		), new RankOption(
			CAPACITY_BUILDING,
			"Capacity-building activities help strengthen the animal advocacy movement by expanding membership and increasing available resources to the movement.",
			CAPACITY_BUILDING_ICON_HTML
		)
	]
), interventions_question = new RankQuestion(
	"Which interventions do you think most effectively achieve these outcomes?", [
		new RankOption(
			GRASSROOTS_PROJECTS,
			"Charities work with networks of activists not employed by animal advocacy organisations to advocate for plant-based diets, support legislative initiatives, and carry out corporate campaigns."
		), new RankOption(
			ONLINE_AND_MEDIA_OUTREACH,
			"Charities use social media and online advertisements to educate viewers about industrial agriculture, farmed animals, and vegetarian or vegan eating."
		), new RankOption(
			INFLUENCER_OUTREACH,
			"Charities work with individual celebrities, key decision-makers, and organizations advocating for related causes, such as human rights or environmental protection, to create change for animals."
		), new RankOption(
			CORPORATE_OUTREACH,
			"Charities work with restaurant chains, supermarkets, and other businesses to create or strengthen animal welfare policies."
		), new RankOption(
			LEGAL_WORK,
			"Charities file and prosecute lawsuits to attain recognition of animal rights, to get existing protections for animals enforced, and to strike down unjust labeling and ag-gag laws."
		), new RankOption(
			GOVERNMENT_OUTREACH,
			"Charities work with lobbying firms or meet with state or national elected officials on their own behalf to influence and create legislation that affects animals."
		), new RankOption(
			MOVEMENT_STRENGTHENING,
			"Charities can strengthen the animal advocacy movement by training advocates and by building solidarity and coordination between organizations."
		), new RankOption(
			INCREASE_VEGAN_OPTIONS,
			"Charities work with institutions such as school districts and hospitals to implement meat reduction programs and increase the availability of vegetarian and vegan options."
		), new RankOption(
			WORKING_IN_NEGLECTED_COUNTRIES,
			"Charities sometimes choose to work in regions where animal advocacy is more neglected, rather than areas with more established movements."
		), new RankOption(
			ORGANISING_CONFERENCES_AND_EVENTS,
			"Charities organize conferences and events to bring together advocates and stakeholders who can form connections and share knowledge."
		), new RankOption(
			RESEARCH,
			"Charities conduct research to answer relevant foundational questions and to better understand the most impactful ways to help animals."
		), new RankOption(
			INVESTIGATIONS,
			"Charities use undercover investigations to document animal abuse and raise awareness of various forms of animal suffering."
		), new RankOption(
			SUPPORTING_FOOD_INNOVATION,
			"Charities support the development of innovative plant-based and cell-cultured meat, dairy, and eggs."
		)
	]
);

	interventions_question.filter = (intervention_option) => {
		/* Return true iff intervention affects an outcome that received rank above
		   `INTERVENTION_FILTER_MAX_OUTCOME_RANK`in the question `outcomes_question`. */
		if (outcomes_question.is_answered === false) return true;
		for (const outcome_option of outcomes_question.options) {
			if (isNaN(outcome_option.rank) || outcome_option.rank > INTERVENTION_FILTER_MAX_OUTCOME_RANK)
				continue;
			for (const charity of charities) {
				if (!charity.interventions) continue;
				let intervention = charity.interventions[intervention_option.text];
				if (intervention) {
					const outcomes_effected = Object.keys(intervention.effect_on_outcomes);
					if (outcomes_effected.includes(outcome_option.text)) return true;
				}
			}
		}
		return false;
	};

const EAAF_question = new BinaryRadioQuestion(
	DONATE_TO_EAAF,
	"Are you interested in supporting ACE's Effective Animal Advocacy Fund?",
	"<p>The Effective Animal Advocacy Fund (EAA Fund) allows ACE to support a broader set of charities beyond our Top and Standout Charity selections. These include promising and effective organizations that are doing valuable work in their communities to reduce animal suffering. These groups are often smaller than our recommended charities, have a shorter track record, or work in important but neglected areas. Information about our most recent round of grants is available <a href='https://animalcharityevaluators.org/blog/announcing-our-fall-2019-eaa-fund-grants/'>here</a>.</p><p>Donors who are interested in higher-risk/higher-reward investments may be more drawn to the Effective Animal Advocacy Fund, while donors who are more risk-averse may find the Recommended Charity Fund to be a better fit.</p>",
	"I am interested in supporting the EAA fund",
	"I am not interested in supporting the EAA fund"
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
			  $top_explanation = $("<p>").html(`The charity which most closely matches your preferences is ${first_choice.uses_article ? "the " : ""}<b>${first_choice.name}</b>. Use <a href="https://forms.gle/5b3y2pvmZTnJHBZR7" target="_blank">this feedback form</a> to let us know what you think about this quiz and your results.`),
			  $top_results = $("<ol>").addClass("quiz-top-results"),
			  $more_title = $("<h3>").html("Other Recommended Charities"),
			  $more_results = $("<ol>").addClass("quiz-more-results");

		if (this.quiz.answers.get(DONATE_TO_EAAF)) $top_results.append(EAAF.render());
		for (const [index, charity] of sorted_charities.entries()) {
			charity.rank = index + 1;
			(index <= 2 ? $top_results : $more_results).append(charity.render());
		}
		$more_results.append(this.makeReviewProcessCard());

		return jQueryCollection($top_title, $top_explanation, $top_results, $more_title, $more_results);
	}

		makeReviewProcessCard() {
			const $title = $("<h4>").addClass("charity-name").html("Our Review Process"),
				  $contents = $('<p>ACE evaluates animal advocacy organizations in order to find those that are able to do the most good with additional donations. Following anti-speciesist principles, we recognize that success can take many forms; we aim to compare these different types of success by the amount of animal suffering they can prevent or reduce. <b>Read more about our evaluation process <a href="https://animalcharityevaluators.org/charity-reviews/evaluating-charities">here</a>.</b></p>');
			return $("<li>").addClass("charity-info our-review-process").append($title, $contents);
		}
}

const quiz = new Quiz([criteria_question, outcomes_question, interventions_question,
					   EAAF_question], new CharityResultsPage(), APP_SCRIPT_URL);

return function takeQuiz() { $(".entry-content").html(quiz.render()); };

})(jQuery);