<script setup lang="ts">
import { onMounted } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import QueryBar from "@/components/crud/QueryBar.vue";
import CrudDialog from "@/components/crud/CrudDialog.vue";
import { useCrud } from "@/hooks/useCrud";
import { createApi, listApi, removeApi, updateApi } from "@/api/crud";
import type { CrudApi } from "@/types/admin";

defineOptions({ name: "MenuManageView" });

interface MenuRow {
  id: string | number;
  name: string;
  path: string;
  component: string;
  permission: string;
}

interface MenuFilter {
  keyword: string;
}

type MenuForm = Omit<MenuRow, "id">;

const { t } = useI18n();

const api: CrudApi<MenuRow, MenuForm, MenuFilter> = {
  list: (query) => listApi<MenuRow, MenuFilter>("/system/menu/list", query),
  create: (form) => createApi("/system/menu/create", form),
  update: (id, form) => updateApi("/system/menu/update", id, form),
  remove: (id) => removeApi("/system/menu/delete", id)
};

const crud = useCrud(api, { keyword: "" }, { name: "", path: "", component: "", permission: "" });

onMounted(crud.load);
</script>

<template>
  <section class="table-surface">
    <div class="page-toolbar">
      <h1 class="page-title">{{ t("menu.menu") }}</h1>
      <el-button v-permission="'system:menu:create'" type="primary" :icon="Plus" @click="crud.openCreate">
        {{ t("common.add") }}
      </el-button>
    </div>

    <QueryBar @search="crud.search" @reset="crud.resetFilters">
      <el-form-item :label="t('crud.keyword')">
        <el-input v-model="crud.filters.keyword" clearable />
      </el-form-item>
    </QueryBar>

    <el-table v-loading="crud.loading.value" :data="crud.rows.value" row-key="id">
      <el-table-column prop="name" :label="t('crud.name')" min-width="150" />
      <el-table-column prop="path" :label="t('crud.path')" min-width="160" />
      <el-table-column prop="component" :label="t('crud.component')" min-width="160" />
      <el-table-column prop="permission" :label="t('crud.permission')" min-width="200" />
      <el-table-column :label="t('common.actions')" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-permission="'system:menu:update'" link type="primary" @click="crud.openEdit(row)">
            {{ t("common.edit") }}
          </el-button>
          <el-button v-permission="'system:menu:delete'" link type="danger" @click="crud.remove(row)">
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

    <CrudDialog v-model="crud.dialogVisible.value" :title="t('menu.menu')" @save="crud.save">
      <el-form :model="crud.form" label-width="108px">
        <el-form-item :label="t('crud.name')">
          <el-input v-model="crud.form.name" />
        </el-form-item>
        <el-form-item :label="t('crud.path')">
          <el-input v-model="crud.form.path" />
        </el-form-item>
        <el-form-item :label="t('crud.component')">
          <el-input v-model="crud.form.component" />
        </el-form-item>
        <el-form-item :label="t('crud.permission')">
          <el-input v-model="crud.form.permission" />
        </el-form-item>
      </el-form>
    </CrudDialog>
  </section>
</template>
