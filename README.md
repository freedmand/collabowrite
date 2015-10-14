# Introducing Collabowrite
Collabowrite is a collaborative writing website to crowdsource book creation. Let's write a book together.

Live site: [collabowrite.io](http://www.collabowrite.io/)

## How it works
We will write a book together, one page a day.
* Anyone can write a page
* Anyone can vote on a page
* Each day, the highest voted page for that day is added to the book

Using this method, we will write a 30 page book November 2015, one page for each day in November.

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
* An attractive landing page
* An overly complex login system (not reachable from the first page yet)
* Testing for the login system
* Too much vector artwork

### What needs to be implemented
* The voting system
* The final touches to account creation
* **The submission system:** I am envisioning a Reddit-esque style where each post for a day pops up and is sortable by "fresh", "new", and "top". Pages can be upvoted. I am contemplating doing away with downvoting since it encourages negativity, instead offering an option to flag content (ads, non-fiction, etc.).
* **The page submission system:** Where a user can write and submit a page. A user can enter a brief title summary of the page, the body text, and optionally sign off as anonymous. Writing controls should be minimal. I think the writing tools should either only support bold, italic, and underline, or nothing initially.
* **The page submission view:** Pages that have been written and are still under contention can be expanded and viewed on a standalone page. Here there should be functionality for comments and proofreading suggestions.
* **The book view:** After the first page has been submitted, it needs to appear in a more finalized, book-ready form (i.e. if the page submission view is sans-serif, the book view is serif with a slightly faded yellow book color background). The book view allows one to read the book page by page up to its latest submission. For each page, a user should be able to comment and see alternate submissions.
* **A proofreading or editing system:** the fine mechanics of this are still being worked out. It will either be a way to comment with just a proofreading comment (i.e. replace certain characters with these characters). These comments can be upvoted/downvoted to crowdsource editing. The book and page view could have a toggle to view prominent proofreading suggestions.
* Testing for everything

### Future goals
* Allow users to create their own books, specify the rules and genres, timeline of how many pages and how long each page iteration will take (or how many pages must be submitted on a given iteration).
* Roll out more books in the future and experiment with different epoch times (half-day, hour, week, etc.)

## License

This project is licensed under [GNU General Public License (GPL) v3.0](http://www.gnu.org/licenses/gpl-3.0.en.html). Feel free to share, modify, and redistribute the code, so long as it remains open source.

## Get involved
Interested in helping? Collabowrite is open source and welcomes contributions. If you want to start contributing and need help, please email [dylan@collabowrite.io](mailto:dylan@collabowrite.io).

### Contributors (all contributors should add their names here):
* freedmand (dylan@collabowrite.io)
