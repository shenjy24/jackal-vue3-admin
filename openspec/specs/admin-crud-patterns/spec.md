# admin-crud-patterns Specification

## Purpose
TBD - created by archiving change build-admin-foundation. Update Purpose after archive.
## Requirements
### Requirement: CRUD 页面遵循一致的表格模式
系统 SHALL 为查询表单、表格、分页和操作提供可复用约定。

#### Scenario: CRUD 列表页加载
- **WHEN** 打开 CRUD 页面
- **THEN** 页面可以通过统一 API 客户端加载分页表格数据

### Requirement: 查询重置分页
系统 SHALL 在用户执行新查询时重置当前页码。

#### Scenario: 用户查询
- **WHEN** 用户修改查询条件并提交查询
- **THEN** 表格从第一页重新加载

### Requirement: 编辑流程使用表单弹窗
系统 SHALL 在标准 CRUD 页面的新增和更新流程中使用表单弹窗模式。

#### Scenario: 用户保存表单弹窗
- **WHEN** 用户提交有效的新增或更新表单
- **THEN** 页面调用对应 API，并在成功后重新加载表格

