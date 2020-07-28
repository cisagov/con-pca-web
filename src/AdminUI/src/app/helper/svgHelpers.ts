
/**
 * Given the numerator and total calculate and
 * return the svg circle.
 */
export function drawSvgCircle(numerator: number, denominator: number) {
    const ratio: number = (numerator ?? 0) / (denominator ?? 1);
    const percentage: number = ratio * 100;
    const remainingPercentage: number = 100 - percentage;
    const svgString = '<svg width="100%" height="100%" viewBox="0 0 42 42" class="donut" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
        + '<circle class="donut-hole" cx="21" cy="21" r="14" fill="#fff"></circle>'
        + '<circle class="donut-ring" cx="21" cy="21" r="14" fill="transparent" stroke="#cecece" stroke-width="6"></circle>'
        + '<circle class="donut-segment" cx="21" cy="21" r="14" fill="transparent" stroke="#164A91" stroke-width="6" '
        + `stroke-dasharray="${percentage} ${remainingPercentage}" stroke-dashoffset="25"></circle>`
        + '</svg>';
    return svgString;
}
