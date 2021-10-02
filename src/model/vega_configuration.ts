
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
    areaChartYLabelSeparation: number;
    barChartYLabelSeparation: number;
    titleFontSize: number;
    axisTitleFontSize: number;

}

export let chartConfiguration: ChartConfiguration = {

    //Title:
    titlePadding: -15,
    titleAlign: 'center',
    titleFontSize: 11,

    //Axis:
    axisPadding: 5,
    areaChartYTitle: 'Relative Frequency',
    areaChartYTitleAbsolute: 'Absolute Frequency',
    areaChartXTitle: 'Time (ms)',
    activityHistogramXTitle: 'Execution Time',
    axisTitleFontSize: 8,
    activityHistogramXLabelFontSize: 7,
    axisLabelFontSize: 7,
    areaChartYLabelSeparation: 2,
    barChartYLabelSeparation: 1,

    //Value Lables
    //TODO: donutChartLabelFontSize: 8,

}
