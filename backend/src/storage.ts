import sqlite3 from 'sqlite3';

export interface StoredAuth { username: string; password: string; }

export const createDatabase = () => {
  const db = new sqlite3.Database(':memory:');

  const init = async () => {
    await new Promise<void>((resolve, reject) => {
      db.run(
        'CREATE TABLE IF NOT EXISTS auth_sessions (username TEXT NOT NULL, password TEXT NOT NULL)',
        (err) => (err ? reject(err) : resolve()),
      );
    });
  };

  const saveAuth = async (auth: StoredAuth) => {
    await new Promise<void>((resolve, reject) => {
      db.run('INSERT INTO auth_sessions (username, password) VALUES (?, ?)', [auth.username, auth.password], (err) => (err ? reject(err) : resolve()));
    });
  };

  const listAuth = async () => {
    return new Promise<StoredAuth[]>((resolve, reject) => {
      db.all('SELECT username, password FROM auth_sessions', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as StoredAuth[]);
      });
    });
  };

  return { init, saveAuth, listAuth };
};
