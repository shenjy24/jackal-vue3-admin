<script setup lang="ts">
import { onMounted } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import QueryBar from "@/components/crud/QueryBar.vue";
import CrudDialog from "@/components/crud/CrudDialog.vue";
import { useCrud } from "@/hooks/useCrud";
import { createApi, listApi, removeApi, updateApi } from "@/api/crud";
import type { CrudApi } from "@/types/admin";

defineOptions({ name: "RoleManageView" });

interface RoleRow {
  id: string | number;
  code: string;
  name: string;
  remark: string;
}

interface RoleFilter {
  keyword: string;
}

type RoleForm = Omit<RoleRow, "id">;

const { t } = useI18n();

const api: CrudApi<RoleRow, RoleForm, RoleFilter> = {
  list: (query) => listApi<RoleRow, RoleFilter>("/system/role/list", query),
  create: (form) => createApi("/system/role/create", form),
  update: (id, form) => updateApi("/system/role/update", id, form),
  remove: (id) => removeApi("/system/role/delete", id)
};

const crud = useCrud(api, { keyword: "" }, { code: "", name: "", remark: "" });

onMounted(crud.load);
</script>

<template>
  <section class="table-surface">
    <div class="page-toolbar">
      <h1 class="page-title">{{ t("menu.role") }}</h1>
      <el-button v-permission="'system:role:create'" type="primary" :icon="Plus" @click="crud.openCreate">
        {{ t("common.add") }}
      </el-button>
    </div>

    <QueryBar @search="crud.search" @reset="crud.resetFilters">
      <el-form-item :label="t('crud.keyword')">
        <el-input v-model="crud.filters.keyword" clearable />
      </el-form-item>
    </QueryBar>

    <el-table v-loading="crud.loading.value" :data="crud.rows.value" row-key="id">
      <el-table-column prop="code" :label="t('crud.code')" min-width="160" />
      <el-table-column prop="name" :label="t('crud.name')" min-width="160" />
      <el-table-column prop="remark" :label="t('crud.remark')" min-width="220" />
      <el-table-column :label="t('common.actions')" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="'system:role:update'" link type="primary" @click="crud.openEdit(row)">
            {{ t("common.edit") }}
          </el-button>
          <el-button v-permission="'system:role:delete'" link type="danger" @click="crud.remove(row)">
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

    <CrudDialog v-model="crud.dialogVisible.value" :title="t('menu.role')" @save="crud.save">
      <el-form :model="crud.form" label-width="96px">
        <el-form-item :label="t('crud.code')">
          <el-input v-model="crud.form.code" />
        </el-form-item>
        <el-form-item :label="t('crud.name')">
          <el-input v-model="crud.form.name" />
        </el-form-item>
        <el-form-item :label="t('crud.remark')">
          <el-input v-model="crud.form.remark" type="textarea" />
        </el-form-item>
      </el-form>
    </CrudDialog>
  </section>
</template>
