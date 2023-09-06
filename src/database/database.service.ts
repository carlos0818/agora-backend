import { Global } from '@nestjs/common';
import { createConnection, Connection, createPool, Pool } from 'mysql2/promise';

@Global()
export class DatabaseService {
  private connection: Pool;

  constructor() {
    this.connection = createPool({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 10,
    });
  }

  async getConnection() {
    return this.connection.getConnection();
  }

  async closeConnection(conexion: any) {
    if (conexion) {
      conexion.release();
    }
  }

  // async connect(): Promise<void> {
  //   this.connection = await createConnection({
  //       host: process.env.DATABASE_HOST,
  //       port: parseInt(process.env.DATABASE_PORT, 10),
  //       user: process.env.DATABASE_USER,
  //       password: process.env.DATABASE_PASSWORD,
  //       database: process.env.DATABASE_NAME,
  //       connectionLimit: 10,
  //   });
  // }

  // async disconnect(): Promise<void> {
  //   await this.connection.end();
  // }

  // getConnection(): Connection {
  //   return this.connection;
  // }

  // async beginTransaction(): Promise<void> {
  //   await this.connection.beginTransaction();
  // }

  // async commit(): Promise<void> {
  //   await this.connection.commit();
  // }

  // async rollback(): Promise<void> {
  //   await this.connection.rollback();
  // }
}