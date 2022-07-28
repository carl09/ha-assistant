import { Observable } from 'rxjs';
import { watchFile, unwatchFile, writeFileSync, existsSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import { logging } from '../utils/logging';

export const fileStore$ = (fileName: string): Observable<string> => {
  logging.log(`fileStore$ ${fileName}`);

  if (!existsSync(fileName)) {
    logging.debug(`File does not exist ${fileName}`);
    writeFileSync(fileName, '', 'utf8');
  } else {
    logging.debug(`File exists ${fileName}`);
  }

  return new Observable((obs) => {
    logging.debug(`creating watch on ${fileName}`);

    readFile(fileName, 'utf8').then((x) => {
      obs.next(x);
    });

    watchFile(fileName, () => {
      logging.log(`file Changed ${fileName}`);
      readFile(fileName, 'utf8').then((x) => {
        obs.next(x);
      });
    });

    // logging.debug('File watcher', watcher);

    return () => unwatchFile(fileName);
  });
};

export const readToFile = (fileName: string) => {
  return readFile(fileName, 'utf8');
};

export const writeToFile = async (fileName: string, contents: string) => {
  return writeFile(fileName, contents, 'utf8');
};
