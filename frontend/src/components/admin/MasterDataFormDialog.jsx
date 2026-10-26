import { useId, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog'
import { validateMasterData } from '../../lib/masterData'

export default function MasterDataFormDialog({
  record,
  fields,
  records,
  idKey,
  label,
  create,
  update,
  onClose,
  onSaved,
}) {
  const id = useId()
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map((field) => [field.key, record?.[field.key] ?? '']),
    ),
  )
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState('')
  const pending = create.isPending || update.isPending
  const submit = (event) => {
    event.preventDefault()
    if (pending) return
    const result = validateMasterData(
      values,
      fields,
      records,
      idKey,
      record?.[idKey],
    )
    setErrors(result.errors)
    setFailure('')
    if (Object.keys(result.errors).length) {
      document.getElementById(`${id}-${Object.keys(result.errors)[0]}`)?.focus()
      return
    }
    const options = {
      onSuccess: onSaved,
      onError: (error) =>
        setFailure(error?.EM || 'Không thể lưu dữ liệu. Vui lòng thử lại.'),
    }
    if (record)
      update.mutate({ [idKey]: record[idKey], data: result.data }, options)
    else create.mutate(result.data, options)
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose()
      }}
    >
      <DialogContent
        className="max-h-[85dvh] overflow-y-auto rounded-2xl"
        showCloseButton={!pending}
        onEscapeKeyDown={(event) => {
          if (pending) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (pending) event.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {record ? 'Sửa' : 'Thêm'} {label}
          </DialogTitle>
          <DialogDescription>
            Dữ liệu chuẩn dùng chung cho toàn hệ thống. Các trường bên dưới đều
            bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-4">
          {fields.map((field, index) => {
            const inputId = `${id}-${field.key}`
            const props = {
              id: inputId,
              value: values[field.key],
              disabled: pending,
              required: true,
              'aria-invalid': !!errors[field.key],
              'aria-describedby': errors[field.key]
                ? `${inputId}-error`
                : undefined,
              onChange: (event) => {
                setValues((previous) => ({
                  ...previous,
                  [field.key]: event.target.value,
                }))
                setErrors((previous) => ({ ...previous, [field.key]: '' }))
                setFailure('')
              },
            }
            return (
              <div key={field.key} className="space-y-2">
                <label htmlFor={inputId} className="block text-sm font-medium">
                  {field.label}{' '}
                  <span aria-hidden="true" className="text-red-600">
                    *
                  </span>
                </label>
                {field.options ? (
                  <select
                    {...props}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-orange-500 aria-invalid:border-red-500 disabled:opacity-50"
                  >
                    <option value="">Chọn {field.label.toLowerCase()}</option>
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    {...props}
                    className="h-11 rounded-xl"
                    autoFocus={index === 0}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                  />
                )}
                {errors[field.key] && (
                  <p
                    id={`${inputId}-error`}
                    role="alert"
                    className="text-sm text-red-600"
                  >
                    {errors[field.key]}
                  </p>
                )}
              </div>
            )
          })}
          {failure && (
            <p role="alert" className="text-sm text-red-600">
              {failure}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-orange-600 text-white hover:bg-orange-700"
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending ? 'Đang lưu…' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
