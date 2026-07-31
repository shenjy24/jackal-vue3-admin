<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import CrudDialog from "@/components/crud/CrudDialog.vue";
import QueryBar from "@/components/crud/QueryBar.vue";
import {
  deleteAuthPerm,
  getAuthPerm,
  listAuthPerm,
  queryAuthPerm,
  saveAuthPerm,
  updateAuthPerm
} from "@/api/auth";
import { hasPermission } from "@/utils/permissions";
import { PermType, type AdminId, type AuthMenuVo, type AuthPermQo, type AuthPermVo } from "@/types/admin";

defineOptions({ name: "MenuManageView" });

const { t } = useI18n();
const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const editingId = ref<AdminId>();
const rows = ref<AuthPermVo[]>([]);
const permissionTree = ref<AuthMenuVo[]>([]);
const filters = reactive<{ code: string; name: string; type?: PermType }>({ code: "", name: "" });
const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 });
const form = reactive<AuthPermQo>(emptyForm());

const permissionTypeTagMap = {
  [PermType.DIRECTORY]: "info",
  [PermType.MENU]: "primary",
  [PermType.BUTTON]: "success"
} as const;

function emptyForm(): AuthPermQo {
  return {
    parentId: 0,
    code: "",
    name: "",
    type: PermType.MENU,
    icon: "",
    path: "",
    component: "",
    sort: 0,
    remark: ""
  };
}

function permissionTypeLabel(type: PermType) {
  if (type === PermType.DIRECTORY) return t("permission.directoryType");
  if (type === PermType.MENU) return t("permission.menuType");
  return t("permission.buttonType");
}

function permissionTypeTag(type: PermType) {
  return permissionTypeTagMap[type];
}

async function load() {
  loading.value = true;
  try {
    const page = await queryAuthPerm({
      code: filters.code || undefined,
      name: filters.name || undefined,
      type: filters.type,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    });
    rows.value = page.content;
    pagination.total = Number(page.total ?? 0);
  } finally {
    loading.value = false;
  }
}

function search() {
  pagination.pageNum = 1;
  return load();
}

function resetFilters() {
  filters.code = "";
  filters.name = "";
  filters.type = undefined;
  return search();
}

async function loadPermissionTree() {
  permissionTree.value = await listAuthPerm();
}

async function openCreate() {
  if (!hasPermission("auth:perm:save")) return;
  editingId.value = undefined;
  Object.assign(form, emptyForm());
  await loadPermissionTree();
  dialogVisible.value = true;
}

async function openEdit(row: AuthPermVo) {
  if (!hasPermission("auth:perm:update")) return;
  const [permission] = await Promise.all([getAuthPerm({ id: row.id }), loadPermissionTree()]);
  editingId.value = permission.id;
  Object.assign(form, {
    id: permission.id,
    parentId: permission.parentId ?? 0,
    code: permission.code || "",
    name: permission.name,
    type: permission.type,
    icon: permission.icon || "",
    path: permission.path || "",
    component: permission.component || "",
    sort: permission.sort ?? 0,
    remark: permission.remark || ""
  });
  dialogVisible.value = true;
}

async function save() {
  const permission = editingId.value ? "auth:perm:update" : "auth:perm:save";
  if (!hasPermission(permission) || !form.name) return;
  const payload: AuthPermQo = {
    ...form,
    id: editingId.value,
    component: form.type === PermType.MENU ? form.component || undefined : undefined,
    icon: form.type !== PermType.BUTTON ? form.icon || undefined : undefined,
    path: form.type !== PermType.BUTTON ? form.path || undefined : undefined
  };

  submitting.value = true;
  try {
    if (editingId.value) {
      await updateAuthPerm(payload);
    } else {
      await saveAuthPerm(payload);
    }
    dialogVisible.value = false;
    ElMessage.success(t("common.saveSuccess"));
    await load();
  } finally {
    submitting.value = false;
  }
}

async function remove(row: AuthPermVo) {
  if (!hasPermission("auth:perm:delete")) return;
  await ElMessageBox.confirm(t("permission.confirmDelete", { name: row.name }), t("common.delete"), {
    type: "warning"
  });
  await deleteAuthPerm({ id: row.id });
  ElMessage.success(t("common.deleteSuccess"));
  await load();
}

onMounted(load);
</script>

<template>
  <section class="table-surface">
    <div class="page-toolbar">
      <QueryBar @search="search" @reset="resetFilters">
        <el-form-item :label="t('crud.code')">
          <el-input v-model="filters.code" clearable :placeholder="t('crud.code')" />
        </el-form-item>
        <el-form-item :label="t('crud.name')">
          <el-input v-model="filters.name" clearable :placeholder="t('crud.name')" />
        </el-form-item>
        <el-form-item :label="t('permission.type')">
          <el-select v-model="filters.type" clearable :placeholder="t('permission.type')" style="width: 140px">
            <el-option :label="t('permission.directoryType')" :value="PermType.DIRECTORY" />
            <el-option :label="t('permission.menuType')" :value="PermType.MENU" />
            <el-option :label="t('permission.buttonType')" :value="PermType.BUTTON" />
          </el-select>
        </el-form-item>
      </QueryBar>
      <el-button v-permission="'auth:perm:save'" type="primary" :icon="Plus" @click="openCreate">
        {{ t("common.add") }}
      </el-button>
    </div>

    <section class="list-card">
      <el-table v-loading="loading" :data="rows" row-key="id">
      <el-table-column prop="code" :label="t('crud.code')" min-width="190" />
      <el-table-column prop="name" :label="t('crud.name')" min-width="150" />
      <el-table-column :label="t('permission.type')" width="100">
        <template #default="{ row }">
          <el-tag :type="permissionTypeTag(row.type)">
            {{ permissionTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" :label="t('crud.path')" min-width="150" show-overflow-tooltip />
      <el-table-column prop="component" :label="t('crud.component')" min-width="190" show-overflow-tooltip />
      <el-table-column prop="sort" :label="t('crud.sort')" width="90" />
      <el-table-column prop="remark" :label="t('crud.remark')" min-width="180" show-overflow-tooltip />
      <el-table-column :label="t('common.actions')" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="'auth:perm:update'" link type="primary" @click="openEdit(row)">
            {{ t("common.edit") }}
          </el-button>
          <el-button v-permission="'auth:perm:delete'" link type="danger" @click="remove(row)">
            {{ t("common.delete") }}
          </el-button>
        </template>
      </el-table-column>
      </el-table>

      <div class="list-card__pager">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          background
          :hide-on-single-page="false"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          @current-change="load"
          @size-change="search"
        />
      </div>
    </section>

    <CrudDialog
      v-model="dialogVisible"
      :title="editingId ? t('permission.editTitle') : t('permission.addTitle')"
      :loading="submitting"
      @save="save"
    >
      <el-form :model="form" label-width="112px">
        <el-form-item :label="t('permission.parent')">
          <el-tree-select
            v-model="form.parentId"
            :data="permissionTree"
            node-key="id"
            check-strictly
            :render-after-expand="false"
            :props="{ children: 'children', label: 'name', value: 'id' }"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="t('permission.type')" required>
          <el-radio-group v-model="form.type">
            <el-radio :value="PermType.DIRECTORY">{{ t("permission.directoryType") }}</el-radio>
            <el-radio :value="PermType.MENU">{{ t("permission.menuType") }}</el-radio>
            <el-radio :value="PermType.BUTTON">{{ t("permission.buttonType") }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('crud.code')">
          <el-input v-model="form.code" />
        </el-form-item>
        <el-form-item :label="t('crud.name')" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <template v-if="form.type !== PermType.BUTTON">
          <el-form-item :label="t('crud.icon')">
            <el-input v-model="form.icon" />
          </el-form-item>
          <el-form-item :label="t('crud.path')">
            <el-input v-model="form.path" :placeholder="form.type === PermType.DIRECTORY ? '/auth' : '/auth/user'" />
          </el-form-item>
          <el-form-item v-if="form.type === PermType.MENU" :label="t('crud.component')">
            <el-input v-model="form.component" placeholder="auth/UserManageView" />
            <div class="form-tip">{{ t("permission.componentTip") }}</div>
          </el-form-item>
        </template>
        <el-form-item :label="t('crud.sort')">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item :label="t('crud.remark')">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
    </CrudDialog>
  </section>
</template>

<style scoped>
.form-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}
</style>
