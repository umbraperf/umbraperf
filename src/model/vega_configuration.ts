
export interface ChartConfiguration{
    titlePadding: number;
    titleAlign: string;
    axisPadding: number;
    areaChartYTitle: string;
    areaChartYTitleAbsolute: string;
    areaChartXTitle: string;
    activityHistogramXTitle: string;
    activityHistogramXLabelFontSize: number;
    axisLabelFontSize: number;

}

export let chartConfiguration: ChartConfiguration = {

    //Title:
    titlePadding: -15,
    titleAlign: 'center',

    //Axis:
    axisPadding: 5,
    areaChartYTitle: 'Relative Frequency',
    areaChartYTitleAbsolute: 'Absolute Frequency',
    areaChartXTitle: 'Time (ms)',
    activityHistogramXTitle: 'Execution Time',
    activityHistogramXLabelFontSize: 8,
    axisLabelFontSize: 9,



}
