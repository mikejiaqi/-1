# 工业油漆数据库 - 前端数据结构设计

## 数据模型

基于之前的Excel数据库，我们设计以下JSON数据结构来存储油漆产品信息：

```javascript
{
  "products": [
    {
      "id": "唯一标识符",
      "name": "产品名称",
      "brand": "品牌",
      "type": "类型",
      "color": "颜色",
      "filmThickness": "干膜厚度(μm)",
      "solidContent": "固体含量(%)",
      "density": "比重",
      "coatCount": "涂刷道数",
      "applicationMethod": "施工方式",
      "theoreticalCoverageL": "理论材料耗量(㎡/L)",
      "theoreticalCoverageKg": "理论材料耗量(㎡/kg)",
      "lossFactor": "损耗系数",
      "actualCoverageL": "实际材料耗量(㎡/L)",
      "actualCoverageKg": "实际材料耗量(㎡/kg)",
      "pricePerL": "单位价格(元/L)",
      "pricePerKg": "单位价格(元/kg)",
      "pricePerSqm": "单位价格(元/㎡)",
      "notes": "备注",
      "updateDate": "更新日期"
    }
  ],
  "lastUpdated": "最后更新时间戳",
  "version": "数据库版本号"
}
```

## 本地存储策略

使用浏览器的localStorage API来存储数据：

1. 主数据存储在`paintDatabase`键下
2. 设置存储大小限制检查（localStorage通常限制为5MB）
3. 实现数据压缩功能，以应对大量数据
4. 定期自动保存功能

## 计算字段

以下字段将通过计算得出，而非直接存储：

1. `theoreticalCoverageKg` = `theoreticalCoverageL` / `density`
2. `actualCoverageL` = `theoreticalCoverageL` / `lossFactor`
3. `actualCoverageKg` = `theoreticalCoverageKg` / `lossFactor`
4. `pricePerSqm` = `pricePerL` / `actualCoverageL`

## 数据验证规则

1. 固体含量：0-100%之间的数值
2. 比重：大于0的数值
3. 施工方式：预定义列表中的值（无气喷涂、有气喷涂、辊涂、刷涂、浸涂、其他）
4. 必填字段：产品名称、固体含量、比重

## 导入/导出功能

1. 导出为JSON文件
2. 导出为CSV文件（兼容Excel）
3. 从JSON文件导入
4. 从CSV文件导入（兼容Excel）
