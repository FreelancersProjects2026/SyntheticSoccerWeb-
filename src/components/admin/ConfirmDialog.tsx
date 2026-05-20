type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#072f1a]/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-[14px] border border-[#EBEBEA] bg-white p-6 shadow-xl">
        <h2 className="font-display text-[16px] font-bold text-[#0d1a12]">{title}</h2>
        <p className="mt-2 text-[13px] text-[#6B6862]">{body}</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-[34px] rounded-[8px] border border-[#EBEBEA] px-4 text-[13px] font-semibold text-[#6B6862] transition-colors hover:bg-[#F5F4F1]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="h-[34px] rounded-[8px] bg-[#072f1a] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[#0a3d22]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
