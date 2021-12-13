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
    legendDoubleTitleFontSize: number;
    legendDoubleLabelFontSize: number;
    legendDoubleSymbolSize: number;
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
    // getOperatorColorScheme: (domainLength: number, higSaturation?: boolean, hsla?: number) => Array<string>;
    // getOrangeColor: (getOrangeColor: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) => string;
    memoryChartYTitle: string,
    memoryChartXTitle: string,
    memoryChartYLabelSeparation: number,
    memoryChartXLabelSeparation: number,
    memoryChartTooltip: string,
    colorLowOpacityHex: string,
    nFormatter: (num: number, digits: number) => string,
    colorScale: { operatorsIdColorScale: string[], operatorsIdColorScaleLowOpacity: string[], operatorsGroupScale: string[] } | undefined;
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
    memoryChartYTitle: 'Memory Address',
    memoryChartXTitle: 'Time (ms)',
    memoryChartYLabelSeparation: 2,
    memoryChartXLabelSeparation: 2,

    //Legend:
    legendTitleFontSize: 9,
    legendLabelFontSize: 8,
    legendSymbolSize: 50,
    legendDoubleTitleFontSize: 11,
    legendDoubleLabelFontSize: 10,
    legendDoubleSymbolSize: 60,

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
    memoryChartTooltip: "'Time': datum.bucket, 'Memory-Address': datum.memAdr, 'Memory-Loads': datum.occurrences",

    //Color Scale
    colorScale: undefined,

    //Color properties:
    colorLowOpacityHex: "26",

    //Hover behaviour: 
    hoverFillOpacity: 0.5,

    //Number formatter:
    nFormatter: (num: number, digits: number) => {
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup.slice().reverse().find(function (item) {
            return num >= item.value;
        });
        return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
    },

    //Color scale depreciated:
    // getOperatorColorScheme: (domainLength, higSaturation, hsla) => {
    //     //TODO remove

    //     const colorValueRange: Array<Array<number>> = operatorColorScemeHsl.slice(0, domainLength);

    //     const parsedColorValueRange = colorValueRange.map((elem) => {

    //         let elemSaturation = elem[1];
    //         if (higSaturation) {
    //             const saturationOffset = 20;
    //             let adjustedSaturation = elemSaturation - saturationOffset;
    //             if (adjustedSaturation > 100) {
    //                 adjustedSaturation = 100;
    //             } else if (adjustedSaturation < 0) {
    //                 adjustedSaturation = 0;
    //             }
    //             elemSaturation = adjustedSaturation;
    //         }

    //         if (hsla) {
    //             return `hsla(${elem[0]},${elemSaturation}%,${elem[2]}%,${hsla})`
    //         }
    //         return `hsl(${elem[0]},${elemSaturation}%,${elem[2]}%)`
    //     });

    //     return parsedColorValueRange;
    // },

    // getOrangeColor: (opacity) => {
    //     //depreciated
    //     //TODO remove, not used

    //     return orangeColorSchemeHex[opacity];
    // },

}

// const operatorColorScemeHsl: Array<[number, number, number]> = [
//     [211, 38, 48],
//     [205, 63, 77],
//     [30, 92, 53],
//     [31, 100, 74],
//     [114, 37, 46],
//     [110, 49, 65],
//     [48, 70, 42],
//     [46, 85, 65],
//     [177, 39, 43],
//     [174, 30, 63],
//     [0, 72, 62],
//     [3, 100, 80],
//     [11, 5, 45],
//     [17, 9, 70],
//     [339, 55, 64],
//     [341, 91, 87],
//     [317, 27, 59],
//     [316, 37, 74],
//     [22, 25, 50],
//     [19, 40, 75],
// ]

// const orangeColorSchemeHex: Array<string> = [
//     //depreciated
//     //TODO remove, not used
//     '#EDB596',
//     '#E69F78',
//     '#DD895A',
//     '#d4733e',
//     '#C56937',
//     '#B66031',
//     '#A6562A',
//     '#964D24',
//     '#86431F',
// ]

//Create and return color scales
export function createColorScales(operatorsId: Array<string>, operatorsGroup: Array<string>, hsla: number) {
    interface IOperatorsGroupBaseColors { [operator: string]: [number, number, number] }
    interface IOperatorsGroupCount { [operator: string]: number }
    interface IBaseOperatorsGroupColors {
        operatorsGroupBaseColors: IOperatorsGroupBaseColors;
        operatorsGroupCount: IOperatorsGroupCount;
    }

    const operatosGroupBaseHsl: Array<[number, number, number]> = [
        //vega tableau10 with adjusted luminance
        [211, 38, 50],
        [30, 92, 50],
        [114, 37, 50],
        [48, 70, 50],
        [177, 39, 50],
        [0, 72, 50],
        [11, 5, 50],
        [339, 55, 50],
        [317, 27, 50],
        [22, 25, 50],
        //own
        [194, 70, 50],
        [314, 100, 50],
        [63, 100, 50],
        [168, 100, 50],
        [269, 100, 50],
    ]

    //create base color object for operatorsGgroup (base colors with luminance = 50)
    const createBaseOperatorsGroupColors = () => {
        let operatorsGroupBaseColors: IOperatorsGroupBaseColors = {};
        let operatorsGroupCount: IOperatorsGroupCount = {};
        let colorIndexCounter = 0;
        operatorsGroup.forEach((elem) => {
            if (operatorsGroupCount[elem]) {
                operatorsGroupCount[elem] = operatorsGroupCount[elem] + 1;
            } else {
                operatorsGroupCount[elem] = 1;
                operatorsGroupBaseColors[elem] = operatosGroupBaseHsl[colorIndexCounter];
                colorIndexCounter = (colorIndexCounter + 1) % operatosGroupBaseHsl.length;
            }
        })
        return { operatorsGroupBaseColors, operatorsGroupCount };
    }

    //create base color object for operatorsGroup scale for legends
    const createOperatorsGroupColorScale = (baseOperatorColors: IBaseOperatorsGroupColors) => {
        return Object.values(baseOperatorColors.operatorsGroupBaseColors);
    }

    //create operatorId color scale based on color object for operatorGgroup
    const createOperatorsIdColorScale = (baseOperatorColors: IBaseOperatorsGroupColors) => {
        const luminanceLow = 30;
        const luminanceHigh = 70;
        const luminanceRange = luminanceHigh - luminanceLow;

        let currentOperatorsGroupCount: IOperatorsGroupCount = {};

        const operatorsIdColorScale: [number, number, number][] = operatorsId.map((elem, index) => {
            const currentOperatorGroup = operatorsGroup[index];
            currentOperatorsGroupCount[currentOperatorGroup] = currentOperatorsGroupCount[currentOperatorGroup] ? currentOperatorsGroupCount[currentOperatorGroup] + 1 : 1;
            const currentOperatorIdColorLuminanceShift = (luminanceRange / (baseOperatorColors.operatorsGroupCount[currentOperatorGroup] + 1)) * currentOperatorsGroupCount[currentOperatorGroup];
            const currentOperatorIdLuminance = luminanceLow + currentOperatorIdColorLuminanceShift;
            const currentOperatorGroupColor = baseOperatorColors.operatorsGroupBaseColors[currentOperatorGroup];
            return [currentOperatorGroupColor[0], currentOperatorGroupColor[1], currentOperatorIdLuminance];
        })
        return operatorsIdColorScale;
    }

    //create hsl values from color scale arrays
    const createHslStringArray = (colorScale: [number, number, number][], hsla?: number): string[] => {
        return colorScale.map(elem => {
            return `hsla(${elem[0]},${elem[1]}%,${elem[2]}%,${hsla ? hsla : 1})`
        })
    }

    const baseOperatorsGroupColors = createBaseOperatorsGroupColors();
    const operatorsGroupColorScale = createOperatorsGroupColorScale(baseOperatorsGroupColors);
    const operatorsIdColorScale = createOperatorsIdColorScale(baseOperatorsGroupColors);

    //Set colorScale field in chartConfiguration varibale
    chartConfiguration.colorScale = {
        operatorsIdColorScale: createHslStringArray(operatorsIdColorScale),
        operatorsIdColorScaleLowOpacity: createHslStringArray(operatorsIdColorScale, 0.3),
        operatorsGroupScale: createHslStringArray(operatorsGroupColorScale),
    }
}


