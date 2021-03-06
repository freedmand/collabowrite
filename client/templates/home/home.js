/*****************************************************************************/
/* Home: Event Handlers */
/*****************************************************************************/

calculations = {
  '1': {
    'word': {
      'year-count': '1.3 billion',
      'year-superscript': '',
      'year-sub': 'That&rsquo;s a quarter of how long scientists believe the world to have existed!',
      'banana-count': '480 billion',
      'banana-superscript': '',
      'banana-sub': 'That&rsquo;s all the bananas produced globally in 14 years!'
    },
    'sentence': {
      'year-count': '1.7 x 10',
      'year-superscript': '278',
      'year-sub': 'That&rsquo;s a 17 with 277 zeroes after it!',
      'banana-count': '6.1 x 10',
      'banana-superscript': '280',
      'banana-sub': 'That&rsquo;s more bananas than particles in the universe cubed!'
    },
    'page': {
      'year-count': '9.9 x 10',
      'year-superscript': '2138',
      'year-sub': 'That&rsquo;s a 99 with 2,137 zeroes after it!',
      'banana-count': '3.6 x 10',
      'banana-superscript': '2141',
      'banana-sub': 'That&rsquo;s bananas!'
    },
    'book': {
      'year-count': '4.3 x 10',
      'year-superscript': '250344',
      'year-sub': 'That&rsquo;s a 43 with 250,343 zeroes after it!',
      'banana-count': '1.6 x 10',
      'banana-superscript': '250347',
      'banana-sub': 'That&rsquo;s bananas!'
    },
    'works': {
      'year-count': '5.1 x 10',
      'year-superscript': '7796873',
      'year-sub': 'That&rsquo;s 51 with 7.7 million zeroes after it!',
      'banana-count': '1.8 x 10',
      'banana-superscript': '7796876',
      'banana-sub': 'That&rsquo;s bananas!'
    }
  },
  '1000': {
    'word': {
      'year-count': '1.3 million',
      'year-superscript': '',
      'year-sub': 'That&rsquo;s a lot of monkeying around!',
      'banana-count': '480 billion',
      'banana-superscript': '',
      'banana-sub': 'That&rsquo;s all the bananas produced globally in 14 years!'
    },
    'sentence': {
      'year-count': '1.7 x 10',
      'year-superscript': '275',
      'year-sub': 'That&rsquo;s a 17 with 274 zeroes after it!',
      'banana-count': '6.1 x 10',
      'banana-superscript': '280',
      'banana-sub': 'That&rsquo;s more bananas than particles in the universe cubed!'
    },
    'page': {
      'year-count': '9.9 x 10',
      'year-superscript': '2135',
      'year-sub': 'That&rsquo;s a 99 with 2,134 zeroes after it!',
      'banana-count': '3.6 x 10',
      'banana-superscript': '2141',
      'banana-sub': 'That&rsquo;s bananas!'
    },
    'book': {
      'year-count': '4.3 x 10',
      'year-superscript': '250341',
      'year-sub': 'That&rsquo;s a 43 with 250,340 zeroes after it!',
      'banana-count': '1.6 x 10',
      'banana-superscript': '250347',
      'banana-sub': 'That&rsquo;s bananas!'
    },
    'works': {
      'year-count': '5.1 x 10',
      'year-superscript': '7796870',
      'year-sub': 'That&rsquo;s 51 with 7.7 million zeroes after it!',
      'banana-count': '1.8 x 10',
      'banana-superscript': '7796876',
      'banana-sub': 'That&rsquo;s bananas!'
    }
  },
  'billion': {
    'word': {
      'year-count': '1.3',
      'year-superscript': '',
      'year-sub': 'The world&rsquo;s population of monkeys is only in the millions!',
      'banana-count': '480 billion',
      'banana-superscript': '',
      'banana-sub': 'That&rsquo;s all the bananas produced globally in 14 years!'
    },
    'sentence': {
      'year-count': '1.7 x 10',
      'year-superscript': '269',
      'year-sub': 'That&rsquo;s a 17 with 268 zeroes after it!',
      'banana-count': '6.1 x 10',
      'banana-superscript': '280',
      'banana-sub': 'That&rsquo;s more bananas than particles in the universe cubed!'
    },
    'page': {
      'year-count': '9.9 x 10',
      'year-superscript': '2129',
      'year-sub': 'That&rsquo;s a 99 with 2,128 zeroes after it!',
      'banana-count': '3.6 x 10',
      'banana-superscript': '2141',
      'banana-sub': 'That&rsquo;s bananas!'
    },
    'book': {
      'year-count': '4.3 x 10',
      'year-superscript': '250335',
      'year-sub': 'That&rsquo;s a 43 with 250,334 zeroes after it!',
      'banana-count': '1.6 x 10',
      'banana-superscript': '250347',
      'banana-sub': 'That&rsquo;s bananas!'
    },
    'works': {
      'year-count': '5.1 x 10',
      'year-superscript': '7796864',
      'year-sub': 'That&rsquo;s 51 with 7.7 million zeroes after it!',
      'banana-count': '1.8 x 10',
      'banana-superscript': '7796876',
      'banana-sub': 'That&rsquo;s bananas!'
    }
  }
};

function hide(selector) {
  if ($(selector).is(":visible")) {
    $(selector).transition('fade up');
  }
}

function show(selector) {
  if (!$(selector).is(":visible")) {
    $(selector).transition('fade down');
  }
}

Template.Home.events({
  "input #email-box": function(event) {
    hide('#email-submit-dialog');
    hide('#email-submit-error');
    hide('#email-duplicate-error');

    var text = event.target.value;
    var button = $('#update-button');
    if (text.length > 0) {
      button.removeClass('tertiary').addClass('primary');
    } else {
      button.removeClass('primary').addClass('tertiary');
    }
  },
  "submit form": function(event) {
    event.preventDefault();
    var email = $('[name=subscribe-email]').val().trim();
    if (email.length != 0) {
      $('#update-button').addClass('loading');
      Meteor.call('server/insert_email', email, function(error, result) {
        $('#update-button').removeClass('loading');
        if (result === true) {
          Meteor.call('server/send_subscribe_email', email);
          show('#email-submit-dialog');
          $('[name=subscribe-email]').val('');
        } else {
          if (result.stack.indexOf('duplicate key') != -1) {
            show('#email-duplicate-error');
          } else {
            show('#email-submit-error');
          }
        }
      });
    }
  },
  "click .close.icon": function(event) {
    hide($(event.target).closest('.message'));
  }
});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.Home.helpers({
});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
  $('.ui.form')
      .form({
        fields: {
          'subscribe-email': {
            rules: [
              {
                type: 'email',
                prompt: 'Enter a valid email address to receive updates.'
              }
            ]
          }
        }
      });
});

Template.Home.onRendered(function () {
  var dropdown = $('.ui.dropdown');
  dropdown.dropdown('restore defaults');
  $('.ui.accordion').accordion();

  dropdown.on('click', function() {
    var monkeys = $('#monkey-dropdown').dropdown('get value');
    var text = $('#text-dropdown').dropdown('get value');
    _.each(calculations[monkeys][text], function(value, key) {
      $('#' + key).html(value);
    });
  });
});

Template.Home.onDestroyed(function () {
});
