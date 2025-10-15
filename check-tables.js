const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('=== CHECKING DATABASE STRUCTURE ===');
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) console.error(err);
  else {
    console.log('Available tables:');
    tables.forEach((table) => {
      console.log(`- ${table.name}`);
    });

    if (tables.find((t) => t.name === 'match')) {
      console.log('\n=== CHECKING MATCH TABLE STRUCTURE ===');
      db.all('PRAGMA table_info(match)', (err, columns) => {
        if (err) console.error(err);
        else {
          console.log('Match table columns:');
          columns.forEach((col) => {
            console.log(`- ${col.name} (${col.type})`);
          });
        }

        console.log('\n=== CHECKING MATCH DATA ===');
        db.all('SELECT * FROM match LIMIT 5', (err, matches) => {
          if (err) console.error(err);
          else {
            console.log('Sample matches:');
            matches.forEach((match) => {
              console.log(
                `- Match ID: ${match.id}, Fields:`,
                Object.keys(match),
              );
            });
          }

          db.close();
        });
      });
    } else {
      db.close();
    }
  }
});
