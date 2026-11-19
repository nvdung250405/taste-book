import { useId, useState } from 'react'
import { Input } from '../ui/input'

export default function IngredientNameInput({
  row,
  index,
  ingredients,
  onChange,
  disabled = false,
  inputRef,
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const matches = ingredients.filter((item) =>
    item.ingredientName
      .toLocaleLowerCase('vi')
      .includes(row.name.trim().toLocaleLowerCase('vi')),
  )
  const expanded = open && matches.length > 0
  const choose = (item) => {
    onChange(index, 'ingredientId', item.ingredientId)
    setOpen(false)
    setActive(-1)
  }
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        disabled={disabled}
        aria-label={`Tên nguyên liệu ${index + 1}`}
        placeholder="Tên nguyên liệu (VD: Thịt bò)"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? id : undefined}
        aria-activedescendant={
          expanded && active >= 0 ? `${id}-${active}` : undefined
        }
        autoComplete="off"
        maxLength={255}
        value={row.name}
        onFocus={() => {
          setOpen(true)
          setActive(-1)
        }}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          onChange(index, 'name', event.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && open) {
            event.preventDefault()
            event.stopPropagation()
            setOpen(false)
          }
          if (!matches.length) return
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            setActive((current) =>
              event.key === 'ArrowDown'
                ? Math.min(current + 1, matches.length - 1)
                : Math.max(current - 1, 0),
            )
          }
          if (
            event.key === 'Enter' &&
            expanded &&
            !event.nativeEvent?.isComposing
          ) {
            event.preventDefault()
            choose(matches[active < 0 ? 0 : active])
          }
        }}
      />
      {expanded && (
        <ul
          id={id}
          role="listbox"
          aria-label="Nguyên liệu chuẩn"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-white p-1 shadow-lg dark:bg-slate-900"
        >
          {matches.map((item, optionIndex) => (
            <li
              key={item.ingredientId}
              role="option"
              id={`${id}-${optionIndex}`}
              aria-selected={active === optionIndex}
            >
              <button
                type="button"
                disabled={disabled}
                tabIndex={-1}
                onPointerDown={(event) => event.preventDefault()}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item)}
                className={`w-full rounded-md p-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-slate-800 ${active === optionIndex ? 'bg-orange-50 dark:bg-slate-800' : ''}`}
              >
                Dùng nguyên liệu chuẩn: {item.ingredientName} (
                {item.defaultUnit?.unitName || 'Chưa có đơn vị'})
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
