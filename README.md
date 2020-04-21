# ACE's Recommended Charity Quiz
Refer to [our blog post](https://animalcharityevaluators.org/) for more information about this project.

The source code for the script which makes the charity quiz work is in `quiz-source.js`, which we compile to `quiz.js` using [es6console.com](https://es6console.com/)'s Babel implementation in order to better support legacy browsers, and then minify the code to `quiz.min.js`. `index.html` provides a testing environment which replicates some conditions of our website. `quiz.css` contains all styling code used specifically in the quiz.