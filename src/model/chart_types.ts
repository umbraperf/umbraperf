// Generic chart with type and props
type ChartComponent<T, P, /* N */> = {
    readonly type: T,
    //readonly name: N,
    readonly props: P,
}

// The chart types
export enum ChartType {
    BAR_CHART = "bar_chart",
    DONUT_CHART = "donut_chart", // TODO remove
    SWIM_LANES = "swim_lanes", // TODO remove
    SWIM_LANES_PIPELINES = "swim_lanes_pipelines", // TODO remove
    SWIM_LANES_MULTIPLE_PIPELINES = "swim_lanes_multiple_pipelines",
    SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE = "swim_lanes_multiple_pipelines_absolute",
    SWIM_LANES_COMBINED_MULTIPLE_PIPELINES = "swim_lanes_combined_multiple_pipelines",
    SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE = "swim_lanes_combined_multiple_pipelines_absolute",
    BAR_CHART_ACTIVITY_HISTOGRAM = "bar_chart_activity_histogram",
    SUNBURST_CHART = "sunburst_chart",
    MEMORY_ACCESS_HEATMAP_CHART = "memory_access_heatmap_chart",
    QUERY_PLAN = "query_plan",
    UIR_VIEWER = "uir_viewer",
}

//Readable chart names
export enum ChartTypeReadable {
    BAR_CHART = "Bar Chart",
    SWIM_LANES_MULTIPLE_PIPELINES = "Swim Lanes",
    SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE = "Swim Lanes (Absolute)",
    SWIM_LANES_COMBINED_MULTIPLE_PIPELINES = "Swim Lanes Combined",
    SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE = "Swim Lanes Combined (Absolute)",
    BAR_CHART_ACTIVITY_HISTOGRAM = "Activity Histogram",
    SUNBURST_CHART = "Sunburst",
    MEMORY_ACCESS_HEATMAP_CHART = "Memory Heatmap",
    QUERY_PLAN = "Query Plan",
    UIR_VIEWER = "UIR Viewer",
}

// The chart props
export interface ICommonChartProps {
    //key prop forces react to rerender child on change -> use sum of width/height/chartId
    key: number;
    chartId: number,
    width: number,
    chartType: ChartType,
}

export type IBarChartActivityHistogramProps = ICommonChartProps;

export type ISunburstChartProps = ICommonChartProps & {
    height: number;
    doubleRowSize: boolean;
};

export type IBarChartProps = ICommonChartProps & {
    height: number;
    onDashboard: boolean;
}

export type ISwimlanesProps = ICommonChartProps & {
    height: number;
    absoluteValues: boolean;
}

export type IMemoryAccessHeatmapChartProps = ICommonChartProps;

export type IQueryPlanProps = {};

export type IUirViewerProps = ICommonChartProps;

//The chart props variants:
export type ChartProps = IBarChartActivityHistogramProps | ISunburstChartProps | IBarChartProps | ISwimlanesProps | IMemoryAccessHeatmapChartProps | IQueryPlanProps | IUirViewerProps;

// The Chart Component Variants with specific chart types and their props
export type ChartComponentVariant =
    | ChartComponent<ChartType.BAR_CHART_ACTIVITY_HISTOGRAM, IBarChartActivityHistogramProps>
    | ChartComponent<ChartType.SUNBURST_CHART, ISunburstChartProps>
    | ChartComponent<ChartType.BAR_CHART, IBarChartProps>
    | ChartComponent<ChartType.SWIM_LANES_MULTIPLE_PIPELINES | ChartType.SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE | ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES | ChartType.SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE, ISwimlanesProps>
    | ChartComponent<ChartType.MEMORY_ACCESS_HEATMAP_CHART, IMemoryAccessHeatmapChartProps>
    | ChartComponent<ChartType.QUERY_PLAN, IQueryPlanProps>
    | ChartComponent<ChartType.UIR_VIEWER, IUirViewerProps>
    ;

// Top level view types
export enum ViewType {
    DASHBOARD_SINGLE_EVENT = "dashboard_single_event",
    DASHBOARD_MULTIPLE_EVENTS = "dashboard_multiple_events",
    DASHBOARD_MEMORY = "dashboard_memory",
    DASHBOARD_UIR = "dashboard_uir",
    UPLOAD = "upload",
    PIPELINES = "pipelines",
    DUMMY = "dummy",
    NONE = "none",
}

