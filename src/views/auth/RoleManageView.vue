<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import CrudDialog from "@/components/crud/CrudDialog.vue";
import QueryBar from "@/components/crud/QueryBar.vue";
import {
  bindRolePerm,
  deleteAuthRole,
  getAuthRole,
  listRolePerm,
  queryAuthRole,
  saveAuthRole,
  updateAuthRole
} from "@/api/auth";
import { hasPermission } from "@/utils/permissions";
import type { AdminId, AuthMenuVo, AuthRoleQo, AuthRoleVo } from "@/types/admin";

defineOptions({ name: "RoleManageView" });

interface PermissionTreeRef {
  getCheckedKeys: (leafOnly?: boolean) => unknown[];
  getHalfCheckedKeys: () => unknown[];
  setCheckedKeys: (keys: AdminId[]) => void;
}

const { t } = useI18n();
const loading = ref(false);
const submitting = ref(false);
const permissionLoading = ref(false);
const permissionSubmitting = ref(false);
const dialogVisible = ref(false);
const editingId = ref<AdminId>();
const selectedRoleId = ref<AdminId>();
const rows = ref<AuthRoleVo[]>([]);
const permissionTree = ref<AuthMenuVo[]>([]);
const treeRef = ref<PermissionTreeRef>();
const filters = reactive({ name: "" });
const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 });
const form = reactive<AuthRoleQo>(emptyForm());

function emptyForm(): AuthRoleQo {
  return { name: "", remark: "", permIds: [] };
}

function checkedLeafIds(nodes: AuthMenuVo[]): AdminId[] {
  return nodes.flatMap((node) => {
    if (node.children?.length) return checkedLeafIds(node.children);
    return node.checked === 1 ? [node.id] : [];
  });
}

async function load() {
  loading.value = true;
  try {
    const page = await queryAuthRole({
      name: filters.name || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    });
    rows.value = page.content;
    pagination.total = page.total;
  } finally {
    loading.value = false;
  }
}

function search() {
  pagination.pageNum = 1;
  return load();
}

function resetFilters() {
  filters.name = "";
  return search();
}

async function openCreate() {
  if (!hasPermission("auth:role:save")) return;
  editingId.value = undefined;
  Object.assign(form, emptyForm());
  dialogVisible.value = true;
}

async function openEdit(row: AuthRoleVo) {
  if (!hasPermission("auth:role:update")) return;
  const role = await getAuthRole({ id: row.id });
  editingId.value = role.id;
  Object.assign(form, { id: role.id, name: role.name, remark: role.remark || "", permIds: [] });
  dialogVisible.value = true;
}

async function saveRole() {
  const permission = editingId.value ? "auth:role:update" : "auth:role:save";
  if (!hasPermission(permission) || !form.name) return;
  const payload: AuthRoleQo = {
    id: editingId.value,
    name: form.name,
    remark: form.remark,
    permIds: []
  };

  submitting.value = true;
  try {
    if (editingId.value) {
      await updateAuthRole(payload);
    } else {
      const role = await saveAuthRole(payload);
      await selectRole(role);
    }
    dialogVisible.value = false;
    ElMessage.success(t("common.saveSuccess"));
    await load();
  } finally {
    submitting.value = false;
  }
}

async function selectRole(row?: AuthRoleVo) {
  if (!row) return;
  selectedRoleId.value = row.id;
  permissionLoading.value = true;
  try {
    const tree = await listRolePerm({ id: row.id });
    if (selectedRoleId.value !== row.id) return;
    permissionTree.value = tree;
    await nextTick();
    treeRef.value?.setCheckedKeys(checkedLeafIds(tree));
  } finally {
    if (selectedRoleId.value === row.id) permissionLoading.value = false;
  }
}

async function savePermissions() {
  if (!selectedRoleId.value || !hasPermission("auth:role:update")) return;
  const selected = [
    ...(treeRef.value?.getCheckedKeys(false) || []),
    ...(treeRef.value?.getHalfCheckedKeys() || [])
  ].filter((id): id is AdminId => typeof id === "number");

  permissionSubmitting.value = true;
  try {
    await bindRolePerm({ roleId: selectedRoleId.value, permIds: [...new Set(selected)] });
    ElMessage.success(t("common.saveSuccess"));
  } finally {
    permissionSubmitting.value = false;
  }
}

async function remove(row: AuthRoleVo) {
  if (!hasPermission("auth:role:delete")) return;
  await ElMessageBox.confirm(t("role.confirmDelete", { name: row.name }), t("common.delete"), {
    type: "warning"
  });
  await deleteAuthRole({ id: row.id });
  if (selectedRoleId.value === row.id) {
    selectedRoleId.value = undefined;
    permissionTree.value = [];
  }
  ElMessage.success(t("common.deleteSuccess"));
  await load();
}

onMounted(load);
</script>

<template>
  <section class="role-manage">
    <article class="table-surface role-list-surface">
      <div class="page-toolbar">
        <QueryBar @search="search" @reset="resetFilters">
          <el-form-item :label="t('crud.name')">
            <el-input v-model="filters.name" clearable :placeholder="t('crud.name')" />
          </el-form-item>
        </QueryBar>
        <el-button v-permission="'auth:role:save'" type="primary" :icon="Plus" @click="openCreate">
          {{ t("common.add") }}
        </el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="rows"
        row-key="id"
        highlight-current-row
        :current-row-key="selectedRoleId"
        @current-change="selectRole"
      >
        <el-table-column prop="name" :label="t('crud.name')" min-width="180" />
        <el-table-column prop="remark" :label="t('crud.remark')" min-width="260" show-overflow-tooltip />
        <el-table-column :label="t('common.actions')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'auth:role:update'" link type="primary" @click.stop="openEdit(row)">
              {{ t("common.edit") }}
            </el-button>
            <el-button v-permission="'auth:role:delete'" link type="danger" @click.stop="remove(row)">
              {{ t("common.delete") }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        @current-change="load"
        @size-change="search"
      />
    </article>

    <article class="table-surface permission-surface">
      <div class="permission-header">
        <span>{{ t("role.permissionTree") }}</span>
        <el-button
          v-permission="'auth:role:update'"
          type="primary"
          :loading="permissionSubmitting"
          :disabled="!selectedRoleId"
          @click="savePermissions"
        >
          {{ t("common.save") }}
        </el-button>
      </div>
      <el-empty v-if="!selectedRoleId" :description="t('role.selectRoleTip')" />
      <el-tree
        v-else
        ref="treeRef"
        v-loading="permissionLoading"
        class="permission-tree"
        :data="permissionTree"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="{ children: 'children', label: 'name' }"
      />
    </article>

    <CrudDialog
      v-model="dialogVisible"
      :title="editingId ? t('role.editTitle') : t('role.addTitle')"
      :loading="submitting"
      @save="saveRole"
    >
      <el-form :model="form" label-width="96px">
        <el-form-item :label="t('crud.name')" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('crud.remark')">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
    </CrudDialog>
  </section>
</template>

<style scoped>
.role-manage {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
  gap: 16px;
}

.role-list-surface,
.permission-surface {
  min-width: 0;
}

.permission-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-weight: 600;
}

.permission-tree {
  width: 100%;
  min-height: 360px;
  max-height: calc(100vh - 220px);
  overflow: auto;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

@media (max-width: 960px) {
  .role-manage {
    grid-template-columns: 1fr;
  }
}
</style>
