type Props = { width?: number | string; height?: number | string }
export function Skeleton({ width = '100%', height = 16 }: Props) {
  return <div className="cc-skeleton" style={{ width, height }} />
}

