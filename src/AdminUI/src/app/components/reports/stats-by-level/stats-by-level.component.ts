import { Component, Input, OnInit } from '@angular/core';
import { drawSvgCircle } from 'src/app/helper/svgHelpers';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-stats-by-level',
  templateUrl: './stats-by-level.component.html',
  styleUrls: ['./stats-by-level.component.scss']
})
export class StatsByLevelComponent implements OnInit {

  groups: any[] = [];

  // the horizontal (X) spacing of each group
  groupX = 90;

  yScaleLines: ScaleLine[] = [];

  /**
   * This will need to be tweaked to match the metrics or stats
   * that are available from the API response.
   */
  @Input()
  metrics: any;

  /**
   * The height to render the graph in pixels.
   */
  @Input()
  chartHeight: number;

  /**
   * Constructor.
   */
  constructor() { }

  /**
   * OnInit.
   */
  ngOnInit(): void {
    // determine normalization factor based on highest count
    let max = 0;
    this.metrics?.stats.forEach((x) => {
      if (x.low > max) {
        max = x.low;
      }
      if (x.moderate > max) {
        max = x.moderate;
      }
      if (x.high > max) {
        max = x.high;
      }
    });

    // normalize the counts to the chart height
    const normalizationFactor = this.chartHeight / max;
    this.metrics?.stats.forEach((x) => {
      x.lowN = x.low * normalizationFactor;
      x.moderateN = x.moderate * normalizationFactor;
      x.highN = x.high * normalizationFactor;
    });

    // define the Y scale
    this.yScaleLines.push({ realNumber: 0, y: this.chartHeight });
  }
}

/**
 * 
 */
export class ScaleLine {
  realNumber: number;

  // the y value in pixels
  y: number;
}
