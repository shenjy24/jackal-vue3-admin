<script setup lang="ts">
import { onMounted } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import QueryBar from "@/components/crud/QueryBar.vue";
import CrudDialog from "@/components/crud/CrudDialog.vue";
import { useCrud } from "@/hooks/useCrud";
import { createApi, listApi, removeApi, updateApi } from "@/api/crud";
import type { CrudApi } from "@/types/admin";

defineOptions({ name: "UserManageView" });

interface UserRow {
  id: string | number;
  username: string;
  nickname: string;
  email: string;
  enabled: boolean;
}

interface UserFilter {
  keyword: string;
}

type UserForm = Omit<UserRow, "id">;

const { t } = useI18n();

const api: CrudApi<UserRow, UserForm, UserFilter> = {
  list: (query) => listApi<UserRow, UserFilter>("/system/user/list", query),
  create: (form) => createApi("/system/user/create", form),
  update: (id, form) => updateApi("/system/user/update", id, form),
  remove: (id) => removeApi("/system/user/delete", id)
};

const crud = useCrud(api, { keyword: "" }, { username: "", nickname: "", email: "", enabled: true });

onMounted(crud.load);
</script>

<template>
  <section class="table-surface">
    <div class="page-toolbar">
      <h1 class="page-title">{{ t("menu.user") }}</h1>
      <el-button v-permission="'system:user:create'" type="primary" :icon="Plus" @click="crud.openCreate">
        {{ t("common.add") }}
      </el-button>
    </div>

    <QueryBar @search="crud.search" @reset="crud.resetFilters">
      <el-form-item :label="t('crud.keyword')">
        <el-input v-model="crud.filters.keyword" clearable />
      </el-form-item>
    </QueryBar>

    <el-table v-loading="crud.loading.value" :data="crud.rows.value" row-key="id">
      <el-table-column prop="username" :label="t('crud.username')" min-width="140" />
      <el-table-column prop="nickname" :label="t('crud.nickname')" min-width="140" />
      <el-table-column prop="email" label="Email" min-width="180" />
      <el-table-column :label="t('common.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'">
            {{ row.enabled ? t("common.enabled") : t("common.disabled") }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.actions')" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="'system:user:update'" link type="primary" @click="crud.openEdit(row)">
            {{ t("common.edit") }}
          </el-button>
          <el-button v-permission="'system:user:delete'" link type="danger" @click="crud.remove(row)">
            {{ t("common.delete") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="crud.pagination.page"
      v-model:page-size="crud.pagination.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="crud.pagination.total"
      @current-change="crud.load"
      @size-change="crud.search"
    />

    <CrudDialog v-model="crud.dialogVisible.value" :title="t('menu.user')" @save="crud.save">
      <el-form :model="crud.form" label-width="96px">
        <el-form-item :label="t('crud.username')">
          <el-input v-model="crud.form.username" />
        </el-form-item>
        <el-form-item :label="t('crud.nickname')">
          <el-input v-model="crud.form.nickname" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="crud.form.email" />
        </el-form-item>
        <el-form-item :label="t('common.status')">
          <el-switch v-model="crud.form.enabled" />
        </el-form-item>
      </el-form>
    </CrudDialog>
  </section>
</template>
