# 工业油漆数据库 - 网站嵌入与使用指南

本文档将指导您如何将工业油漆数据库应用嵌入到您的现有网站中，并提供详细的使用说明。

## 目录

1. [文件清单](#文件清单)
2. [嵌入方式](#嵌入方式)
   - [方式一：完整页面链接](#方式一完整页面链接)
   - [方式二：iframe嵌入](#方式二iframe嵌入)
   - [方式三：直接集成代码](#方式三直接集成代码)
3. [数据管理](#数据管理)
   - [数据存储原理](#数据存储原理)
   - [数据备份与恢复](#数据备份与恢复)
   - [数据迁移](#数据迁移)
4. [使用说明](#使用说明)
5. [常见问题](#常见问题)
6. [注意事项](#注意事项)

## 文件清单

本应用包含以下文件：

- `index.html` - 主HTML文件
- `styles.css` - 样式表文件
- `app.js` - JavaScript应用逻辑
- `embedding_guide.md` - 本嵌入指南文档

## 嵌入方式

### 方式一：完整页面链接

最简单的方式是将整个应用作为独立页面，通过链接从您的网站访问。

**步骤：**

1. 将所有文件上传到您的网站服务器
2. 在您的网站导航菜单或适当位置添加链接，指向`index.html`

**示例代码：**

```html
<a href="path/to/paint_db/index.html" target="_blank">工业油漆数据库</a>
```

**优点：**
- 实现最简单
- 不影响现有网站
- 用户体验完整

**缺点：**
- 用户需要离开当前页面

### 方式二：iframe嵌入

通过iframe将应用嵌入到您网站的特定页面中。

**步骤：**

1. 将所有文件上传到您的网站服务器
2. 在您网站的目标页面中添加iframe代码

**示例代码：**

```html
<iframe src="path/to/paint_db/index.html" style="width:100%; height:800px; border:none;"></iframe>
```

**优点：**
- 用户无需离开当前网站
- 实现相对简单
- 应用与现有网站隔离，不会相互干扰

**缺点：**
- 在某些移动设备上可能需要调整高度
- iframe在某些情况下可能有跨域限制

### 方式三：直接集成代码

将应用的HTML、CSS和JavaScript代码直接集成到您网站的页面中。

**步骤：**

1. 在您网站的目标页面中创建一个容器元素
2. 将`index.html`中的主要内容复制到容器中
3. 在页面头部引入CSS和JavaScript文件
4. 确保不与现有网站的样式和脚本冲突

**示例代码：**

```html
<!-- 在<head>中添加 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
<link rel="stylesheet" href="path/to/paint_db/styles.css">

<!-- 在页面中添加容器 -->
<div id="paint-database-container">
    <!-- 从index.html复制主要内容 -->
</div>

<!-- 在</body>前添加 -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="path/to/paint_db/app.js"></script>
```

**优点：**
- 更好的页面整合
- 可以根据需要自定义样式以匹配网站

**缺点：**
- 实现复杂
- 可能与现有网站代码产生冲突
- 需要更多的技术知识

## 数据管理

### 数据存储原理

本应用使用浏览器的localStorage API存储所有数据，这意味着：

- 数据存储在用户的浏览器中，不需要服务器
- 数据在浏览器关闭后仍然保留
- 不同浏览器或设备之间的数据不会自动同步
- localStorage通常有5MB左右的存储限制

### 数据备份与恢复

定期备份数据非常重要，以防数据丢失：

1. **备份数据**：
   - 在应用中点击"导入/导出"
   - 点击"导出为JSON"按钮
   - 保存生成的JSON文件到安全位置

2. **恢复数据**：
   - 在应用中点击"导入/导出"
   - 点击"选择文件"并选择之前导出的JSON文件
   - 勾选"替换现有数据"（如果要完全恢复）
   - 点击"导入"按钮

### 数据迁移

要将数据从一台设备迁移到另一台设备：

1. 在源设备上导出数据为JSON文件
2. 将JSON文件传输到目标设备
3. 在目标设备上导入JSON文件

## 使用说明

### 基本功能

1. **浏览数据**：
   - 在"数据库"页面查看所有油漆产品
   - 使用表头排序功能按不同字段排序
   - 使用分页控件浏览大量数据

2. **搜索产品**：
   - 在搜索框中输入关键词
   - 系统会在产品名称、品牌、类型、颜色和备注中搜索匹配项

3. **添加产品**：
   - 点击"添加产品"导航项
   - 填写产品信息（带*的为必填项）
   - 系统会自动计算相关字段
   - 点击"保存"按钮添加产品

4. **编辑产品**：
   - 在产品列表中点击编辑图标
   - 修改产品信息
   - 点击"保存"按钮更新产品

5. **删除产品**：
   - 在产品列表中点击删除图标
   - 确认删除操作

6. **查看详情**：
   - 在产品列表中点击查看图标
   - 查看产品的详细信息

7. **导入/导出**：
   - 点击"导入/导出"导航项
   - 选择导出格式（JSON或CSV）
   - 选择要导入的文件

## 常见问题

### 数据丢失问题

**问题**：我的数据突然丢失了，怎么办？

**解决方案**：
- 如果您之前有导出备份，请导入该备份
- 浏览器清除缓存或隐私数据可能会删除localStorage中的数据
- 某些浏览器的隐私模式不会永久保存localStorage数据

### 存储限制问题

**问题**：我无法添加更多产品，系统提示存储空间已满。

**解决方案**：
- localStorage通常限制在5MB左右
- 导出数据，清除部分不常用的产品，然后重新导入必要的数据
- 考虑将数据分成多个独立的数据库文件

### 跨设备同步问题

**问题**：我在一台设备上添加的数据在另一台设备上看不到。

**解决方案**：
- 本应用不支持自动跨设备同步
- 使用导出/导入功能在设备间手动同步数据

### 嵌入冲突问题

**问题**：应用嵌入到我的网站后，样式或功能出现异常。

**解决方案**：
- 尝试使用iframe方式嵌入，避免样式冲突
- 检查您网站的JavaScript是否与应用的脚本冲突
- 确保Bootstrap和其他依赖库正确加载

## 注意事项

1. **定期备份**：
   - 定期导出数据作为备份
   - 特别是在浏览器更新或清理缓存前

2. **浏览器兼容性**：
   - 本应用在Chrome、Firefox、Edge等现代浏览器中测试通过
   - 不支持IE11及以下版本

3. **移动设备使用**：
   - 应用支持响应式设计，可在移动设备上使用
   - 在小屏幕设备上，表格会水平滚动

4. **数据安全**：
   - 所有数据存储在用户本地，不会上传到任何服务器
   - 如有敏感数据，请确保设备安全

5. **存储限制**：
   - 注意localStorage的5MB存储限制
   - 如果数据量大，请定期清理不必要的记录
