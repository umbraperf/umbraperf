
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
    legendTitleFontSize: number;
    legendLabelFontSize: number;
    legendSymbolSize: number;
    subtitleFontSize: number;
    areaChartTooltip: string;
    areaChartAbsoluteTooltip: string;
    donutChartTooltip: string;
    activityHistogramTooltip: string;

}

export let chartConfiguration: ChartConfiguration = {

    //Title:
    titlePadding: -5,
    titleAlign: 'center',
    titleFontSize: 11,
    subtitleFontSize: 10,

    //Axis:
    axisPadding: 2,
    areaChartYTitle: 'Relative Frequency',
    areaChartYTitleAbsolute: 'Absolute Frequency',
    areaChartXTitle: 'Time (ms)',
    activityHistogramXTitle: 'Execution Time',
    axisTitleFontSize: 8,
    activityHistogramXLabelFontSize: 7,
    axisLabelFontSize: 7,
    areaChartYLabelSeparation: 2,
    barChartYLabelSeparation: 1,

    //Legend:
    legendTitleFontSize: 9,
    legendLabelFontSize: 8,
    legendSymbolSize: 50,

    //Value Lables
    //TODO: donutChartLabelFontSize: 8,

    //Tooltip:
    areaChartTooltip: "'Time': datum.buckets, 'Operator': datum.operators, 'Relative Frequency': datum.frequency",
    areaChartAbsoluteTooltip: "'Time': datum.buckets, 'Operator': datum.operators, 'Absolute Frequency': datum.frequency",
    donutChartTooltip: "{'Pipeline': datum.pipeline, 'Occurrences': datum.value}",
    activityHistogramTooltip: "{'Time': datum.timeBuckets, 'Event Occurences': datum.occurrences}",


}
