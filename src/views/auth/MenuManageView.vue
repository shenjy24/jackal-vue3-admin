<script setup lang="ts">
import { computed, onMounted, reactive, ref, type Component } from "vue";
import { Plus, Search } from "@element-plus/icons-vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import QueryBar from "@/components/crud/QueryBar.vue";
import {
  deleteAuthPerm,
  getAuthPerm,
  listAuthPerm,
  saveAuthPerm,
  updateAuthPerm
} from "@/api/auth";
import { hasPermission } from "@/utils/permissions";
import { PermType, type AdminId, type AuthMenuVo, type AuthPermQo } from "@/types/admin";

defineOptions({ name: "MenuManageView" });

const { t } = useI18n();
const iconComponents = ElementPlusIconsVue as Record<string, Component>;
const iconNames = Object.keys(iconComponents).sort();
const defaultIconName = "Menu";
const treeProps = { children: "children", label: "name" };

const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const iconPickerVisible = ref(false);
const editingId = ref<AdminId>();
const permissionTree = ref<AuthMenuVo[]>([]);
const filters = reactive<{ code: string; name: string; type?: PermType }>({ code: "", name: "" });
const iconKeyword = ref("");
const form = reactive<AuthPermQo>(emptyForm());

const parentOptions = computed<AuthMenuVo[]>(() => [
  {
    id: 0,
    parentId: 0,
    name: t("permission.root"),
    type: PermType.DIRECTORY,
    children: buildParentOptions(permissionTree.value, editingId.value)
  }
]);
const filteredPermissionTree = computed(() => filterPermissionTree(permissionTree.value));
const filteredIconNames = computed(() => {
  const keyword = iconKeyword.value.trim().toLowerCase();
  return keyword ? iconNames.filter((name) => name.toLowerCase().includes(keyword)) : iconNames;
});
const selectedIconName = computed(() =>
  form.icon && iconComponents[form.icon] ? form.icon : defaultIconName
);
const selectedIconComponent = computed(() => iconComponents[selectedIconName.value]);

function emptyForm(): AuthPermQo {
  return {
    parentId: 0,
    code: "",
    name: "",
    type: PermType.DIRECTORY,
    icon: "",
    path: "",
    component: "",
    sort: 0,
    remark: ""
  };
}

function permissionTypeLabel(type?: PermType) {
  if (type === PermType.DIRECTORY) return t("permission.directoryType");
  if (type === PermType.MENU) return t("permission.menuType");
  if (type === PermType.BUTTON) return t("permission.buttonType");
  return "-";
}

function permissionTypeTag(type?: PermType) {
  if (type === PermType.DIRECTORY) return "info";
  if (type === PermType.MENU) return "primary";
  return "success";
}

function iconComponent(name?: string) {
  return name ? iconComponents[name] : undefined;
}

async function loadPermissionTree() {
  loading.value = true;
  try {
    permissionTree.value = await listAuthPerm();
  } finally {
    loading.value = false;
  }
}

function search() {
  // Tree filtering is reactive; the action remains available for keyboard and button use.
}

function resetFilters() {
  filters.code = "";
  filters.name = "";
  filters.type = undefined;
}

async function openCreate() {
  if (!hasPermission("auth:perm:save")) return;
  editingId.value = undefined;
  Object.assign(form, emptyForm());
  iconKeyword.value = "";
  iconPickerVisible.value = false;
  if (!permissionTree.value.length) await loadPermissionTree();
  dialogVisible.value = true;
}

async function openEdit(row: AuthMenuVo) {
  if (!hasPermission("auth:perm:update")) return;
  const permission = await getAuthPerm({ id: row.id });
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
  iconKeyword.value = "";
  iconPickerVisible.value = false;
  dialogVisible.value = true;
}

function selectIcon(iconName: string) {
  form.icon = iconName;
  iconPickerVisible.value = false;
}

function clearIcon() {
  form.icon = "";
}

function buildParentOptions(nodes: AuthMenuVo[], excludedId?: AdminId): AuthMenuVo[] {
  return nodes
    .filter((node) => node.type !== PermType.BUTTON && node.id !== excludedId)
    .map((node) => ({
      ...node,
      children: buildParentOptions(node.children || [], excludedId)
    }));
}

function filterPermissionTree(nodes: AuthMenuVo[]): AuthMenuVo[] {
  const code = filters.code.trim().toLowerCase();
  const name = filters.name.trim().toLowerCase();
  const type = filters.type;
  if (!code && !name && type === undefined) return nodes;

  return nodes.reduce<AuthMenuVo[]>((result, node) => {
    const children = filterPermissionTree(node.children || []);
    const matched =
      (!code || node.code?.toLowerCase().includes(code)) &&
      (!name || node.name.toLowerCase().includes(name)) &&
      (type === undefined || node.type === type);
    if (matched || children.length) result.push({ ...node, children });
    return result;
  }, []);
}

async function save() {
  const permission = editingId.value ? "auth:perm:update" : "auth:perm:save";
  if (!hasPermission(permission) || !form.name.trim()) return;
  const payload: AuthPermQo = {
    id: editingId.value,
    parentId: form.parentId,
    code: form.code?.trim() || undefined,
    name: form.name.trim(),
    type: form.type,
    icon: form.type === PermType.BUTTON ? undefined : form.icon?.trim() || undefined,
    path: form.type === PermType.MENU ? form.path?.trim() || undefined : undefined,
    component: form.type === PermType.MENU ? form.component?.trim() || undefined : undefined,
    sort: form.sort ?? 0,
    remark: form.remark?.trim() || undefined
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
    await loadPermissionTree();
  } finally {
    submitting.value = false;
  }
}

async function remove(row: AuthMenuVo) {
  if (!hasPermission("auth:perm:delete")) return;
  await ElMessageBox.confirm(t("permission.confirmDelete", { name: row.name }), t("common.delete"), {
    type: "warning"
  });
  await deleteAuthPerm({ id: row.id });
  ElMessage.success(t("common.deleteSuccess"));
  await loadPermissionTree();
}

onMounted(loadPermissionTree);
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
          <el-select v-model="filters.type" clearable :placeholder="t('permission.type')" class="permission-type-select">
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
      <el-table
        v-loading="loading"
        :data="filteredPermissionTree"
        row-key="id"
        default-expand-all
        :tree-props="treeProps"
      >
        <el-table-column prop="name" :label="t('crud.name')" min-width="160" />
        <el-table-column prop="code" :label="t('crud.code')" min-width="180" show-overflow-tooltip />
        <el-table-column :label="t('permission.type')" width="100">
          <template #default="{ row }">
            <el-tag :type="permissionTypeTag(row.type)">
              {{ permissionTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" :label="t('crud.path')" min-width="180" show-overflow-tooltip />
        <el-table-column prop="component" :label="t('crud.component')" min-width="220" show-overflow-tooltip />
        <el-table-column :label="t('crud.icon')" width="90">
          <template #default="{ row }">
            <el-icon v-if="iconComponent(row.icon)" :size="18">
              <component :is="iconComponent(row.icon)" />
            </el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
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
    </section>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? t('permission.editTitle') : t('permission.addTitle')"
      width="640px"
      class="admin-form-dialog"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="88px" class="permission-form">
        <el-form-item :label="t('permission.type')" required>
          <el-radio-group v-model="form.type">
            <el-radio-button :value="PermType.DIRECTORY">{{ t("permission.directoryType") }}</el-radio-button>
            <el-radio-button :value="PermType.MENU">{{ t("permission.menuType") }}</el-radio-button>
            <el-radio-button :value="PermType.BUTTON">{{ t("permission.buttonType") }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <template v-if="form.type !== PermType.BUTTON">
          <el-form-item :label="t('crud.icon')">
            <el-popover
              v-model:visible="iconPickerVisible"
              trigger="click"
              placement="bottom-start"
              :width="500"
              popper-class="menu-icon-picker-popper"
            >
              <template #reference>
                <el-input
                  :model-value="form.icon"
                  readonly
                  clearable
                  :placeholder="t('permission.selectIcon')"
                  class="menu-icon-input"
                  @clear="clearIcon"
                >
                  <template #prefix>
                    <el-icon><component :is="selectedIconComponent" /></el-icon>
                  </template>
                </el-input>
              </template>
              <el-input v-model="iconKeyword" clearable :placeholder="t('permission.searchIcon')" class="menu-icon-picker__search">
                <template #suffix><el-icon><Search /></el-icon></template>
              </el-input>
              <div class="menu-icon-picker__list">
                <button
                  v-for="iconName in filteredIconNames"
                  :key="iconName"
                  type="button"
                  class="menu-icon-picker__item"
                  :class="{ 'menu-icon-picker__item--selected': form.icon === iconName }"
                  :title="iconName"
                  @click="selectIcon(iconName)"
                >
                  <el-icon><component :is="iconComponent(iconName)" /></el-icon>
                  <span>{{ iconName }}</span>
                </button>
                <el-empty v-if="!filteredIconNames.length" :description="t('permission.noMatchingIcon')" :image-size="56" />
              </div>
            </el-popover>
          </el-form-item>
        </template>
        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('crud.name')" required>
              <el-input v-model="form.name" maxlength="128" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="t('crud.code')">
              <el-input v-model="form.code" maxlength="128" />
            </el-form-item>
          </el-col>
          <template v-if="form.type === PermType.MENU">
            <el-col :xs="24" :sm="12">
              <el-form-item :label="t('crud.path')">
                <el-input v-model="form.path" maxlength="255" placeholder="/auth/user" />
              </el-form-item>
            </el-col>
            <el-col :xs="24" :sm="12">
              <el-form-item :label="t('crud.sort')">
                <el-input-number v-model="form.sort" :min="0" :max="9999" controls-position="right" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :label="t('crud.component')">
                <el-input v-model="form.component" maxlength="255" placeholder="auth/UserManageView" />
              </el-form-item>
            </el-col>
          </template>
          <el-col v-else :xs="24" :sm="12">
            <el-form-item :label="t('crud.sort')">
              <el-input-number v-model="form.sort" :min="0" :max="9999" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('permission.parent')">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            node-key="id"
            check-strictly
            default-expand-all
            :render-after-expand="false"
            :teleported="false"
            :props="{ children: 'children', label: 'name', value: 'id' }"
            class="permission-parent-select"
          />
        </el-form-item>
        <el-form-item :label="t('crud.remark')">
          <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="255" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t("common.cancel") }}</el-button>
        <el-button type="primary" :loading="submitting" @click="save">{{ t("common.save") }}</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.permission-type-select {
  width: 120px;
}

.permission-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.permission-form :deep(.el-input-number) {
  width: 100%;
}

.permission-parent-select {
  width: 100%;
}

.permission-parent-select :deep(.el-select__popper) {
  max-height: 320px;
}

.menu-icon-input {
  width: 100%;
}

:global(.menu-icon-picker-popper) {
  padding: 12px;
}

:global(.menu-icon-picker__search) {
  margin-bottom: 10px;
}

:global(.menu-icon-picker__list) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  max-height: 220px;
  overflow-y: auto;
  gap: 2px;
  padding-right: 4px;
}

:global(.menu-icon-picker__item) {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
  overflow: hidden;
  border: 0;
  border-radius: 4px;
  padding: 7px 8px;
  color: var(--el-text-color-regular);
  background: transparent;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

:global(.menu-icon-picker__item:hover),
:global(.menu-icon-picker__item--selected) {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

:global(.menu-icon-picker__item span) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
