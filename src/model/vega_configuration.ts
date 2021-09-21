
export interface ChartConfiguration{
    titlePadding: number;
    titleAlign: string;
    axisPadding: number;
    areaChartYTitle: string;
    areaChartXTitle: string;

}

export let chartConfiguration: ChartConfiguration = {

    //Title:
    titlePadding: -15,
    titleAlign: 'center',

    //Axis:
    axisPadding: 5,
    areaChartYTitle: 'Relative Frequency',
    areaChartXTitle: 'Time (ms)',


}
