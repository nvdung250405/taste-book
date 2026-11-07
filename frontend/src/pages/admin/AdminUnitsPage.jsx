import MasterDataPage from '../../components/admin/MasterDataPage'
import {
  useUnits,
  useCreateAdminUnit,
  useUpdateAdminUnit,
  useDeleteAdminUnit,
} from '../../hooks/queries/useIngredientQueries'

export default function AdminUnitsPage() {
  const query = useUnits()
  const create = useCreateAdminUnit()
  const update = useUpdateAdminUnit()
  const remove = useDeleteAdminUnit()
  return (
    <MasterDataPage
      title="Quản lý đơn vị tính"
      label="đơn vị tính"
      idKey="unitId"
      nameKey="unitName"
      {...{ query, create, update, remove }}
      fields={[
        {
          key: 'unitName',
          label: 'Tên đơn vị tính',
          maxLength: 30,
          placeholder: 'VD: kg, ml, muỗng',
        },
      ]}
      columns={[{ label: 'Tên đơn vị tính', value: (row) => row.unitName }]}
    />
  )
}
