import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigModel } from '../models/config.model';
import { SettingsService } from './settings.service';

@Injectable()
export class ConfigService {
  configUrl: string;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
  ) {
    this.configUrl = `${this.settingsService.settings.apiUrl}/api/config/`;
  }

  public getConfig() {
    return this.http.get<ConfigModel>(this.configUrl);
  }

  public saveConfig(config: ConfigModel) {
    return this.http.put(this.configUrl, config);
  }
}
