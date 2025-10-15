const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== CHECKING SWIPES TABLE STRUCTURE ===');
db.all('PRAGMA table_info(swipes)', (err, columns) => {
  if (err) console.error(err);
  else {
    console.log('Swipes table columns:');
    columns.forEach((col) => {
      console.log(`- ${col.name} (${col.type})`);
    });
  }

  console.log('\n=== CHECKING USER TABLE STRUCTURE ===');
  db.all('PRAGMA table_info(user)', (err, columns) => {
    if (err) console.error(err);
    else {
      console.log('User table columns:');
      columns.forEach((col) => {
        console.log(`- ${col.name} (${col.type})`);
      });
    }

    console.log('\n=== SAMPLE SWIPES DATA ===');
    db.all('SELECT * FROM swipes LIMIT 5', (err, swipes) => {
      if (err) console.error(err);
      else {
        console.log('Sample swipes:');
        swipes.forEach((swipe) => {
          console.log(`- Swipe ID: ${swipe.id}, Fields:`, Object.keys(swipe));
        });
      }

      console.log('\n=== SAMPLE USER DATA ===');
      db.all('SELECT * FROM user LIMIT 3', (err, users) => {
        if (err) console.error(err);
        else {
          console.log('Sample users:');
          users.forEach((user) => {
            console.log(`- User ID: ${user.id}, Fields:`, Object.keys(user));
          });
        }

        console.log('\n=== MATCHES WITH USER 1 ===');
        db.all(
          'SELECT * FROM match WHERE userAId = 1 OR userBId = 1',
          (err, matches) => {
            if (err) console.error(err);
            else {
              console.log(`User 1 has ${matches.length} matches:`);
              matches.forEach((match) => {
                const otherUser =
                  match.userAId === 1 ? match.userBId : match.userAId;
                console.log(
                  `- Match with user ${otherUser}, Status: ${match.status}`,
                );
              });
            }

            db.close();
          },
        );
      });
    });
  });
});
