const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== CHECKING SWIPES TABLE ===');
db.all(
  'SELECT * FROM swipes WHERE swiperId = 1 ORDER BY createdAt DESC LIMIT 10',
  (err, swipes) => {
    if (err) console.error(err);
    else {
      console.log('Recent swipes by user 1:');
      swipes.forEach((swipe) => {
        console.log(
          `- ID: ${swipe.id}, Swiper: ${swipe.swiperId}, Swiped: ${swipe.swipedUserId}, Type: ${swipe.type}, Created: ${swipe.createdAt}`,
        );
      });
    }

    console.log('\n=== CHECKING MATCHES TABLE ===');
    db.all(
      'SELECT * FROM match WHERE userAId = 1 OR userBId = 1',
      (err, matches) => {
        if (err) console.error(err);
        else {
          console.log('Matches involving user 1:');
          matches.forEach((match) => {
            console.log(
              `- ID: ${match.id}, UserA: ${match.userAId}, UserB: ${match.userBId}, Status: ${match.status}`,
            );
          });
        }

        console.log('\n=== CHECKING ALL USERS ===');
        db.all(
          'SELECT id, firstName FROM user WHERE id != 1 ORDER BY id',
          (err, users) => {
            if (err) console.error(err);
            else {
              console.log('All other users:');
              users.forEach((user) => {
                console.log(`- ID: ${user.id}, Name: ${user.firstName}`);
              });
            }

            db.close();
          },
        );
      },
    );
  },
);
