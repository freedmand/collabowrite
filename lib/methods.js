/*****************************************************************************/
/*  Client and Server Methods */
/*****************************************************************************/

Meteor.methods({
  'shared/wordcount': function(text) {
    return _.filter(text.split(/[\s\.\?!]/), function(d) {return d.trim().length > 0}).length;
  },
  'shared/sanitize': function(html) {
    var validTags = ['<p>', '<b>', '<i>', '<u>', '</p>', '</b>', '</i>', '</u>'];

    var output = '';

    var tagstart = false;
    var tag = null;
    for (var i = 0; i < html.length; i++) {
      if (html[i] == '<') {
        tagstart = true;
        tag = html[i];
      } else if (html[i] == '>') {
        if (tagstart) {
          tag += html[i];
          tagstart = false;
          if (_.contains(validTags, tag)) {
            output += tag;
          }
          tag = null;
        }
      } else {
        if (tagstart) {
          tag += html[i];
        } else {
          output += html[i];
        }
      }
    }
    if (tagstart) {
      output += tag;
    }

    return output;
  }
});
