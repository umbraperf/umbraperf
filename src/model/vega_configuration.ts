import * as model from "./index";

export interface ChartConfiguration {
    titlePadding: number;
    titleAlign: string;
    axisPadding: number;
    areaChartYTitle: string;
    areaChartYTitleAbsolute: string;
    areaChartXTitle: string;
    activityHistogramXTitle: string;
    activityHistogramXLabelFontSize: number;
    axisLabelFontSize: number;
    activityHistogramXLabelSeparation: number;
    areaChartXLabelSeparation: number;
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
    barChartTooltip: string;
    sunburstChartTooltip: (pipeline: boolean) => string;
    axisTitleFont: string;
    axisLabelFont: string;
    titleFont: string;
    sunburstChartValueLabelFontSize: number;
    barChartValueLabelFontSize: number;
    valueLabelFont: string;
    hoverFillOpacity: number;
    axisTitleFontSizeYCombined: number;
    getOperatorColorScheme: (chartType: model.ChartType, saturationOffset?: number) => string | Array<string>;


}

export let chartConfiguration: ChartConfiguration = {

    //Title:
    titlePadding: -5,
    titleAlign: 'center',
    titleFontSize: 11,
    subtitleFontSize: 10,
    titleFont: "Segoe UI",

    //Axis:
    axisPadding: 2,
    areaChartYTitle: 'Relative Frequency',
    areaChartYTitleAbsolute: 'Absolute Frequency',
    areaChartXTitle: 'Time (ms)',
    activityHistogramXTitle: 'Time (ms)',
    axisTitleFontSize: 9,
    axisTitleFontSizeYCombined: 7,
    activityHistogramXLabelFontSize: 7,
    axisLabelFontSize: 8,
    activityHistogramXLabelSeparation: 2,
    areaChartXLabelSeparation: 2,
    areaChartYLabelSeparation: 2,
    barChartYLabelSeparation: 1,
    axisTitleFont: "Segoe UI",
    axisLabelFont: "Arial",

    //Legend:
    legendTitleFontSize: 9,
    legendLabelFontSize: 8,
    legendSymbolSize: 50,

    //Value Lables
    sunburstChartValueLabelFontSize: 11,
    barChartValueLabelFontSize: 9,
    valueLabelFont: "Segoe UI",

    //Tooltip:
    areaChartTooltip: "'Time': datum.buckets, 'Operator': datum.operators, 'Relative Frequency': datum.frequency",
    areaChartAbsoluteTooltip: "'Time': datum.buckets, 'Operator': datum.operators, 'Absolute Frequency': datum.frequency",
    donutChartTooltip: "{'Pipeline': datum.pipeline, 'Occurrences': datum.value}",
    activityHistogramTooltip: "{'Time': datum.timeBuckets, 'Event Occurences': datum.occurrences}",
    barChartTooltip: "{'Operator': datum.operators, 'Occurences': datum.values}",
    sunburstChartTooltip: (pipeline) => {
        return pipeline ?
            "{'Pipeline': datum.pipelineShort, 'Pipeline Name': datum.operator, 'Occurences': datum.pipeOccurrences}" :
            "{'Operator': datum.operator, 'Occurences': datum.opOccurrences, 'Pipeline': datum.parentShort}"
    },

    //Color scale:
    getOperatorColorScheme: (charttype, saturationOffset) => {
        switch (charttype) {

            case model.ChartType.BAR_CHART:
            case model.ChartType.SUNBURST_CHART:
            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES:
            case model.ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE:
                return "tableau20";

            case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES:
            case model.ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE:
                const ajustedSceme = operatorColorSceme.map((elem) => {
                    if (saturationOffset) {
                        elem[1] = (elem[1] as number) - saturationOffset;
                    }
                    if (elem[1] > 100) {
                        elem[1] = 100;
                    } else if (elem[1] < 0) {
                        elem[1] = 0;
                    }
                    elem[1] = `${elem[1]}%`
                    elem[2] = `${elem[2]}%`
                    return `hsl(${elem.join()})`;
                });
                return ajustedSceme;

            default:
                return "tableau20";
        }

    },

    //Hover behaviour: 
    hoverFillOpacity: 0.5,

}

const operatorColorSceme: Array<Array<number | string>> = [
    [205, 70.6, 41.4],
    [214, 55.8, 79.6],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
    // [],
]