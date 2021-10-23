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
    getOperatorColorScheme: (domainLength: number, higSaturation?: boolean) => object | Array<string>;
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
    getOperatorColorScheme: (domainLength, higSaturation) => {

        const colorValueRange: Array<Array<number>> = operatorColorScemeHsl.slice(0, domainLength);

        const parsedColorValueRange = colorValueRange.map((elem) => {
            const parsedElem: [string, string, string] = ["", "", ""];

            parsedElem[0] = `${elem[0]}`;
            parsedElem[2] = `${elem[2]}%`;

            if (higSaturation) {
                const saturationOffset = 20;
                const originalSaturation = elem[1];
                let adjustedSaturation = originalSaturation - saturationOffset;
                if (adjustedSaturation > 100) {
                    adjustedSaturation = 100;
                } else if (adjustedSaturation < 0) {
                    adjustedSaturation = 0;
                }
                parsedElem[1] = `${adjustedSaturation}%`;

            } else {
                parsedElem[1] = `${elem[1]}%`;
            }

            return `hsl(${parsedElem.join()})`;
        });

        return parsedColorValueRange;

    },

    //Hover behaviour: 
    hoverFillOpacity: 0.5,

}

const operatorColorScemeHsl: Array<Array<number>> = [
    [211, 38, 48],
    [205, 63, 77],
    [30, 92, 53],
    [31, 100, 74],
    [114, 37, 46],
    [110, 49, 65],
    [48, 70, 42],
    [46, 85, 65],
    [177, 39, 43],
    [174, 30, 63],
    [0, 72, 62],
    [3, 100, 80],
    [11, 5, 45],
    [17, 9, 70],
    [339, 55, 64],
    [341, 91, 87],
    [317, 27, 59],
    [316, 37, 74],
    [22, 25, 50],
    [19, 40, 75],
]