const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== CHECKING LIKES TABLE ===');
db.all(
  'SELECT * FROM likes WHERE senderId = 1 OR receiverId = 1 ORDER BY createdAt DESC LIMIT 10',
  (err, likes) => {
    if (err) console.error(err);
    else {
      console.log('Recent likes involving user 1:');
      likes.forEach((like) => {
        console.log(
          `- ID: ${like.id}, Sender: ${like.senderId}, Receiver: ${like.receiverId}, Type: ${like.type}, Created: ${like.createdAt}`,
        );
      });
    }

    console.log('\n=== CHECKING MATCHES TABLE ===');
    db.all(
      'SELECT * FROM match WHERE userA = 1 OR userB = 1',
      (err, matches) => {
        if (err) console.error(err);
        else {
          console.log('Matches involving user 1:');
          matches.forEach((match) => {
            console.log(
              `- ID: ${match.id}, UserA: ${match.userA}, UserB: ${match.userB}, Created: ${match.createdAt}`,
            );
          });
        }

        console.log('\n=== CHECKING RECENT_SWIPES TABLE ===');
        db.all(
          'SELECT * FROM recent_swipes WHERE swiperId = 1',
          (err, swipes) => {
            if (err) console.error(err);
            else {
              console.log('Recent swipes by user 1:');
              swipes.forEach((swipe) => {
                console.log(
                  `- ID: ${swipe.id}, Swiper: ${swipe.swiperId}, Swiped: ${swipe.swipedId}, Created: ${swipe.createdAt}`,
                );
              });
            }

            console.log('\n=== CHECKING ALL USERS ===');
            db.all(
              'SELECT id, firstName FROM users WHERE id != 1 ORDER BY id',
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
  },
);
