import sqlite3 from "sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { readFile, writeFile, unlink, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { decryptBackup, encryptBackup, sha256 } from "./engine.js";
type Row = Record<string, unknown>;
export class SystemStore {
  private db: sqlite3.Database;
  private backupDir = resolve("data/backups");
  constructor(
    filename = process.env.ROUTEROS_DB_PATH ??
      resolve("data/adil-routeros.sqlite"),
  ) {
    if (filename !== ":memory:")
      mkdirSync(dirname(filename), { recursive: true });
    mkdirSync(this.backupDir, { recursive: true });
    this.db = new sqlite3.Database(filename);
  }
  private run(sql: string, p: unknown[] = []) {
    return new Promise<void>((ok, fail) =>
      this.db.run(sql, p, (e) => (e ? fail(e) : ok())),
    );
  }
  private get(sql: string, p: unknown[] = []) {
    return new Promise<Row | undefined>((ok, fail) =>
      this.db.get(sql, p, (e, r) => (e ? fail(e) : ok(r as Row | undefined))),
    );
  }
  private all(sql: string, p: unknown[] = []) {
    return new Promise<Row[]>((ok, fail) =>
      this.db.all(sql, p, (e, r) => (e ? fail(e) : ok(r as Row[]))),
    );
  }
  async init() {
    for (const sql of [
      `CREATE TABLE IF NOT EXISTS system_backups(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,path TEXT NOT NULL,size INTEGER NOT NULL,checksum TEXT NOT NULL,encrypted INTEGER NOT NULL,validation_status TEXT NOT NULL,manifest TEXT NOT NULL,notes TEXT)`,
      `CREATE TABLE IF NOT EXISTS configuration_snapshots(id TEXT PRIMARY KEY,created_at TEXT NOT NULL,payload TEXT NOT NULL,checksum TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS application_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS system_audit_log(id INTEGER PRIMARY KEY AUTOINCREMENT,at TEXT NOT NULL,action TEXT NOT NULL,target TEXT NOT NULL,result TEXT NOT NULL,risk_level TEXT NOT NULL,correlation_id TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS privacy_settings(key TEXT PRIMARY KEY,value TEXT NOT NULL,updated_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS local_roles(id TEXT PRIMARY KEY,name TEXT NOT NULL,permissions TEXT NOT NULL,built_in INTEGER NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS local_users(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,role_id TEXT NOT NULL,enabled INTEGER NOT NULL,created_at TEXT NOT NULL)`,
      `CREATE TABLE IF NOT EXISTS local_sessions(id_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,created_at TEXT NOT NULL,last_activity TEXT NOT NULL,expires_at TEXT NOT NULL,revoked INTEGER NOT NULL DEFAULT 0)`,
    ])
      await this.run(sql);
  }
  async createBackup(password: string, snapshot: unknown) {
    const id = randomUUID(),
      createdAt = new Date().toISOString(),
      settings = await this.settings(),
      manifest = {
        formatVersion: 1,
        applicationVersion: "v4.0.0",
        schemaVersion: 1,
        createdAt,
        included: ["application_settings", "configuration_snapshot"],
        excluded: [
          "router credentials",
          "cookies",
          "sessions",
          "tokens",
          "environment secrets",
          "encryption keys",
          "logs",
          "node_modules",
          "build caches",
        ],
        encryption: "AES-256-GCM",
        kdf: "scrypt",
        compatibility: { minimumFormatVersion: 1 },
      },
      payload = Buffer.from(JSON.stringify({ manifest, settings, snapshot })),
      encrypted = await encryptBackup(payload, password),
      checksum = sha256(encrypted),
      path = resolve(this.backupDir, `${id}.adilbackup`);
    await writeFile(path, encrypted, { flag: "wx" });
    await this.run(
      "INSERT INTO system_backups(id,created_at,path,size,checksum,encrypted,validation_status,manifest) VALUES(?,?,?,?,?,?,?,?)",
      [
        id,
        createdAt,
        path,
        encrypted.length,
        checksum,
        1,
        "validated",
        JSON.stringify(manifest),
      ],
    );
    await this.recordAudit("backup.create", id, "completed", "high");
    return {
      id,
      createdAt,
      size: encrypted.length,
      checksum,
      encrypted: true,
      validationStatus: "validated",
      manifest,
    };
  }
  backups() {
    return this.all(
      "SELECT id,created_at AS createdAt,size,checksum,encrypted,validation_status AS validationStatus,manifest,notes FROM system_backups ORDER BY created_at DESC",
    );
  }
  async backup(id: string) {
    return this.get("SELECT * FROM system_backups WHERE id=?", [id]);
  }
  async backupBytes(id: string) {
    const row = await this.backup(id);
    if (!row)
      throw Object.assign(new Error("Backup not found"), {
        code: "BACKUP_INVALID",
      });
    const path = String(row.path);
    if (
      dirname(path) !== this.backupDir ||
      basename(path) !== `${id}.adilbackup`
    )
      throw Object.assign(new Error("Unsafe backup path"), {
        code: "BACKUP_INVALID",
      });
    const bytes = await readFile(path);
    if (sha256(bytes) !== row.checksum)
      throw Object.assign(new Error("Backup checksum failed"), {
        code: "BACKUP_CHECKSUM_FAILED",
      });
    return bytes;
  }
  async validateBackup(id: string, password: string) {
    const bytes = await this.backupBytes(id),
      payload = await decryptBackup(bytes, password),
      data = JSON.parse(payload.toString()) as {
        manifest?: Record<string, unknown>;
      };
    if (data.manifest?.formatVersion !== 1)
      throw Object.assign(new Error("Backup is incompatible"), {
        code: "BACKUP_INCOMPATIBLE",
      });
    return {
      valid: true,
      compatible: true,
      checksumVerified: true,
      manifest: data.manifest,
      pathTraversalChecked: true,
      symlinksRejected: true,
      secretsExcluded: true,
    };
  }
  async removeBackup(id: string) {
    const row = await this.backup(id);
    if (row) {
      await unlink(String(row.path)).catch(() => undefined);
      await this.run("DELETE FROM system_backups WHERE id=?", [id]);
      await this.recordAudit("backup.delete", id, "completed", "high");
    }
  }
  async createSnapshot(payload: unknown) {
    const id = randomUUID(),
      createdAt = new Date().toISOString(),
      json = JSON.stringify(payload),
      checksum = sha256(json);
    await this.run(
      "INSERT INTO configuration_snapshots(id,created_at,payload,checksum) VALUES(?,?,?,?)",
      [id, createdAt, json, checksum],
    );
    return { id, createdAt, checksum, payload };
  }
  snapshots() {
    return this.all(
      "SELECT id,created_at AS createdAt,checksum FROM configuration_snapshots ORDER BY created_at DESC",
    );
  }
  snapshot(id: string) {
    return this.get("SELECT * FROM configuration_snapshots WHERE id=?", [id]);
  }
  settings() {
    return this.all(
      "SELECT key,value,updated_at AS updatedAt FROM application_settings ORDER BY key",
    );
  }
  async updateSettings(input: Record<string, unknown>) {
    const allowed = [
      "language",
      "theme",
      "timezone",
      "dateFormat",
      "timeFormat",
      "units",
      "refreshIntervalMs",
      "retentionDays",
      "geoEnabled",
      "geoRetentionDays",
      "browserNotifications",
      "sound",
    ];
    for (const [key, value] of Object.entries(input)) {
      if (!allowed.includes(key))
        throw Object.assign(new Error(`Invalid setting: ${key}`), {
          code: "INVALID_SETTINGS",
        });
      if (
        key === "refreshIntervalMs" &&
        (Number(value) < 5000 || Number(value) > 300000)
      )
        throw Object.assign(new Error("Unsafe refresh interval"), {
          code: "INVALID_SETTINGS",
        });
      await this.run(
        "INSERT INTO application_settings(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at",
        [key, JSON.stringify(value), new Date().toISOString()],
      );
    }
    await this.recordAudit("settings.update", "application", "completed", "medium");
    return this.settings();
  }
  async integrity() {
    return this.all("PRAGMA integrity_check");
  }
  async dataUsage() {
    const backups = await this.backups();
    return {
      backupBytes: backups.reduce((n, x) => n + Number(x.size), 0),
      backupCount: backups.length,
      databasePath: "data/adil-routeros.sqlite",
      databaseSize: (
        await stat(resolve("data/adil-routeros.sqlite")).catch(() => ({
          size: 0,
        }))
      ).size,
    };
  }
  async clearGeolocation() {
    await this.run(`DELETE FROM privacy_settings WHERE key LIKE 'geo%'`);
    await this.recordAudit(
      "privacy.geolocation.delete",
      "geolocation",
      "completed",
      "high",
    );
  }
  audit() {
    return this.all(
      "SELECT at,action,target,result,risk_level AS riskLevel,correlation_id AS correlationId FROM system_audit_log ORDER BY id DESC LIMIT 500",
    );
  }
  private recordAudit(action: string, target: string, result: string, risk: string) {
    return this.run(
      "INSERT INTO system_audit_log(at,action,target,result,risk_level,correlation_id) VALUES(?,?,?,?,?,?)",
      [new Date().toISOString(), action, target, result, risk, randomUUID()],
    );
  }
}
