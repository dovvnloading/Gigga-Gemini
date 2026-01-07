
import { YouTubeVideo, ChartData, CanvasState, CanvasUpdate } from "../types";

export const executeCanvas = (args: any): CanvasState => {
    return {
        isOpen: true,
        title: args.title || 'Untitled',
        language: args.language || 'markdown',
        content: args.content || '',
        mode: (args.language === 'markdown' || args.language === 'text') ? 'document' : 'code'
    };
};

export const executeEditCanvas = (args: any): CanvasUpdate[] => {
    return args.changes.map((change: any) => ({
        type: 'replace',
        search: change.search,
        replacement: change.replacement
    }));
};

export const executeWeatherTool = (args: any) => {
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy', 'Windy'];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.floor(Math.random() * (90 - 40) + 40);
  return {
    location: args.location,
    temperature: `${temp}°F`,
    condition: condition,
    humidity: `${Math.floor(Math.random() * 60 + 20)}%`,
    wind: `${Math.floor(Math.random() * 15 + 2)} mph`
  };
};

export const executeStockTool = (args: any) => {
  const price = (Math.random() * 500 + 50).toFixed(2);
  const change = (Math.random() * 10 - 5).toFixed(2);
  return {
    symbol: args.symbol,
    price: `$${price}`,
    change: `${change}%`,
    volume: "1.2M"
  };
};

export const executeYouTubeTool = (args: any): YouTubeVideo[] => {
    const query = args.query || 'Gemini AI';
    const videos = [
        {
            id: 'kCCgT-JpM2E',
            title: `Understanding ${query}: A Deep Dive`,
            channel: 'Tech Essentials',
            views: '1.2M views',
            thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80',
            duration: '12:45',
            link: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
        },
        {
            id: 'M7FIvfx5J10',
            title: `${query} in 2025 - What Changed?`,
            channel: 'Future Trends',
            views: '850K views',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
            duration: '08:30',
            link: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
        },
        {
            id: 'LXb3EKWsInQ',
            title: `Top 10 Secrets of ${query}`,
            channel: 'Daily Dose',
            views: '2.1M views',
            thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80',
            duration: '15:20',
            link: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
        },
        {
            id: 'jfKfPfyJRdk',
            title: `${query} Tutorial for Beginners`,
            channel: 'Code Academy',
            views: '450K views',
            thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80',
            duration: '45:00',
            link: `https://youtube.com/results?search_query=${encodeURIComponent(query)}`
        }
    ];
    return videos.slice(0, args.count || 3);
};

// Deep Research is now handled by researchAgent.ts, removing the mock.
export const executeDeepResearch = (args: any): any => {
    return { error: "Deprecated. Use Agent." };
};

export const executeVisualization = (args: any): ChartData => {
    const { type, title, xAxis, yAxis, dataContext } = args;
    
    // Generate mock data based on context context (simple heuristics)
    let labels: string[] = [];
    let seriesKeys: string[] = ['Value'];
    let dataPoints: any[] = [];
    let summary = "Data shows a significant upward trend with 15% YOY growth.";

    // Heuristics
    const isYearly = dataContext.includes('year') || dataContext.match(/\d{4}/);
    const isComparison = dataContext.includes('compare') || dataContext.includes('vs');
    
    if (isYearly) {
        labels = ['2020', '2021', '2022', '2023', '2024'];
    } else {
        labels = ['Q1', 'Q2', 'Q3', 'Q4'];
    }

    if (isComparison) {
        seriesKeys = ['Series A', 'Series B'];
        summary = "Series B outperformed Series A in the last quarter by 12%.";
    }

    // Populate Data
    labels.forEach(label => {
        const point: any = { label };
        point.value = Math.floor(Math.random() * 500) + 100;
        if (seriesKeys.length > 1) {
            point.value2 = Math.floor(Math.random() * 500) + 100;
        }
        dataPoints.push(point);
    });

    // Ensure trend for Area charts to look nice
    if (type === 'area') {
         dataPoints = dataPoints.sort((a,b) => a.label.localeCompare(b.label));
         // Make plausible trend
         let val = 100;
         dataPoints.forEach(p => {
             val += Math.random() * 50 - 10;
             p.value = Math.floor(val);
             if (p.value2) p.value2 = Math.floor(val * (0.8 + Math.random() * 0.4));
         });
    }

    return {
        type: type || 'bar',
        title: title || 'Data Visualization',
        xAxisLabel: xAxis,
        yAxisLabel: yAxis,
        seriesKeys,
        data: dataPoints,
        summary
    };
};
