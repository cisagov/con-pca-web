import { Component, OnInit, Input, ElementRef, ViewChildren } from '@angular/core';
import { TimelineItem } from 'src/app/models/subscription.model';
import * as moment from 'node_modules/moment/moment';
import { AppSettings } from 'src/app/AppSettings';

@Component({
  selector: 'app-svg-timeline',
  templateUrl: './svg-timeline.component.html'
})
export class SvgTimelineComponent implements OnInit {

  @Input()
  timelineItems: TimelineItem[];

  @ViewChildren('tick') ticks: ElementRef[];

  items: any[] = [];

  pixelWidth = 1000;
  lifespanSeconds: number;
  firstDate: moment.Moment;
  lastDate: moment.Moment;

  dateFormat = AppSettings.DATE_FORMAT;

  iconLaunch = '&#xf135;';
  iconCalendar = '&#xf073';
  iconToday = '&#xf274;';

  /**
   *
   */
  constructor(
    private el: ElementRef
  ) { }

  /**
   *
   */
  ngOnInit(): void {
    setTimeout(() => {
      if (!this.timelineItems) {
        return;
      }
      if (this.timelineItems.length < 2) {
        console.log(this.timelineItems);
        return;
      }
      this.sortEvents();

      this.lifespanSeconds = this.timelineItems[this.timelineItems.length - 1].date
        .diff(this.timelineItems[0].date, 'seconds');
      this.firstDate = this.timelineItems[0].date;

      this.drawTimeline();
    }, 300);
  }

  /**
   *
   */
  onResize(evt: any) {
    if (this.ticks){
      this.ticks.forEach(t => {
        t.nativeElement.remove();
      });
      this.drawTimeline();
    }
  }

  /**
   * Builds a collection of items that drive the
   * SVG template creation.
   */
  drawTimeline() {
    this.pixelWidth = this.el.nativeElement.offsetWidth;

    this.timelineItems.forEach(x => {
      const diff = x.date.diff(this.firstDate, 'seconds');
      let percent = diff / this.lifespanSeconds;

      // now normalize the percentage to emulate 'margins'
      percent = percent * .85 + .075;

      const myX = percent * this.pixelWidth;

      const item = {
        x: myX,
        date: x.date,
        title: x.title,
        icon: ''
      };

      switch (item.title.toLowerCase()) {
        case 'subscription started': {
          item.icon = this.iconLaunch;
          break;
        }
        default: {
          item.icon = this.iconCalendar;
        }
      }

      this.items.push(item);
    });
  }

  /**
   * Sort the events by timestamp
   */
  sortEvents() {
    this.timelineItems.sort((a, b) => a.date.unix() - b.date.unix());
  }
}
