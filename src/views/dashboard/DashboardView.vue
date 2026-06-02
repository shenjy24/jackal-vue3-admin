<script setup lang="ts">
defineOptions({ name: "DashboardView" });
</script>

<template>
  <section class="table-surface">
    <div class="page-toolbar">
      <h1 class="page-title">Dashboard</h1>
    </div>
    <el-alert type="success" show-icon :closable="false" title="Session restored and admin shell initialized." />
  </section>
</template>
