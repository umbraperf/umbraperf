
export interface ChartConfiguration{
    titlePadding: number;
    titleAlign: string;
    axisPadding: number;
    areaChartYTitle: string;
    areaChartYTitleAbsolute: string;
    areaChartXTitle: string;

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


}
