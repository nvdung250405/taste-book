import MasterDataPage from '../../components/admin/MasterDataPage'
import {
  useSearchIngredients,
  useIngredientCategories,
  useUnits,
  useCreateAdminIngredient,
  useUpdateAdminIngredient,
  useDeleteAdminIngredient,
} from '../../hooks/queries/useIngredientQueries'

export default function AdminIngredientsPage() {
  const query = useSearchIngredients()
  const groups = useIngredientCategories()
  const units = useUnits()
  const create = useCreateAdminIngredient()
  const update = useUpdateAdminIngredient()
  const remove = useDeleteAdminIngredient()
  const records = (query.data?.DT || []).map((row) => ({
    ...row,
    ingredientCategoryId:
      row.ingredientCategoryId ??
      groups.data?.DT?.find((group) => group.categoryName === row.categoryName)
        ?.ingredientCategoryId ??
      '',
    defaultUnitId: row.defaultUnit?.unitId ?? '',
  }))
  return (
    <MasterDataPage
      title="Quản lý nguyên liệu chuẩn"
      label="nguyên liệu"
      idKey="ingredientId"
      nameKey="ingredientName"
      {...{ query, records, create, update, remove }}
      references={[groups, units]}
      fields={[
        {
          key: 'ingredientName',
          label: 'Tên nguyên liệu',
          maxLength: 255,
          placeholder: 'VD: Thịt bò',
        },
        {
          key: 'ingredientCategoryId',
          label: 'Nhóm nguyên liệu',
          options: (groups.data?.DT || []).map((row) => ({
            value: row.ingredientCategoryId,
            label: row.categoryName,
          })),
        },
        {
          key: 'defaultUnitId',
          label: 'Đơn vị mặc định',
          options: (units.data?.DT || []).map((row) => ({
            value: row.unitId,
            label: row.unitName,
          })),
        },
      ]}
      columns={[
        { label: 'Tên nguyên liệu', value: (row) => row.ingredientName },
        { label: 'Nhóm nguyên liệu', value: (row) => row.categoryName },
        { label: 'Đơn vị mặc định', value: (row) => row.defaultUnit?.unitName },
      ]}
    />
  )
}
