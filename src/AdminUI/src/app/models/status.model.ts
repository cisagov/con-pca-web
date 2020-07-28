export class Status {
  icon_name: string;
  display_name: string;
}

export class StatusList {
  mapStatus: Map<any, any> = new Map();

  getStatus(key: any): Status {
    return this.mapStatus[key];
  }
  staticStatusList: Status[] = [];

  constructor() {
    this.staticStatusList.push({
      display_name: 'Error',
      icon_name: 'icon_prohibit.png'
    });
    this.staticStatusList.push({
      display_name: 'Paused',
      icon_name: 'icon_paused.png'
    });
    this.staticStatusList.push({
      display_name: 'Stop',
      icon_name: 'icon_stop.png'
    });
    this.staticStatusList.push({
      display_name: 'Starting',
      icon_name: 'icon_hourglass.png'
    });
    this.staticStatusList.push({
      display_name: 'Running',
      icon_name: 'icon_play.png'
    });
    this.mapStatus = new Map();
    this.staticStatusList.forEach(element => {
      this.mapStatus.set(element.display_name, element);
    });
  }
}
