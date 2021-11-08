export enum ChartType {
    BAR_CHART = "bar_chart",
    DONUT_CHART = "donut_chart",
    SWIM_LANES = "swim_lanes",
    SWIM_LANES_PIPELINES = "swim_lanes_pipelines",
    SWIM_LANES_MULTIPLE_PIPELINES = "swim_lanes_multiple_pipelines",
    SWIM_LANES_MULTIPLE_PIPELINES_ABSOLUTE = "swim_lanes_multiple_pipelines_absolute",
    SWIM_LANES_COMBINED_MULTIPLE_PIPELINES = "swim_lanes_combined_multiple_pipelines",
    SWIM_LANES_COMBINED_MULTIPLE_PIPELINES_ABSOLUTE = "swim_lanes_combined_multiple_pipelines_absolute",
    BAR_CHART_ACTIVITY_HISTOGRAM = "bar_chart_activity_histogram",
    SUNBURST_CHART = "sunburst_chart",
    MEMORY_ACCESS_HEATMAP_CHART = "memory-access-heatmap-chart",
    QUERY_PLAN = "query-plan"
}

export enum ViewType {
    DASHBOARD = "dashboard",
    DASHBOARD_MULTIPLE_EVENTS = "dashboard_multiple_events",
    DASHBOARD_MEMORY = "dashboard_memory",
    UPLOAD = "upload",
    PIPELINES = "pipelines",
    DUMMY = "dummy",
}

export interface IParcialChartProps {
    chartId: number,
    width: number,
    chartType: ChartType,
}

export type IBarChartActivityHistogramProps = IParcialChartProps;

export type ISunburstChartProps = IParcialChartProps & {
    height: number;
};

export type IBarChartProps = IParcialChartProps & {
    height: number;
    onDashboard: boolean;
}

export type ISwimlanesProps = IParcialChartProps & {
    height: number;
    absoluteValues: boolean;
}
