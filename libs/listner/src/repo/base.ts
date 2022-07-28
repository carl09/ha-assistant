import { Observable } from 'rxjs';
import { watch, writeFileSync, existsSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import { logging } from '../utils/logging';

export const fileStore$ = (fileName: string): Observable<string> => {
    logging.log('fileStore$', fileName);

  if (!existsSync(fileName)) {
    writeFileSync(fileName, '', 'utf8');
  }

  return new Observable((obs) => {
    watch(fileName, (event, name) => {
      if (name) {
        logging.log(`${name} file Changed`);
        readFile(fileName, 'utf8').then((x) => {
          obs.next(x);
        });
      }
    });
  });
};

export const writeToFile = async (fileName: string, contents: string) => {
  return writeFile(fileName, contents, 'utf8');
};
