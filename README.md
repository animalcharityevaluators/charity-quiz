# ACE's Recommended Charity Quiz
Refer to [our blog post](https://animalcharityevaluators.org/blog/updates-to-aces-charity-quiz/) for more information about this project.

The source code for the charity quiz script is in `quiz-source.js`, which we compile to `quiz.js` using [es6console.com](https://es6console.com/)'s Babel implementation in order to better support legacy browsers. We then minify the code to `quiz.min.js`. `index.html` provides a testing environment that replicates some conditions of our website. `quiz.css` contains all of the styling code used specifically in the quiz.