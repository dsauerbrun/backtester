import Redis from 'redis'
import { promisify } from 'util'

class RedisClient {
  _client: any
  _lrangeAsync: any
  _flushallAsync: any
  _ltrimAsync: any
  _llenAsync: any
  _lpopAsync: any
  _rpushAsync: any
  _rpushxAsync: any
  _setAsync: any
  _setnxAsync: any
  _getAsync: any
  _delAsync: any
  _existsAsync: any
  _expireAsync: any

  constructor() {
    this._client = Redis.createClient()

    this._client.on('error', (error: Error) => {
      console.error('Redis Client Failure - ', error)
    })
    this._flushallAsync = promisify(this._client.flushall).bind(this._client)
    this._setAsync = promisify(this._client.set).bind(this._client)
    this._setnxAsync = promisify(this._client.setnx).bind(this._client)
    this._getAsync = promisify(this._client.get).bind(this._client)
    this._delAsync = promisify(this._client.del).bind(this._client)
    this._existsAsync = promisify(this._client.exists).bind(this._client)
    this._expireAsync = promisify(this._client.expire).bind(this._client)
    this._lrangeAsync = promisify(this._client.lrange).bind(this._client)
    this._llenAsync = promisify(this._client.llen).bind(this._client)
    this._ltrimAsync = promisify(this._client.ltrim).bind(this._client)
    this._lpopAsync = promisify(this._client.lpop).bind(this._client)
    this._rpushAsync = promisify(this._client.rpush).bind(this._client)
    this._rpushxAsync = promisify(this._client.rpushx).bind(this._client)
  }

  get new() {
    const client = Redis.createClient()

    client.on('error', (error: Error) => {
      console.error('Redis Client Failure - ', error)
    })

    return client
  }

  get client() {
    return this._client
  }

  async exists(...args: any[]): Promise<number> {
    return await this._existsAsync(args)
  }

  async expire(...args: any[]): Promise<number> {
    return await this._expireAsync(args)
  }

  async del(...args: any[]): Promise<number> {
    return await this._delAsync(args)
  }

  async flushall(...args: any[]): Promise<number> {
    return await this._flushallAsync(args)
  }

  async lrange(...args: any[]): Promise<string[]> {
    return await this._lrangeAsync(args)
  }

  async llen(...args: any[]): Promise<number> {
    return await this._llenAsync(args)
  }

  async ltrim(...args: any[]): Promise<number> {
    return await this._ltrimAsync(args)
  }

  async lpop(...args: any[]): Promise<string> {
    return await this._lpopAsync(args)
  }

  async rpush(...args: any[]): Promise<number> {
    return await this._rpushAsync(args)
  }

  async rpushx(...args: any[]): Promise<number> {
    return await this._rpushxAsync(args)
  }

  async set(...args: any[]): Promise<string> {
    return await this._setAsync(args)
  }

  async setnx(...args: any[]): Promise<string> {
    return await this._setnxAsync(args)
  }

  async get(...args: any[]): Promise<string> {
    return await this._getAsync(args)
  }
}

export default new RedisClient()
