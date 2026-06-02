import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { CrudApi, PageQuery, Pagination } from "@/types/admin";
import { i18n } from "@/i18n";

export function useCrud<
  TItem extends { id: string | number },
  TForm extends Record<string, unknown>,
  TFilter extends Record<string, unknown>
>(
  api: CrudApi<TItem, TForm, TFilter>,
  initialFilter: TFilter,
  initialForm: TForm
) {
  const loading = ref(false);
  const rows = ref<TItem[]>([]);
  const filters = reactive({ ...initialFilter }) as TFilter;
  const pagination = reactive<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const dialogVisible = ref(false);
  const editingId = ref<string | number | null>(null);
  const form = reactive({ ...initialForm }) as TForm;

  async function load() {
    loading.value = true;
    try {
      const query: PageQuery<TFilter> = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters
      };
      const result = await api.list(query);
      rows.value = result.list;
      pagination.total = result.total;
    } finally {
      loading.value = false;
    }
  }

  function search() {
    pagination.page = 1;
    return load();
  }

  function resetFilters() {
    Object.assign(filters, initialFilter);
    return search();
  }

  function openCreate() {
    editingId.value = null;
    Object.assign(form as Record<string, unknown>, initialForm);
    dialogVisible.value = true;
  }

  function openEdit(row: TItem) {
    editingId.value = row.id;
    Object.assign(form as Record<string, unknown>, row);
    dialogVisible.value = true;
  }

  async function save() {
    if (editingId.value) {
      await api.update(editingId.value, form);
    } else {
      await api.create(form);
    }
    dialogVisible.value = false;
    ElMessage.success(i18n.global.t("common.save"));
    await load();
  }

  async function remove(row: TItem) {
    await ElMessageBox.confirm(i18n.global.t("common.confirmDelete"), i18n.global.t("common.delete"), {
      type: "warning"
    });
    await api.remove(row.id);
    await load();
  }

  return {
    loading,
    rows,
    filters,
    pagination,
    dialogVisible,
    editingId,
    form,
    load,
    search,
    resetFilters,
    openCreate,
    openEdit,
    save,
    remove
  };
}
