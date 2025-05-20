/**
 * 工业油漆数据库 - 前端应用
 * 纯JavaScript实现，使用localStorage存储数据
 */

// 全局变量
const DB_KEY = 'paintDatabase'; // localStorage键名
const ITEMS_PER_PAGE = 10; // 每页显示的产品数量
let currentPage = 1; // 当前页码
let currentSort = { field: 'name', direction: 'asc' }; // 当前排序
let currentProducts = []; // 当前显示的产品列表
let searchTerm = ''; // 当前搜索关键词
let editingProductId = null; // 当前编辑的产品ID

// DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据库
    initDatabase();
    
    // 初始化页面导航
    initNavigation();
    
    // 初始化产品列表
    refreshProductList();
    
    // 初始化表单事件
    initFormEvents();
    
    // 初始化排序功能
    initSorting();
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化导入导出功能
    initImportExport();
    
    // 初始化示例数据下载
    initSampleData();
});

/**
 * 初始化数据库
 */
function initDatabase() {
    // 检查localStorage中是否已有数据
    if (!localStorage.getItem(DB_KEY)) {
        // 初始化空数据库
        const initialData = {
            products: [],
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        saveDatabase(initialData);
    }
}

/**
 * 获取数据库
 * @returns {Object} 数据库对象
 */
function getDatabase() {
    try {
        return JSON.parse(localStorage.getItem(DB_KEY)) || { products: [], lastUpdated: new Date().toISOString(), version: '1.0' };
    } catch (e) {
        showToast('读取数据库出错，将重置为空数据库', 'error');
        const initialData = {
            products: [],
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        saveDatabase(initialData);
        return initialData;
    }
}

/**
 * 保存数据库
 * @param {Object} data 数据库对象
 */
function saveDatabase(data) {
    try {
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showToast('存储空间已满，请导出并清理部分数据', 'error');
        } else {
            showToast('保存数据库出错: ' + e.message, 'error');
        }
    }
}

/**
 * 初始化页面导航
 */
function initNavigation() {
    // 导航链接点击事件
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // 切换导航项激活状态
            document.querySelectorAll('.nav-link').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            // 切换页面显示
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            document.getElementById(targetPage + '-page').classList.add('active');
        });
    });
    
    // 添加第一个产品按钮点击事件
    document.getElementById('add-first-product-btn').addEventListener('click', function() {
        document.querySelector('[data-page="add-product"]').click();
    });
    
    // 取消按钮点击事件
    document.getElementById('cancel-button').addEventListener('click', function() {
        document.querySelector('[data-page="database"]').click();
    });
}

/**
 * 刷新产品列表
 */
function refreshProductList() {
    const db = getDatabase();
    let products = db.products;
    
    // 应用搜索过滤
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        products = products.filter(product => {
            return (
                (product.name && product.name.toLowerCase().includes(term)) ||
                (product.brand && product.brand.toLowerCase().includes(term)) ||
                (product.type && product.type.toLowerCase().includes(term)) ||
                (product.color && product.color.toLowerCase().includes(term)) ||
                (product.notes && product.notes.toLowerCase().includes(term))
            );
        });
    }
    
    // 应用排序
    products.sort((a, b) => {
        let valA = a[currentSort.field] || '';
        let valB = b[currentSort.field] || '';
        
        // 数字类型字段特殊处理
        if (typeof valA === 'number' && typeof valB === 'number') {
            return currentSort.direction === 'asc' ? valA - valB : valB - valA;
        }
        
        // 字符串类型字段
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        
        if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    // 保存当前产品列表
    currentProducts = products;
    
    // 计算分页
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    
    // 获取当前页的产品
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageProducts = products.slice(startIndex, endIndex);
    
    // 更新产品列表
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    
    if (products.length === 0) {
        // 显示无数据提示
        document.getElementById('no-data-message').classList.remove('d-none');
        document.getElementById('showing-records').textContent = '0-0';
        document.getElementById('total-records').textContent = '0';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // 隐藏无数据提示
    document.getElementById('no-data-message').classList.add('d-none');
    
    // 更新显示记录信息
    document.getElementById('showing-records').textContent = `${startIndex + 1}-${Math.min(endIndex, products.length)}`;
    document.getElementById('total-records').textContent = products.length;
    
    // 渲染产品列表
    currentPageProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(product.name || '')}</td>
            <td>${escapeHtml(product.brand || '')}</td>
            <td>${escapeHtml(product.type || '')}</td>
            <td>${escapeHtml(product.color || '')}</td>
            <td>${product.solidContent !== undefined ? product.solidContent : ''}</td>
            <td>${product.density !== undefined ? product.density : ''}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary action-btn view-btn" data-id="${product.id}">
                    <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary action-btn edit-btn" data-id="${product.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger action-btn delete-btn" data-id="${product.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        
        // 添加查看按钮事件
        row.querySelector('.view-btn').addEventListener('click', function() {
            showProductDetail(product.id);
        });
        
        // 添加编辑按钮事件
        row.querySelector('.edit-btn').addEventListener('click', function() {
            editProduct(product.id);
        });
        
        // 添加删除按钮事件
        row.querySelector('.delete-btn').addEventListener('click', function() {
            showDeleteConfirmation(product.id);
        });
        
        productList.appendChild(row);
    });
    
    // 更新分页控件
    renderPagination(totalPages);
}

/**
 * 渲染分页控件
 * @param {number} totalPages 总页数
 */
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }
    
    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    if (currentPage > 1) {
        prevLi.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            currentPage--;
            refreshProductList();
        });
    }
    pagination.appendChild(prevLi);
    
    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            refreshProductList();
        });
        pagination.appendChild(pageLi);
    }
    
    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    if (currentPage < totalPages) {
        nextLi.querySelector('a').addEventListener('click', function(e) {
            e.preventDefault();
            currentPage++;
            refreshProductList();
        });
    }
    pagination.appendChild(nextLi);
}

/**
 * 初始化表单事件
 */
function initFormEvents() {
    const form = document.getElementById('product-form');
    
    // 表单提交事件
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    // 自动计算字段
    const densityInput = document.getElementById('product-density');
    const theoreticalCoverageLInput = document.getElementById('product-theoretical-coverage-l');
    const lossFactorInput = document.getElementById('product-loss-factor');
    const priceLInput = document.getElementById('product-price-per-l');
    
    // 计算理论材料耗量(㎡/kg)
    function calculateTheoreticalCoverageKg() {
        const density = parseFloat(densityInput.value);
        const coverageL = parseFloat(theoreticalCoverageLInput.value);
        const coverageKgInput = document.getElementById('product-theoretical-coverage-kg');
        
        if (!isNaN(density) && !isNaN(coverageL) && density > 0) {
            coverageKgInput.value = (coverageL / density).toFixed(2);
        } else {
            coverageKgInput.value = '';
        }
    }
    
    // 计算实际材料耗量
    function calculateActualCoverage() {
        const coverageL = parseFloat(theoreticalCoverageLInput.value);
        const coverageKg = parseFloat(document.getElementById('product-theoretical-coverage-kg').value);
        const lossFactor = parseFloat(lossFactorInput.value);
        
        const actualCoverageLInput = document.getElementById('product-actual-coverage-l');
        const actualCoverageKgInput = document.getElementById('product-actual-coverage-kg');
        
        if (!isNaN(coverageL) && !isNaN(lossFactor) && lossFactor > 0) {
            actualCoverageLInput.value = (coverageL / lossFactor).toFixed(2);
        } else {
            actualCoverageLInput.value = '';
        }
        
        if (!isNaN(coverageKg) && !isNaN(lossFactor) && lossFactor > 0) {
            actualCoverageKgInput.value = (coverageKg / lossFactor).toFixed(2);
        } else {
            actualCoverageKgInput.value = '';
        }
    }
    
    // 计算单位价格(元/㎡)
    function calculatePricePerSqm() {
        const priceL = parseFloat(priceLInput.value);
        const actualCoverageL = parseFloat(document.getElementById('product-actual-coverage-l').value);
        const priceSqmInput = document.getElementById('product-price-per-sqm');
        
        if (!isNaN(priceL) && !isNaN(actualCoverageL) && actualCoverageL > 0) {
            priceSqmInput.value = (priceL / actualCoverageL).toFixed(2);
        } else {
            priceSqmInput.value = '';
        }
    }
    
    // 添加输入事件监听器
    densityInput.addEventListener('input', function() {
        calculateTheoreticalCoverageKg();
        calculateActualCoverage();
        calculatePricePerSqm();
    });
    
    theoreticalCoverageLInput.addEventListener('input', function() {
        calculateTheoreticalCoverageKg();
        calculateActualCoverage();
        calculatePricePerSqm();
    });
    
    lossFactorInput.addEventListener('input', function() {
        calculateActualCoverage();
        calculatePricePerSqm();
    });
    
    priceLInput.addEventListener('input', calculatePricePerSqm);
}

/**
 * 保存产品
 */
function saveProduct() {
    // 获取表单数据
    const productId = document.getElementById('product-id').value || generateId();
    const productName = document.getElementById('product-name').value.trim();
    const productBrand = document.getElementById('product-brand').value.trim();
    const productType = document.getElementById('product-type').value;
    const productColor = document.getElementById('product-color').value.trim();
    const productFilmThickness = document.getElementById('product-film-thickness').value;
    const productSolidContent = document.getElementById('product-solid-content').value;
    const productDensity = document.getElementById('product-density').value;
    const productCoatCount = document.getElementById('product-coat-count').value;
    const productApplicationMethod = document.getElementById('product-application-method').value;
    const productTheoreticalCoverageL = document.getElementById('product-theoretical-coverage-l').value;
    const productTheoreticalCoverageKg = document.getElementById('product-theoretical-coverage-kg').value;
    const productLossFactor = document.getElementById('product-loss-factor').value;
    const productActualCoverageL = document.getElementById('product-actual-coverage-l').value;
    const productActualCoverageKg = document.getElementById('product-actual-coverage-kg').value;
    const productPricePerL = document.getElementById('product-price-per-l').value;
    const productPricePerKg = document.getElementById('product-price-per-kg').value;
    const productPricePerSqm = document.getElementById('product-price-per-sqm').value;
    const productNotes = document.getElementById('product-notes').value.trim();
    
    // 验证必填字段
    if (!productName) {
        showToast('请输入产品名称', 'warning');
        document.getElementById('product-name').focus();
        return;
    }
    
    if (!productSolidContent) {
        showToast('请输入固体含量', 'warning');
        document.getElementById('product-solid-content').focus();
        return;
    }
    
    if (!productDensity) {
        showToast('请输入比重', 'warning');
        document.getElementById('product-density').focus();
        return;
    }
    
    // 验证数值范围
    if (parseFloat(productSolidContent) < 0 || parseFloat(productSolidContent) > 100) {
        showToast('固体含量必须在0-100%之间', 'warning');
        document.getElementById('product-solid-content').focus();
        return;
    }
    
    if (parseFloat(productDensity) <= 0) {
        showToast('比重必须大于0', 'warning');
        document.getElementById('product-density').focus();
        return;
    }
    
    // 创建产品对象
    const product = {
        id: productId,
        name: productName,
        brand: productBrand,
        type: productType,
        color: productColor,
        filmThickness: productFilmThickness ? parseFloat(productFilmThickness) : null,
        solidContent: productSolidContent ? parseFloat(productSolidContent) : null,
        density: productDensity ? parseFloat(productDensity) : null,
        coatCount: productCoatCount ? parseInt(productCoatCount) : null,
        applicationMethod: productApplicationMethod,
        theoreticalCoverageL: productTheoreticalCoverageL ? parseFloat(productTheoreticalCoverageL) : null,
        theoreticalCoverageKg: productTheoreticalCoverageKg ? parseFloat(productTheoreticalCoverageKg) : null,
        lossFactor: productLossFactor ? parseFloat(productLossFactor) : null,
        actualCoverageL: productActualCoverageL ? parseFloat(productActualCoverageL) : null,
        actualCoverageKg: productActualCoverageKg ? parseFloat(productActualCoverageKg) : null,
        pricePerL: productPricePerL ? parseFloat(productPricePerL) : null,
        pricePerKg: productPricePerKg ? parseFloat(productPricePerKg) : null,
        pricePerSqm: productPricePerSqm ? parseFloat(productPricePerSqm) : null,
        notes: productNotes,
        updateDate: new Date().toISOString().split('T')[0]
    };
    
    // 获取数据库
    const db = getDatabase();
    
    // 检查是新增还是编辑
    const existingIndex = db.products.findIndex(p => p.id === productId);
    
    if (existingIndex >= 0) {
        // 更新现有产品
        db.products[existingIndex] = product;
        showToast('产品已更新', 'success');
    } else {
        // 添加新产品
        db.products.push(product);
        showToast('产品已添加', 'success');
    }
    
    // 保存数据库
    saveDatabase(db);
    
    // 重置表单
    resetForm();
    
    // 返回数据库页面
    document.querySelector('[data-page="database"]').click();
    
    // 刷新产品列表
    refreshProductList();
}

/**
 * 重置表单
 */
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-title').textContent = '添加新产品';
    editingProductId = null;
}

/**
 * 编辑产品
 * @param {string} productId 产品ID
 */
function editProduct(productId) {
    // 获取数据库
    const db = getDatabase();
    
    // 查找产品
    const product = db.products.find(p => p.id === productId);
    
    if (!product) {
        showToast('未找到产品', 'error');
        return;
    }
    
    // 设置表单标题
    document.getElementById('form-title').textContent = '编辑产品';
    
    // 填充表单
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name || '';
    document.getElementById('product-brand').value = product.brand || '';
    document.getElementById('product-type').value = product.type || '';
    document.getElementById('product-color').value = product.color || '';
    document.getElementById('product-film-thickness').value = product.filmThickness || '';
    document.getElementById('product-solid-content').value = product.solidContent || '';
    document.getElementById('product-density').value = product.density || '';
    document.getElementById('product-coat-count').value = product.coatCount || '';
    document.getElementById('product-application-method').value = product.applicationMethod || '';
    document.getElementById('product-theoretical-coverage-l').value = product.theoreticalCoverageL || '';
    document.getElementById('product-theoretical-coverage-kg').value = product.theoreticalCoverageKg || '';
    document.getElementById('product-loss-factor').value = product.lossFactor || '';
    document.getElementById('product-actual-coverage-l').value = product.actualCoverageL || '';
    document.getElementById('product-actual-coverage-kg').value = product.actualCoverageKg || '';
    document.getElementById('product-price-per-l').value = product.pricePerL || '';
    document.getElementById('product-price-per-kg').value = product.pricePerKg || '';
    document.getElementById('product-price-per-sqm').value = product.pricePerSqm || '';
    document.getElementById('product-notes').value = product.notes || '';
    
    // 保存当前编辑的产品ID
    editingProductId = productId;
    
    // 切换到添加产品页面
    document.querySelector('[data-page="add-product"]').click();
}

/**
 * 显示产品详情
 * @param {string} productId 产品ID
 */
function showProductDetail(productId) {
    // 获取数据库
    const db = getDatabase();
    
    // 查找产品
    const product = db.products.find(p => p.id === productId);
    
    if (!product) {
        showToast('未找到产品', 'error');
        return;
    }
    
    // 填充详情模态框
    document.getElementById('product-detail-title').textContent = `产品详情: ${product.name}`;
    document.getElementById('detail-name').textContent = product.name || '';
    document.getElementById('detail-brand').textContent = product.brand || '';
    document.getElementById('detail-type').textContent = product.type || '';
    document.getElementById('detail-color').textContent = product.color || '';
    document.getElementById('detail-film-thickness').textContent = product.filmThickness ? `${product.filmThickness} μm` : '';
    document.getElementById('detail-solid-content').textContent = product.solidContent ? `${product.solidContent} %` : '';
    document.getElementById('detail-density').textContent = product.density || '';
    document.getElementById('detail-coat-count').textContent = product.coatCount || '';
    document.getElementById('detail-application-method').textContent = product.applicationMethod || '';
    document.getElementById('detail-theoretical-coverage-l').textContent = product.theoreticalCoverageL ? `${product.theoreticalCoverageL} ㎡/L` : '';
    document.getElementById('detail-theoretical-coverage-kg').textContent = product.theoreticalCoverageKg ? `${product.theoreticalCoverageKg} ㎡/kg` : '';
    document.getElementById('detail-loss-factor').textContent = product.lossFactor || '';
    document.getElementById('detail-actual-coverage-l').textContent = product.actualCoverageL ? `${product.actualCoverageL} ㎡/L` : '';
    document.getElementById('detail-actual-coverage-kg').textContent = product.actualCoverageKg ? `${product.actualCoverageKg} ㎡/kg` : '';
    document.getElementById('detail-price-per-l').textContent = product.pricePerL ? `${product.pricePerL} 元/L` : '';
    document.getElementById('detail-price-per-kg').textContent = product.pricePerKg ? `${product.pricePerKg} 元/kg` : '';
    document.getElementById('detail-price-per-sqm').textContent = product.pricePerSqm ? `${product.pricePerSqm} 元/㎡` : '';
    document.getElementById('detail-notes').textContent = product.notes || '';
    document.getElementById('detail-update-date').textContent = product.updateDate || '';
    
    // 设置编辑按钮事件
    document.getElementById('detail-edit-btn').onclick = function() {
        // 关闭模态框
        bootstrap.Modal.getInstance(document.getElementById('product-detail-modal')).hide();
        // 编辑产品
        editProduct(productId);
    };
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('product-detail-modal'));
    modal.show();
}

/**
 * 显示删除确认对话框
 * @param {string} productId 产品ID
 */
function showDeleteConfirmation(productId) {
    // 获取数据库
    const db = getDatabase();
    
    // 查找产品
    const product = db.products.find(p => p.id === productId);
    
    if (!product) {
        showToast('未找到产品', 'error');
        return;
    }
    
    // 设置确认对话框内容
    document.getElementById('delete-product-name').textContent = product.name;
    
    // 设置确认按钮事件
    document.getElementById('confirm-delete-btn').onclick = function() {
        deleteProduct(productId);
        bootstrap.Modal.getInstance(document.getElementById('confirm-delete-modal')).hide();
    };
    
    // 显示确认对话框
    const modal = new bootstrap.Modal(document.getElementById('confirm-delete-modal'));
    modal.show();
}

/**
 * 删除产品
 * @param {string} productId 产品ID
 */
function deleteProduct(productId) {
    // 获取数据库
    const db = getDatabase();
    
    // 查找产品索引
    const productIndex = db.products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        showToast('未找到产品', 'error');
        return;
    }
    
    // 删除产品
    db.products.splice(productIndex, 1);
    
    // 保存数据库
    saveDatabase(db);
    
    // 刷新产品列表
    refreshProductList();
    
    // 显示提示
    showToast('产品已删除', 'success');
}

/**
 * 初始化排序功能
 */
function initSorting() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            const field = this.getAttribute('data-sort');
            
            // 切换排序方向
            if (currentSort.field === field) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'asc';
            }
            
            // 更新排序图标
            document.querySelectorAll('th[data-sort]').forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
            });
            
            this.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            
            // 刷新产品列表
            refreshProductList();
        });
    });
}

/**
 * 初始化搜索功能
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    // 搜索按钮点击事件
    searchButton.addEventListener('click', function() {
        searchTerm = searchInput.value.trim();
        currentPage = 1;
        refreshProductList();
    });
    
    // 搜索框回车事件
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTerm = searchInput.value.trim();
            currentPage = 1;
            refreshProductList();
        }
    });
    
    // 搜索框清空事件
    searchInput.addEventListener('input', function() {
        if (this.value.trim() === '' && searchTerm !== '') {
            searchTerm = '';
            currentPage = 1;
            refreshProductList();
        }
    });
}

/**
 * 初始化导入导出功能
 */
function initImportExport() {
    // 导出JSON按钮点击事件
    document.getElementById('export-json-btn').addEventListener('click', function() {
        exportDatabase('json');
    });
    
    // 导出CSV按钮点击事件
    document.getElementById('export-csv-btn').addEventListener('click', function() {
        exportDatabase('csv');
    });
    
    // 导入文件选择事件
    document.getElementById('import-file').addEventListener('change', function() {
        const importBtn = document.getElementById('import-btn');
        importBtn.disabled = !this.files.length;
    });
    
    // 导入按钮点击事件
    document.getElementById('import-btn').addEventListener('click', function() {
        const fileInput = document.getElementById('import-file');
        const replaceData = document.getElementById('replace-data').checked;
        
        if (!fileInput.files.length) {
            showToast('请选择文件', 'warning');
            return;
        }
        
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop().toLowerCase();
        
        if (fileExt === 'json') {
            importJsonFile(file, replaceData);
        } else if (fileExt === 'csv') {
            importCsvFile(file, replaceData);
        } else {
            showToast('不支持的文件格式，请选择JSON或CSV文件', 'error');
        }
    });
}

/**
 * 导出数据库
 * @param {string} format 导出格式 ('json' 或 'csv')
 */
function exportDatabase(format) {
    const db = getDatabase();
    
    if (db.products.length === 0) {
        showToast('数据库为空，无法导出', 'warning');
        return;
    }
    
    let content, filename, mimeType;
    
    if (format === 'json') {
        content = JSON.stringify(db, null, 2);
        filename = `工业油漆数据库_${formatDate(new Date())}.json`;
        mimeType = 'application/json';
    } else if (format === 'csv') {
        content = convertToCSV(db.products);
        filename = `工业油漆数据库_${formatDate(new Date())}.csv`;
        mimeType = 'text/csv;charset=utf-8';
    } else {
        showToast('不支持的导出格式', 'error');
        return;
    }
    
    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
    
    showToast(`数据已导出为${format.toUpperCase()}文件`, 'success');
}

/**
 * 导入JSON文件
 * @param {File} file JSON文件
 * @param {boolean} replaceData 是否替换现有数据
 */
function importJsonFile(file, replaceData) {
    const reader = new FileReader();
    
    // 显示进度条
    const progressContainer = document.getElementById('import-progress-container');
    const progressBar = document.getElementById('import-progress-bar');
    const statusText = document.getElementById('import-status');
    
    progressContainer.classList.remove('d-none');
    progressBar.style.width = '0%';
    statusText.textContent = '正在读取文件...';
    
    reader.onload = function(e) {
        try {
            progressBar.style.width = '50%';
            statusText.textContent = '正在解析数据...';
            
            const importedData = JSON.parse(e.target.result);
            
            // 验证导入的数据结构
            if (!importedData.products || !Array.isArray(importedData.products)) {
                throw new Error('无效的数据格式，缺少products数组');
            }
            
            // 获取当前数据库
            const db = getDatabase();
            
            // 更新数据库
            if (replaceData) {
                db.products = importedData.products;
            } else {
                // 合并产品，避免重复
                const existingIds = new Set(db.products.map(p => p.id));
                
                importedData.products.forEach(product => {
                    if (!existingIds.has(product.id)) {
                        db.products.push(product);
                        existingIds.add(product.id);
                    }
                });
            }
            
            // 保存数据库
            saveDatabase(db);
            
            // 更新进度
            progressBar.style.width = '100%';
            statusText.textContent = `导入完成，共${importedData.products.length}条记录`;
            
            // 刷新产品列表
            refreshProductList();
            
            // 显示提示
            showToast(`成功导入${importedData.products.length}条记录`, 'success');
            
            // 重置文件输入
            document.getElementById('import-file').value = '';
            document.getElementById('import-btn').disabled = true;
            
        } catch (error) {
            progressBar.style.width = '100%';
            statusText.textContent = `导入失败: ${error.message}`;
            showToast(`导入失败: ${error.message}`, 'error');
        }
    };
    
    reader.onerror = function() {
        progressBar.style.width = '100%';
        statusText.textContent = '读取文件失败';
        showToast('读取文件失败', 'error');
    };
    
    reader.readAsText(file);
}

/**
 * 导入CSV文件
 * @param {File} file CSV文件
 * @param {boolean} replaceData 是否替换现有数据
 */
function importCsvFile(file, replaceData) {
    const reader = new FileReader();
    
    // 显示进度条
    const progressContainer = document.getElementById('import-progress-container');
    const progressBar = document.getElementById('import-progress-bar');
    const statusText = document.getElementById('import-status');
    
    progressContainer.classList.remove('d-none');
    progressBar.style.width = '0%';
    statusText.textContent = '正在读取文件...';
    
    reader.onload = function(e) {
        try {
            progressBar.style.width = '30%';
            statusText.textContent = '正在解析CSV数据...';
            
            const csvData = e.target.result;
            const products = parseCSV(csvData);
            
            progressBar.style.width = '60%';
            statusText.textContent = '正在处理数据...';
            
            // 获取当前数据库
            const db = getDatabase();
            
            // 更新数据库
            if (replaceData) {
                db.products = products;
            } else {
                // 合并产品，避免重复
                const existingIds = new Set(db.products.map(p => p.id));
                
                products.forEach(product => {
                    if (!product.id) {
                        product.id = generateId();
                    }
                    
                    if (!existingIds.has(product.id)) {
                        db.products.push(product);
                        existingIds.add(product.id);
                    }
                });
            }
            
            // 保存数据库
            saveDatabase(db);
            
            // 更新进度
            progressBar.style.width = '100%';
            statusText.textContent = `导入完成，共${products.length}条记录`;
            
            // 刷新产品列表
            refreshProductList();
            
            // 显示提示
            showToast(`成功导入${products.length}条记录`, 'success');
            
            // 重置文件输入
            document.getElementById('import-file').value = '';
            document.getElementById('import-btn').disabled = true;
            
        } catch (error) {
            progressBar.style.width = '100%';
            statusText.textContent = `导入失败: ${error.message}`;
            showToast(`导入失败: ${error.message}`, 'error');
        }
    };
    
    reader.onerror = function() {
        progressBar.style.width = '100%';
        statusText.textContent = '读取文件失败';
        showToast('读取文件失败', 'error');
    };
    
    reader.readAsText(file);
}

/**
 * 初始化示例数据下载
 */
function initSampleData() {
    // 下载JSON示例按钮点击事件
    document.getElementById('download-json-sample').addEventListener('click', function() {
        downloadSampleData('json');
    });
    
    // 下载CSV示例按钮点击事件
    document.getElementById('download-csv-sample').addEventListener('click', function() {
        downloadSampleData('csv');
    });
}

/**
 * 下载示例数据
 * @param {string} format 格式 ('json' 或 'csv')
 */
function downloadSampleData(format) {
    // 示例数据
    const sampleProducts = [
        {
            id: 'sample1',
            name: '环氧树脂封闭底漆',
            brand: '品牌A',
            type: '底漆',
            color: '灰色',
            filmThickness: 50,
            solidContent: 50,
            density: 1.2,
            coatCount: 1,
            applicationMethod: '无气喷涂',
            theoreticalCoverageL: 10,
            theoreticalCoverageKg: 8.33,
            lossFactor: 3,
            actualCoverageL: 3.33,
            actualCoverageKg: 2.78,
            pricePerL: 25.2,
            pricePerKg: 21,
            pricePerSqm: 7.57,
            notes: '适用于钢结构',
            updateDate: '2025-05-20'
        },
        {
            id: 'sample2',
            name: '环氧树脂中间漆',
            brand: '品牌B',
            type: '中间漆',
            color: '灰色',
            filmThickness: 260,
            solidContent: 80,
            density: 1.6,
            coatCount: 1,
            applicationMethod: '无气喷涂',
            theoreticalCoverageL: 5.6,
            theoreticalCoverageKg: 3.5,
            lossFactor: 3,
            actualCoverageL: 1.87,
            actualCoverageKg: 1.17,
            pricePerL: 40,
            pricePerKg: 25,
            pricePerSqm: 21.39,
            notes: '耐腐蚀性强',
            updateDate: '2025-05-20'
        },
        {
            id: 'sample3',
            name: '聚氨酯面漆',
            brand: '品牌C',
            type: '面漆',
            color: '白色',
            filmThickness: 90,
            solidContent: 61,
            density: 1.4,
            coatCount: 1,
            applicationMethod: '无气喷涂',
            theoreticalCoverageL: 7.6,
            theoreticalCoverageKg: 5.43,
            lossFactor: 3,
            actualCoverageL: 2.53,
            actualCoverageKg: 1.81,
            pricePerL: 49,
            pricePerKg: 35,
            pricePerSqm: 19.37,
            notes: '耐候性好',
            updateDate: '2025-05-20'
        }
    ];
    
    let content, filename, mimeType;
    
    if (format === 'json') {
        const sampleData = {
            products: sampleProducts,
            lastUpdated: new Date().toISOString(),
            version: '1.0'
        };
        content = JSON.stringify(sampleData, null, 2);
        filename = `工业油漆数据库_示例.json`;
        mimeType = 'application/json';
    } else if (format === 'csv') {
        content = convertToCSV(sampleProducts);
        filename = `工业油漆数据库_示例.csv`;
        mimeType = 'text/csv;charset=utf-8';
    } else {
        showToast('不支持的格式', 'error');
        return;
    }
    
    // 创建下载链接
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(function() {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}

/**
 * 将产品数组转换为CSV字符串
 * @param {Array} products 产品数组
 * @returns {string} CSV字符串
 */
function convertToCSV(products) {
    if (products.length === 0) {
        return '';
    }
    
    // CSV标题行
    const headers = [
        'id', '产品名称', '品牌', '类型', '颜色', '干膜厚度(μm)', 
        '固体含量(%)', '比重', '涂刷道数', '施工方式', 
        '理论材料耗量(㎡/L)', '理论材料耗量(㎡/kg)', 
        '损耗系数', '实际材料耗量(㎡/L)', '实际材料耗量(㎡/kg)', 
        '单位价格(元/L)', '单位价格(元/kg)', '单位价格(元/㎡)', 
        '备注', '更新日期'
    ];
    
    // 字段映射
    const fields = [
        'id', 'name', 'brand', 'type', 'color', 'filmThickness', 
        'solidContent', 'density', 'coatCount', 'applicationMethod', 
        'theoreticalCoverageL', 'theoreticalCoverageKg', 
        'lossFactor', 'actualCoverageL', 'actualCoverageKg', 
        'pricePerL', 'pricePerKg', 'pricePerSqm', 
        'notes', 'updateDate'
    ];
    
    // 生成CSV内容
    let csv = headers.join(',') + '\n';
    
    products.forEach(product => {
        const row = fields.map(field => {
            const value = product[field];
            
            // 处理空值
            if (value === null || value === undefined || value === '') {
                return '';
            }
            
            // 处理包含逗号、引号或换行符的字符串
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            
            return value;
        });
        
        csv += row.join(',') + '\n';
    });
    
    return csv;
}

/**
 * 解析CSV字符串为产品数组
 * @param {string} csv CSV字符串
 * @returns {Array} 产品数组
 */
function parseCSV(csv) {
    // 分割行
    const lines = csv.split(/\r\n|\n/);
    
    // 至少需要标题行和一行数据
    if (lines.length < 2) {
        throw new Error('CSV文件格式不正确，至少需要标题行和一行数据');
    }
    
    // 解析标题行
    const headers = parseCSVLine(lines[0]);
    
    // 字段映射（CSV标题 -> 对象属性）
    const fieldMap = {
        'id': 'id',
        '产品名称': 'name',
        '品牌': 'brand',
        '类型': 'type',
        '颜色': 'color',
        '干膜厚度(μm)': 'filmThickness',
        '固体含量(%)': 'solidContent',
        '比重': 'density',
        '涂刷道数': 'coatCount',
        '施工方式': 'applicationMethod',
        '理论材料耗量(㎡/L)': 'theoreticalCoverageL',
        '理论材料耗量(㎡/kg)': 'theoreticalCoverageKg',
        '损耗系数': 'lossFactor',
        '实际材料耗量(㎡/L)': 'actualCoverageL',
        '实际材料耗量(㎡/kg)': 'actualCoverageKg',
        '单位价格(元/L)': 'pricePerL',
        '单位价格(元/kg)': 'pricePerKg',
        '单位价格(元/㎡)': 'pricePerSqm',
        '备注': 'notes',
        '更新日期': 'updateDate'
    };
    
    // 解析数据行
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // 跳过空行
        if (!line) {
            continue;
        }
        
        const values = parseCSVLine(line);
        
        // 检查值的数量是否与标题数量匹配
        if (values.length !== headers.length) {
            throw new Error(`第${i+1}行的值数量与标题数量不匹配`);
        }
        
        // 创建产品对象
        const product = {};
        
        headers.forEach((header, index) => {
            const field = fieldMap[header] || header;
            let value = values[index];
            
            // 转换数值类型
            if (['filmThickness', 'solidContent', 'density', 'coatCount', 
                 'theoreticalCoverageL', 'theoreticalCoverageKg', 'lossFactor', 
                 'actualCoverageL', 'actualCoverageKg', 'pricePerL', 
                 'pricePerKg', 'pricePerSqm'].includes(field)) {
                value = value ? parseFloat(value) : null;
            }
            
            product[field] = value;
        });
        
        // 确保产品有ID
        if (!product.id) {
            product.id = generateId();
        }
        
        products.push(product);
    }
    
    return products;
}

/**
 * 解析CSV行
 * @param {string} line CSV行
 * @returns {Array} 值数组
 */
function parseCSVLine(line) {
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
            // 检查是否为转义的引号 ("")
            if (i + 1 < line.length && line[i + 1] === '"') {
                currentValue += '"';
                i += 2;
            } else {
                // 切换引号状态
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // 逗号分隔符（不在引号内）
            values.push(currentValue);
            currentValue = '';
            i++;
        } else {
            // 普通字符
            currentValue += char;
            i++;
        }
    }
    
    // 添加最后一个值
    values.push(currentValue);
    
    return values;
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * 格式化日期为YYYY-MM-DD
 * @param {Date} date 日期对象
 * @returns {string} 格式化的日期字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 显示提示消息
 * @param {string} message 消息内容
 * @param {string} type 消息类型 ('success', 'error', 'warning', 'info')
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    
    // 创建toast元素
    const toastEl = document.createElement('div');
    toastEl.className = `toast toast-${type} show`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // 设置toast内容
    toastEl.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${escapeHtml(message)}
        </div>
    `;
    
    // 添加到容器
    toastContainer.appendChild(toastEl);
    
    // 添加关闭按钮事件
    toastEl.querySelector('.btn-close').addEventListener('click', function() {
        toastEl.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toastEl);
        }, 150);
    });
    
    // 自动关闭
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toastEl)) {
                toastContainer.removeChild(toastEl);
            }
        }, 150);
    }, 5000);
}

/**
 * 转义HTML特殊字符
 * @param {string} text 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    if (!text) return '';
    
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
