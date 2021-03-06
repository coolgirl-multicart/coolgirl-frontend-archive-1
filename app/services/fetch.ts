import Service from '@ember/service';
import fetch from 'fetch';
import config from 'coolgirl-frontend/config/environment';
import { ApiGames, GameObj } from 'coolgirl-frontend/types';
import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import Ember from 'ember';

export default class FetchService extends Service {
  get host(): string {
    return Ember.testing ? '' : config.apiHost;
  }

  get baseURL(): string {
    return config.apiNamespace ? `${this.host}/${config.apiNamespace}` : this.host;
  }

  _url(resource: string): string {
    return `${this.baseURL}/${resource}`;
  }

  async fetchJSON(resource: string): Promise<unknown> {
    const url = this._url(resource);
    const response = await fetch(url);
    return response.json();
  }

  async fetchGames(): Promise<GameObj[]> {
    const result = (await this.fetchJSON('games')) as ApiGames;
    return result.games;
  }

  @dropTask({ withTestWaiter: true }) fetchGamesTask = taskFor(async function (
    this: FetchService
  ): Promise<GameObj[]> {
    return await this.fetchGames();
  });

  get games(): GameObj[] {
    return this.fetchGamesTask.last?.value || [];
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    fetch: FetchService;
  }
}
