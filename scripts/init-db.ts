import { MongoClient } from 'mongodb';
import { loadConfig } from '../apps/api/src/config.js';
import { initialize } from '../apps/api/src/database/initialize.js';
const config = loadConfig(), client = new MongoClient(config.uri);
try { await client.connect(); await initialize(client.db(config.dbName)); console.log('Four collections, strict validators and indexes ready. No sample data inserted; no migration performed.'); } finally { await client.close(); }
