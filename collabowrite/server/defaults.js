VOTES_PER_ITERATION = 5;

REGISTRATION_MONIKERS_N = 12;

RESERVED_MONIKERS = ['Anonymous'];
        
loadDefaults = function() {
  if (Meteor.users.find({}).count() < 5) {
    Accounts.createUser({
      email: 'freedmand@gmail.com',
      password: 'dsfdsf',
      profile: {
        moniker: 'Laura Bergstrom',
        moniker_norm: "LAURABERGSTROM"
      }
    });
    
    Accounts.createUser({
      email: 'test@test.io',
      password: 'asdfasdf',
      profile: {
        moniker: 'J. K. Rowling',
        moniker_norm: "JKROWLING"
      }
    });
    
    Accounts.createUser({
      email: 'test2@test.io',
      password: 'asdfasdf',
      profile: {
        moniker: 'Chief Edinburgh',
        moniker_norm: "CHIEFEDINBURGH"
      }
    });
    
    Accounts.createUser({
      email: 'test3@test.io',
      password: 'asdfasdf',
      profile: {
        moniker: 'Penelope Smith',
        moniker_norm: "PENELOPESMITH"
      }
    });
    
    Accounts.createUser({
      email: 'test4@test.io',
      password: 'asdfasdf',
      profile: {
        moniker: 'J. H. Parisian',
        moniker_norm: "JHPARISIAN"
      }
    });
    
    Accounts.createUser({
      email: 'test5@test.io',
      password: 'asdfasdf',
      profile: {
        moniker: 'Severus Snape',
        moniker_norm: "SEVERUSSNAPE"
      }
    });
  }
  
  if (Submissions.find({}).count() < 3) {
    Submissions.insert({
      'title': "Deathly Hallows",
      'body': "Quite the dubious tale of a young boy entering his 17th year who finds it unbearable, the prospect of not practicing the dark spells outside of his attic room that is. Well, much happens and ancient symbolism bears truths as ghosts recounts centuries-old tales. Quite a cliffhanger, I think!",
      'author': 'J. K. Rowling',
      'moniker_norm': 'JKROWLING',
      'hidden': {
        'moniker_norm': 'JKROWLING'
      },
      "upvotes": 0,
      "downvotes": 0
    });
    
    Submissions.insert({
      'title': "Goblet of Ice Cold Water",
      'body': "In a classic twist on the book, the goblet contains not fire -- oh no! -- but quite below tepid water! Oh it baffles a young Harry as he's unable to concentrate in the cold water. This continues for some, oh, 500 pages until Ron finally saves the day with his enhanced traditional English family cold water endurance.",
      'author': 'J. K. Rowling',
      'moniker_norm': 'JKROWLING',
      'hidden': {
        'moniker_norm': 'JKROWLING'
      },
      "upvotes": 0,
      "downvotes": 0
    });
    
    Submissions.insert({
      'title': "The Closed Restaurant",
      'body': "A tale taking place in Le Paris, where unbeknownst to the rest of the residents of the town, there is a serious lack of fine cuisine on the block of 34 Rue Le Grot. Chef Bolognaise comes up with a fine set of recipes to offset this troubling tradition, but finds the residents of the town so acclimated to poor taste that they cannot begin to appreciate the rich and creamy filling of his snail parfait.",
      'author': 'Anonymous',
      'moniker_norm': 'ANONYMOUS',
      'hidden': {
        'moniker_norm': 'JHPARISIAN'
      },
      "upvotes": 0,
      "downvotes": 0
    });
    
  }
}
