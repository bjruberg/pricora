/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    adminEmail: string
    initialAdminPassword: string
    language: string
    dateFormat: string
    defaultCountry: string
    greeting: string
    pageTitle: string
    database: Database
    server: Server
    redis: Redis
    source: Source
    plugins: Plugins
    encryption: Encryption
  }
  interface Encryption {
    cipher: string
  }
  interface Plugins {
    folder: Database
  }
  interface Source {
    plugin: string
  }
  interface Redis {
    host: string
    port: number
  }
  interface Server {
    bind: string
    pathToCertFile: string
    pathToKeyFile: string
    hostname: string
    port: number
    https: boolean
  }
  interface Database {
    path: string
  }
  export const config: Config
  export type Config = IConfig
}
