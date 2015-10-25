/*****************************************************************************/
/* AccountModals: Event Handlers */
/*****************************************************************************/

var monikerTimer = null;

setMonikerField = function(elem) {
  $('#moniker-field').val($(elem).text());
};


function checkMoniker(register) {
  var monikerField = $('#moniker-field');
  var moniker = monikerField.val();
  var subprompt = $('#moniker-error-prompt h5');
  Meteor.call('accounts/check_moniker', moniker, function(error, result) {
    if (!error) {
      if (!result.valid) {
        subprompt.html('The secret name must contain between 3 and 30 characters, spaces excluded.');
        showIfInvisible('#moniker-error-prompt');
        return false;
        // handle invalid moniker (must have 3 or more characters)
      } else if (result.exists) {
        subprompt.html('Sorry, this name is in use already.');
        showIfInvisible('#moniker-error-prompt');
        return false;
      } else {
        hideIfVisible('#moniker-error-prompt');
        $('.spy.icon').addClass('green');
        monikerField.addClass('valid-background');
        if (register) {
          Meteor.call('accounts/register_moniker', moniker, function(error, result) {
            if (error || !result) {
              subprompt.html('An unknown error occurred.');
              showIfInvisible('#moniker-error-prompt');
            } else {
              $('#moniker-modal').modal('hide');
              Router.go('submissions');
            }
          });
        }
      }
    } else {
      subprompt.html('An unknown error occurred.');
      showIfInvisible('#moniker-error-prompt');
      return false;
    }
  });
}

function closeAccordion() {
  $('.ui.accordion').accordion('close', 0);
}

function openAccordion() {
  $('.ui.accordion').accordion('open', 0);
}

function hideIfVisible(classifier) {
  if ($(classifier).is(':visible')) {
    $(classifier).removeClass('visible');
    $(classifier).removeClass('transition');
    $(classifier).transition('fade out');
  }
}

function showIfInvisible(classifier) {
  if (!$(classifier).is(':visible')) {
    $(classifier).removeClass('hidden');
    $(classifier).removeClass('transition');
    $(classifier).transition('fade in');
  }
}

function setVerifyModal(headerText, bodyText, buttonText, email, resendMethod) {
  $('#verify-modal h3').html(headerText);
  $('#verify-modal h4').html(bodyText);
  $('#verify-modal #resend-text').html(buttonText);
  Session.set('email', email);
  Session.set('resendMethod', resendMethod);
}

function showErrors(error) {
  var errorMessage = $('.error-message');
  if (error === null) {
    if (errorMessage.is(':visible')) {
      errorMessage.transition('fade up out');
    }
  } else {
    var errorHtml = $(error).html();
    if (errorMessage.html() == errorHtml) {
      if (errorMessage.is(':visible')) {
        errorMessage.transition('pulse');
      } else {
        errorMessage.transition('fade up in');
      }
    } else {
      errorMessage.html(errorHtml);
      var errorClass = $(error).hasClass('negative') ? 'negative' : 'info';
      if (errorMessage.hasClass('info')) {
        if (errorClass == 'negative') {
          errorMessage.removeClass('info');
          errorMessage.addClass('negative');
        }
      } else if (errorMessage.hasClass('negative')) {
        if (errorClass == 'info') {
          errorMessage.removeClass('negative');
          errorMessage.addClass('info');
        }
      } else {
        errorMessage.addClass(errorClass);
      }
      if (!errorMessage.is(':visible')) {
        $('.error-message').transition('fade up in');
      } else {
        errorMessage.transition('fade up in');
      }
    }
  }

  $(".error-message .close.icon").on('click', function(event) {
    errorMessage.transition('fade out');
  });
}

/*****************************************************************************/
/* AccountModals: Helpers */
/*****************************************************************************/
Template.AccountModals.helpers({
  'email': function() {
    return Session.get('email');
  },
  'monikers': function() {
    return Session.get('moniker-suggestions');
  }
  //'monikers': [
  //    'William Wordsmith',
  //    'Mark Twainish',
  //    'Corella DeGuire',
  //    'J. K. Bowling',
  //    'Nancy Pedigrew',
  //    'Penumbron Cortez',
  //    'Marcy McMackerell',
  //    'Troy Raven',
  //    'Courtney Joygood',
  //    'Peniferous Kline',
  //    'Ron Magenta',
  //    'Coffee Grounds',
  //    'Alejandro R. Martinez',
  //    'Volkswagen Jones',
  //    'P. J. Petersen',
  //    'Travis McCloy'
  //]
});

/*****************************************************************************/
/* AccountModals: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountModals.onCreated(function () {
  Session.set('moniker-suggestions', null);
});

Template.AccountModals.onRendered(function () {

  $('#create-modal').modal({
    onHide: function () {
      $('#create-modal .form').form('reset');
      var forgotFields = $('#forgot-fields');
      if (forgotFields.is(':visible')) {
        forgotFields.css('display', 'none');
      }
      showErrors(null);
    }
  });

  $('#forgot-password-modal').modal({
    onHide: function () {
      $('#forgot-password-modal .form').form('reset');
      var resetPromt = $('#reset-no-email-prompt');
      if (resetPromt.is(':visible')) {
        resetPromt.transition('fade out');
      }
    }
  });

  Session.set('moniker-suggestions', null);
  Meteor.call('server/fakenames', function(error, result) {
    if (!error) {
      Session.set('moniker-suggestions', result);
      $('.suggestions-refresh').removeClass('no-display');
      $('.suggestions-loader').addClass('no-display');
    }
  });

  $('.suggestions-refresh').on('click', function() {
    $('.suggestions-refresh').addClass('no-display');
    $('.suggestions-loader').removeClass('no-display');
    Meteor.call('server/fakenames', function(error, result) {
      if (!error) {
        Session.set('moniker-suggestions', result);
        $('.suggestions-refresh').removeClass('no-display');
        $('.suggestions-loader').addClass('no-display');
      }
    });
  });

  $('.ui.accordion').accordion({
    selector: {
      trigger: '.icon.dropdown'
    },
    onOpening: function() {
      $('.refresh.icon').animate({'opacity': 1});
    },
    onClosing: function() {
      $('.refresh.icon').animate({'opacity': 0});
    }
  });
  $('.coupled.modal').modal({
    allowMultiple: false
  });

  $("#password-progress").progress();

  $('#create-modal .form').form({
    fields: {
      email: ['email'],
      'password': ['minLength[6]']
    },
    inline: true
  });

  $('#create-modal .form').on('submit', function(e) {
    e.preventDefault();
  });

  $('#forgot-password-modal .form').form({
    fields: {
      'email-reset': ['email']
    },
    inline: true
  });

  $('#moniker-modal .form').form({
    fields: {
      moniker: ['minLength[3]', 'maxLength[30]']
    },
    inline: true
  });

  $('#moniker-modal .form').on('submit', function(e) {
    e.preventDefault();
  });

  $('[name=email-reset]').on('focus', function() {
    if ($('#reset-no-email-prompt').is(':visible')) {
      $('#reset-no-email-prompt').transition('fade up out');
    }
  });

  $('#send-reset').on('click', function(e) {
    var email = $('[name="email-reset"]').val();
    Meteor.call('accounts/generate_reset_password_link', email, function(error, result) {
      if (error) {
        if (error.error === "emailverify") {
          Session.setPersistent('returnPage', Router.current().url);
          setVerifyModal(
              'We&rsquo;ve sent another verification email to ' + email + '.',
              'You need to verify your email before you can reset the password. Click on the link in the email to finish creating your account.',
              'Resend Email',
              email,
              'accounts/resend_verification'
          );
          $('#verify-modal').modal('show');
        } else if (error.error === "usernotfound") {
          $('#reset-no-email-prompt').transition('fade up in');
        }
      } else if (result) {
        Session.setPersistent('returnPage', Router.current().url);
        setVerifyModal(
            'We&rsquo;ve sent a password reset link to ' + email + '.',
            'You should receive it soon. Click on the link in the email to reset your password.',
            'Resend Email',
            email,
            'accounts/generate_reset_password_link'
        );
        $('#verify-modal').modal('show');
      }
    });
  });

  $('#forgot-password-modal .form').on('submit', function(e) {
    e.preventDefault();
  });

  $('#create-account').on('click', function() {
    if ($('#create-modal .form').form('is valid')) {
      var email = $('[name=email]').val();
      Meteor.call('accounts/check_user', email, function (error, result) {
        if (error) {
          console.log(error);
          showErrors('#unknown-error');
        } else {
          if (result.exists) {
            showErrors('#registered-error');
          } else {
            var password = $('[name=password]').val();
            Meteor.call('accounts/create_user', email, password, function(error) {
              if (error) {
                console.log(error);
                showErrors('#unknown-error');
              } else {
                Session.setPersistent('returnPage', Router.current().url);
                setVerifyModal(
                    'We&rsquo;ve sent a verification email to ' + email + '.',
                    'You should receive it soon. Click on the link in the email to finish creating your account.',
                    'Resend Email',
                    email,
                    'accounts/resend_verification'
                );
                $('#verify-modal').modal('show');
              }
            });
          }
        }
      });
    }
  });

  $('#log-in').on('click', function() {
    if ($('#create-modal .form').form('is valid')) {
      var email = $('[name=email]').val();
      var password = $('[name=password]').val();

      Meteor.loginWithPassword({email: email}, password, function(error) {
        if (error) {
          if (error.error === "verification") {
            Session.setPersistent('returnPage', Router.current().url);
            Meteor.call('accounts/resend_verification', email);
            setVerifyModal(
                'We&rsquo;ve resent a verification email to ' + email + '.',
                'You&rsquo;ve already created an account but still need to verify it. Click on the link in the email to finish creating your account.',
                'Resend Email',
                email,
                'accounts/resend_verification'
            );
            $('#verify-modal').modal('show');
          } else {
            showErrors('#combo-error');
            if (!$('#forgot-fields').is(':visible')) {
              $('#forgot-fields').transition('fade up in');
            }
          }
        } else {
          $('#create-modal').modal('hide');
        }
      });
    } else {
      showIfInvisible('#forgot-fields');
    }
  });

  $('.login-back').on('click', function() {
    $('#forgot-password-modal .form').form('reset');
    $('#create-modal').modal('show');
  });

  $('#forgot-password-link').on('click', function() {
    $('#forgot-password-modal').modal('show');
  });

  $('#moniker-field').on('input', function(e) {
    var field = $(e.target);
    var text = field.val();
    $('.spy.icon').removeClass('green');
    field.removeClass('valid-background');

    hideIfVisible('#moniker-error-prompt');

    if (monikerTimer != null) {
      clearTimeout(monikerTimer);
    }

    if (text.length >= 3 && text.length <= 30) {
      monikerTimer = setTimeout(checkMoniker, 1000);
    }

    if ($('#moniker-field').val().length == 0) {
      openAccordion();
    } else {
      closeAccordion();
    }
  });

  $('#suggestions-moniker-text').on('click', function() {
    $('.ui.accordion').accordion('toggle', 0);
  });

  $('#resend-button').on('click', function() {
    $('#resend-button').addClass('disabled');
    $('#resend-text').addClass('switch');
    $('#resend-loader').addClass('switch');
    Session.setPersistent('returnPage', Router.current().url);
    Meteor.call('accounts/resend_verification', Session.get('email'), function() {
      $('#resend-button').removeClass('disabled');
      $('#resend-text').removeClass('switch');
      $('#resend-loader').removeClass('switch');
    });
  });

  $('#moniker-submit').on('click', function() {
    checkMoniker(true);
  });

  $('[name=password]').on('focus', function() {
    showErrors(null);
    if ($('[name=password]').val().length > 0) {
      showIfInvisible('#password-progress');
    }
  });

  $('[name=email]').on('focus', function() {
    showErrors(null);
  });

  $('[name=password]').on('blur', function() {
    hideIfVisible('#password-progress');
  });

  $('[name=password]').on('input', function() {
    var length = $('[name=password]').val().length;

    if (length == 0) {
      hideIfVisible('#password-progress');
    } else {
      showIfInvisible('#password-progress');
    }

    var percent = length / 8.0 * 100.0;
    if (percent > 100.0) {
      percent = 100.0;
    }

    $('#password-progress').progress({
      percent: percent
    });
  });
});

Template.AccountModals.onDestroyed(function () {
});
