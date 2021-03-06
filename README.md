# Introducing Collabowrite
Collabowrite is a collaborative writing website to crowdsource book creation. Let's write a book together.

*UPDATE:* Live site is currently down

## How it works
We will write a book together, one page a day.
* Anyone can write a page
* Anyone can vote on a page
* Each day, the highest voted page for that day is added to the book

Using this method, we will write a 30 page book in November 2015, one page for each day in November.

Since the book will be so influenced by how the first page turns out, we have an exception to these rules: the first page. We will open the submission system for the first page on October 25, 2015 and leave it open through the end of November 1st.

# Installation instructions

### Dependencies
* [Meteor (1.2)](https://www.meteor.com/install)

Install Meteor by following the [installation instruction given on the project website](https://www.meteor.com/install). After it has been successfully installed, simply type `meteor` in the project directory to run the project. All dependency packages should be automatically installed.

### Environment variables

I am connecting to some external services such as a Mongo DB provider, Mandrill for sending emails and Google Analytics for tracking pageviews. These services only run in production and their log-ins are not included in the repo for obvious reasons. You can set the following environment variables:

* **MANDRILL_EMAIL:** the email address for your Mandrill account. Also the email from which the emails will be sent.
* **MANDRILL_KEY:** the API key for Mandrill.

In the absence of the **MANDRILL_EMAIL** environment variable, all email sending will simply be logged to the console.

### Packages

The full list of packages can be seen at any time in `.meteor/packages` (for packages installed through Atmosphere) and `packages.json` (for Node packages). These will be installed automagically be Meteor.

## Testing

I am using [Velocity](https://velocity.readme.io/) with [Jasmine](http://jasmine.github.io/) for testing. I have only created server tests so far for the log-in functionality. These tests can be found in `tests/server/integration`. At the time I wrote the tests, there was a known bug with Meteor 1.2 in which Velocity could not run server unit tests, thus all server-side tests are currently being run as integration tests.

## Organization

The organization should be fairly intuitive. I used [iron-cli](https://github.com/iron-meteor/iron-cli) to provide scaffolding for the project.

# Project status

### What's been implemented
* A landing page
* A log-in system
* A user submission system with an autosaving Medium-style text editor
* Ability to sort posts by "New" and "Top"
* Ability to vote on posts
* Graphics and overall site design
* Integration tests for most critical site functionality

### What needs to be implemented
* The final touches to account creation with social integration (Facebook and Google log-ins)
* Password reset functionality
* Additional features on posted content: commenting, sort by "Fresh" (like Reddit's "Best" sorting method), author profile pages (view submissions by author, as well as see stats on overall favor), be able to "flag" content
* **The book view:** After the first page has been submitted, it needs to appear in a more finalized, book-ready form. The book view allows one to read the book page by page up to its latest submission. For each page, a user should be able to comment and see alternate submissions.
* **A proofreading or editing system:** the fine mechanics of this are still being worked out. It will either be a way to comment with just a proofreading comment (i.e. replace certain characters with these characters). These comments can be upvoted/downvoted to crowdsource editing. The book and page view could have a toggle to view prominent proofreading suggestions overlayed on the text.
* More comprehensive integration tests and client-side tests

### Future goals
* Allow users to create their own books, specify the rules and genres, timeline of how many pages and how long each page iteration will take (or how many pages must be submitted on a given iteration).
* Roll out more books in the future and experiment with different epoch times (half-day, hour, week, etc.)

## License

This project is licensed under [GNU General Public License (GPL) v3.0](http://www.gnu.org/licenses/gpl-3.0.en.html). Feel free to share, modify, and redistribute the code, so long as it remains open source.
