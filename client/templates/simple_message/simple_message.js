/*****************************************************************************/
/* SimpleMessage: Event Handlers */
/*****************************************************************************/
Template.SimpleMessage.events({
});

/*****************************************************************************/
/* SimpleMessage: Helpers */
/*****************************************************************************/
Template.SimpleMessage.helpers({
  'validation': function(message) {
    console.log(message);
  }
});

/*****************************************************************************/
/* SimpleMessage: Lifecycle Hooks */
/*****************************************************************************/
Template.SimpleMessage.onCreated(function () {
});

Template.SimpleMessage.onRendered(function () {
  var data = this.data;
  if (data.redirect && data.timeout) {
    setTimeout(function() {
      Router.go(data.redirect);
    }, data.timeout);
  }
});

Template.SimpleMessage.onDestroyed(function () {
});
