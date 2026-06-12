<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { Key, Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useI18n } from "vue-i18n";
import CrudDialog from "@/components/crud/CrudDialog.vue";
import QueryBar from "@/components/crud/QueryBar.vue";
import {
  deleteAuthUser,
  getAuthUser,
  queryAuthRole,
  queryAuthUser,
  resetPassword,
  saveAuthUser,
  updateAuthUser
} from "@/api/auth";
import { hasPermission } from "@/utils/permissions";
import type { AdminId, AuthRoleVo, AuthUserQo, AuthUserVo } from "@/types/admin";

defineOptions({ name: "UserManageView" });

const { t } = useI18n();
const loading = ref(false);
const submitting = ref(false);
const dialogVisible = ref(false);
const editingId = ref<AdminId>();
const rows = ref<AuthUserVo[]>([]);
const roleOptions = ref<AuthRoleVo[]>([]);
const filters = reactive({ nickname: "" });
const pagination = reactive({ pageNum: 1, pageSize: 20, total: 0 });
const form = reactive<AuthUserQo>(emptyForm());

function emptyForm(): AuthUserQo {
  return { account: "", nickname: "", avatar: "", roleIds: [] };
}

async function load() {
  loading.value = true;
  try {
    const page = await queryAuthUser({
      nickname: filters.nickname || undefined,
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
  filters.nickname = "";
  return search();
}

async function loadRoleOptions() {
  const page = await queryAuthRole({ pageNum: 1, pageSize: 200 });
  roleOptions.value = page.content;
}

async function openCreate() {
  if (!hasPermission("auth:user:save")) return;
  editingId.value = undefined;
  Object.assign(form, emptyForm());
  await loadRoleOptions();
  dialogVisible.value = true;
}

async function openEdit(row: AuthUserVo) {
  if (!hasPermission("auth:user:update")) return;
  const [user] = await Promise.all([getAuthUser({ id: row.id }), loadRoleOptions()]);
  editingId.value = user.id;
  Object.assign(form, {
    id: user.id,
    account: user.account,
    nickname: user.nickname,
    avatar: user.avatar || "",
    roleIds: user.roles.map((role) => role.id)
  });
  dialogVisible.value = true;
}

async function save() {
  const permission = editingId.value ? "auth:user:update" : "auth:user:save";
  if (!hasPermission(permission) || !form.account || !form.nickname) return;
  submitting.value = true;
  try {
    if (editingId.value) {
      await updateAuthUser({ ...form, id: editingId.value });
    } else {
      await saveAuthUser({ ...form, id: undefined });
    }
    dialogVisible.value = false;
    ElMessage.success(t("common.saveSuccess"));
    await load();
  } finally {
    submitting.value = false;
  }
}

async function remove(row: AuthUserVo) {
  if (!hasPermission("auth:user:delete")) return;
  await ElMessageBox.confirm(t("user.confirmDelete", { name: row.nickname }), t("common.delete"), {
    type: "warning"
  });
  await deleteAuthUser({ id: row.id });
  ElMessage.success(t("common.deleteSuccess"));
  await load();
}

async function resetUserPassword(row: AuthUserVo) {
  if (!hasPermission("auth:user:reset")) return;
  await ElMessageBox.confirm(t("user.confirmResetPassword", { name: row.nickname }), t("user.resetPassword"), {
    type: "warning"
  });
  await resetPassword({ id: row.id });
  ElMessage.success(t("user.resetPasswordSuccess"));
}

onMounted(load);
</script>

<template>
  <section class="table-surface">
    <div class="page-toolbar">
      <h1 class="page-title">{{ t("menu.user") }}</h1>
      <el-button v-permission="'auth:user:save'" type="primary" :icon="Plus" @click="openCreate">
        {{ t("common.add") }}
      </el-button>
    </div>

    <QueryBar @search="search" @reset="resetFilters">
      <el-form-item :label="t('crud.nickname')">
        <el-input v-model="filters.nickname" clearable />
      </el-form-item>
    </QueryBar>

    <el-table v-loading="loading" :data="rows" row-key="id">
      <el-table-column :label="t('crud.avatar')" width="80">
        <template #default="{ row }">
          <el-avatar :size="36" :src="row.avatar">{{ row.nickname?.slice(0, 1) }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="account" :label="t('crud.account')" min-width="150" />
      <el-table-column prop="nickname" :label="t('crud.nickname')" min-width="150" />
      <el-table-column :label="t('crud.roles')" min-width="220">
        <template #default="{ row }">
          <el-space wrap>
            <el-tag v-for="role in row.roles" :key="role.id" type="info">{{ role.name }}</el-tag>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.actions')" width="240" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="'auth:user:update'" link type="primary" @click="openEdit(row)">
            {{ t("common.edit") }}
          </el-button>
          <el-button
            v-permission="'auth:user:reset'"
            link
            type="warning"
            :icon="Key"
            @click="resetUserPassword(row)"
          >
            {{ t("user.resetPassword") }}
          </el-button>
          <el-button v-permission="'auth:user:delete'" link type="danger" @click="remove(row)">
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

    <CrudDialog
      v-model="dialogVisible"
      :title="editingId ? t('user.editTitle') : t('user.addTitle')"
      :loading="submitting"
      @save="save"
    >
      <el-form :model="form" label-width="96px">
        <el-form-item :label="t('crud.account')" required>
          <el-input v-model="form.account" />
        </el-form-item>
        <el-form-item :label="t('crud.nickname')" required>
          <el-input v-model="form.nickname" />
        </el-form-item>
        <el-form-item :label="t('crud.avatar')">
          <el-input v-model="form.avatar" />
        </el-form-item>
        <el-form-item :label="t('crud.roles')">
          <el-select v-model="form.roleIds" multiple filterable style="width: 100%">
            <el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </CrudDialog>
  </section>
</template>
