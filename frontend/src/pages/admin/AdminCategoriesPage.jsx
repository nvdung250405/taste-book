import MasterDataPage from '../../components/admin/MasterDataPage'
import {
  useAdminCategories,
  useCreateAdminCategory,
  useUpdateAdminCategory,
  useDeleteAdminCategory,
} from '../../hooks/queries/useCategoryQueries'

export default function AdminCategoriesPage() {
  const query = useAdminCategories()
  const create = useCreateAdminCategory()
  const update = useUpdateAdminCategory()
  const remove = useDeleteAdminCategory()
  return (
    <MasterDataPage
      title="Quản lý danh mục món ăn"
      label="danh mục"
      idKey="categoryId"
      nameKey="categoryName"
      {...{ query, create, update, remove }}
      fields={[
        {
          key: 'categoryName',
          label: 'Tên danh mục',
          maxLength: 255,
          placeholder: 'VD: Món chay',
        },
      ]}
      columns={[{ label: 'Tên danh mục', value: (row) => row.categoryName }]}
    />
  )
}
