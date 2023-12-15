export const UtilizationDatum = ({
  name,
  amount,
}: {
  name: 'Provisioned' | 'Quota' | 'Capacity'
  amount: number
}) => (
  <div className="p-3 text-mono-sm">
    <div className="text-quaternary">{name}</div>
    <div className="text-secondary">{amount.toLocaleString()}</div>
  </div>
)
