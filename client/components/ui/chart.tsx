"use client"

import { createContext, useContext, useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

export type ChartConfig = Record<string, { label: string; color: string }>

const ChartConfigContext = createContext<ChartConfig | null>(null)

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
}

export function ChartContainer({ config, children }: ChartContainerProps) {
  return (
    <ChartConfigContext.Provider value={config}>
      <div className="chart-container">{children}</div>
      <style jsx global>{`
        :root {
          ${Object.entries(config)
            .map(([key, value]) => `--color-${key}: ${value.color};`)
            .join("\n")}
        }
      `}</style>
    </ChartConfigContext.Provider>
  )
}

export function ChartTooltip({ children, ...props }: any) {
  return (
    <TooltipProvider>
      <Tooltip {...props}>{children}</Tooltip>
    </TooltipProvider>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  indicator?: "line" | "dot"
}

export function ChartTooltipContent({
  active,
  payload,
  indicator = "line",
}: ChartTooltipContentProps) {
  const config = useContext(ChartConfigContext)

  if (!active || !payload?.length || !config) {
    return null
  }

  return (
    <TooltipContent asChild>
      <div className="space-y-2">
        <div className="space-y-1">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              {indicator === "line" ? (
                <div className="h-0.5 w-2" style={{ background: item.color }} />
              ) : (
                <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
              )}
              <span className="text-sm font-medium">{config[item.dataKey].label}</span>
              <span className="text-sm text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </TooltipContent>
  )
}