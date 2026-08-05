export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">This section is being rebuilt — coming next.</p>
    </div>
  )
}