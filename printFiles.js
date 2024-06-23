const fs = require('fs');
const path = require('path');

const directoryPath = process.argv[2];

if (!directoryPath) {
  console.error('Please specify a directory path');
  process.exit(1);
}

function printFilesInDirectory(dirPath) {
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return console.error(`Unable to scan directory: ${err}`);
    }

    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          return console.error(`Unable to get file stats: ${err}`);
        }

        if (stats.isDirectory()) {
          printFilesInDirectory(filePath);
        } else {
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
              return console.error(`Unable to read file: ${err}`);
            }

            console.log(`${filePath}\n${data}\n`);
          });
        }
      });
    });
  });
}

printFilesInDirectory(directoryPath);
