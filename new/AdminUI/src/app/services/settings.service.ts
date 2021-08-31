import { Injectable } from '@angular/core';
import { SettingsModel } from '../models/settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public settings: SettingsModel;
  constructor() {
    this.settings = new SettingsModel();
  }
}
