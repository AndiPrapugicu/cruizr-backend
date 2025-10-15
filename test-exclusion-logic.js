const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== TESTING CORRECTED MATCH QUERY ===');
db.all(
  'SELECT * FROM match WHERE userAId = 1 OR userBId = 1',
  (err, matches) => {
    if (err) console.error(err);
    else {
      console.log(`Found ${matches.length} matches for user 1:`);
      matches.forEach((match) => {
        const otherUser = match.userAId === 1 ? match.userBId : match.userAId;
        console.log(
          `- Match ID: ${match.id}, Other user: ${otherUser}, Status: ${match.status}`,
        );
      });

      const excludedFromMatches = matches.map((match) =>
        match.userAId === 1 ? match.userBId : match.userAId,
      );
      console.log(
        `\nExcluded user IDs from matches: [${excludedFromMatches.join(', ')}]`,
      );
    }

    console.log('\n=== TESTING SWIPES QUERY ===');
    db.all(
      'SELECT * FROM swipes WHERE userId = 1 ORDER BY createdAt DESC LIMIT 10',
      (err, swipes) => {
        if (err) console.error(err);
        else {
          console.log(`Found ${swipes.length} recent swipes by user 1:`);
          swipes.forEach((swipe) => {
            console.log(
              `- Swipe ID: ${swipe.id}, Target: ${swipe.targetUserId}, Direction: ${swipe.direction}, Date: ${swipe.createdAt}`,
            );
          });

          const excludedFromSwipes = swipes.map((swipe) => swipe.targetUserId);
          console.log(
            `\nExcluded user IDs from swipes: [${excludedFromSwipes.join(', ')}]`,
          );
        }

        db.close();
      },
    );
  },
);
