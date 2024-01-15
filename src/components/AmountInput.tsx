type Props = {
  value: string
  onChange: (v: string) => void
}

export function AmountInput({ value, onChange }: Props) {
  return (
    <input
      className="cc-input"
      inputMode="decimal"
      placeholder="0,00"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

