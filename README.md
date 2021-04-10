# ACE's Recommended Charity Quiz
Refer to [our blog post](https://animalcharityevaluators.org/blog/updates-to-aces-charity-quiz/) for more information about this project.

The source code for the charity quiz script is in `quiz-source.js`, which we compile to `quiz.js` with [Babel](https://babeljs.io/) in order to better support legacy browsers. We then minify the code to `quiz.min.js`. `index.html` provides a testing environment that replicates some conditions of our website. `quiz.css` contains all of the styling code used specifically in the quiz.

For convenience, we have used [es6console.com](https://es6console.com/) for compilation (using the `babel (6)` and `es2015` settings), and [jscompress.com](https://jscompress.com/) for minification.