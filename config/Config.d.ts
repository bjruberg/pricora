/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    setup: Setup
    database: Database
    frontend: Frontend
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
    _bind_desc: string
    _cert_desc: string
    pathToCertFile: string
    pathToKeyFile: string
    _port_desc: string
    port: number
    _https_desc: string
    https: boolean
    _http2_desc: string
    http2: boolean
  }
  interface Frontend {
    dateFormat: string
    defaultCountry: string
    hostname: string
    language: string
    greeting: string
    pageTitle: string
    _requiredContactFields: string
    requiredContactFields: string[]
  }
  interface Database {
    path: string
  }
  interface Setup {
    _adminEmail_desc: string
    adminEmail: string
    _initialAdminPassword_desc: string
    initialAdminPassword: string
  }
  export const config: Config
  export type Config = IConfig
}
