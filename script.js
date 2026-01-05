// Data management
const STORAGE_KEY = 'workOrders';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateReceived').value = today;

    // Load and display work orders
    displayWorkOrders();

    // Form submission handlers
    document.getElementById('workOrderForm').addEventListener('submit', handleAddWorkOrder);
    document.getElementById('editForm').addEventListener('submit', handleEditWorkOrder);

    // Search input handler
    document.getElementById('searchInput').addEventListener('input', function() {
        const activeBtn = document.querySelector('.filter-btn.active');
        const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        displayWorkOrders(filter);
    });

    // Filter button handlers
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter orders
            const filter = this.getAttribute('data-filter');
            displayWorkOrders(filter);
        });
    });

    // Modal handlers
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelEdit');

    closeBtn.onclick = function() { modal.style.display = 'none'; };
    cancelBtn.onclick = function() { modal.style.display = 'none'; };
    window.onclick = function(event) {
        if (event.target == modal) { modal.style.display = 'none'; }
    };
});

// Get all work orders from localStorage
function getWorkOrders() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error reading work orders:', error);
        return [];
    }
}

// Save work orders to localStorage
function saveWorkOrders(orders) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error('Error saving work orders:', error);
        showToast('Error saving work order.', 'error');
        return false;
    }
}

// Get next order number
function getNextOrderNumber() {
    try {
        const orders = getWorkOrders();
        let maxOrderNumber = 0;
        orders.forEach(order => {
            const orderNum = parseInt(order.orderNumber);
            if (!isNaN(orderNum) && orderNum > maxOrderNumber) {
                maxOrderNumber = orderNum;
            }
        });
        maxOrderNumber++;
        return maxOrderNumber.toString().padStart(4, '0');
    } catch (error) {
        return Date.now().toString().slice(-4);
    }
}

// Update dashboard statistics
function updateStats() {
    const orders = getWorkOrders();
    const counts = { Pending: 0, 'In Progress': 0, Completed: 0 };
    orders.forEach(order => {
        if (counts.hasOwnProperty(order.status)) { counts[order.status]++; }
    });
    document.getElementById('countPending').textContent = counts.Pending;
    document.getElementById('countInProgress').textContent = counts['In Progress'];
    document.getElementById('countCompleted').textContent = counts.Completed;
}

// Handle add work order
function handleAddWorkOrder(e) {
    e.preventDefault();

    const orderNumber = getNextOrderNumber();
    const description = document.getElementById('description').value.trim();
    const dateReceived = document.getElementById('dateReceived').value;
    const status = document.getElementById('status').value;
    const priority = document.getElementById('priority').value;

    if (!description) {
        showToast('Please fill in the description field.', 'error');
        return;
    }

    const newOrder = {
        id: Date.now().toString(),
        orderNumber: orderNumber,
        description: description,
        dateReceived: dateReceived,
        status: status,
        priority: priority,
        lastUpdated: new Date().toISOString()
    };

    const orders = getWorkOrders();
    orders.push(newOrder);
    
    if (saveWorkOrders(orders)) {
        document.getElementById('workOrderForm').reset();
        document.getElementById('dateReceived').value = new Date().toISOString().split('T')[0];
        document.getElementById('priority').value = 'Medium';
        
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        displayWorkOrders(activeFilter);
        showToast('Work order created successfully!', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Handle edit work order
function handleEditWorkOrder(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const description = document.getElementById('editDescription').value.trim();
    const dateReceived = document.getElementById('editDateReceived').value;
    const status = document.getElementById('editStatus').value;
    const priority = document.getElementById('editPriority').value;

    if (!description) {
        showToast('Description is required.', 'error');
        return;
    }

    const orders = getWorkOrders();
    const index = orders.findIndex(order => order.id === id);

    if (index !== -1) {
        orders[index] = {
            ...orders[index],
            description: description,
            dateReceived: dateReceived,
            status: status,
            priority: priority,
            lastUpdated: new Date().toISOString()
        };
        
        if (saveWorkOrders(orders)) {
            document.getElementById('editModal').style.display = 'none';
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            displayWorkOrders(activeFilter);
            showToast('Work order updated!', 'success');
        }
    }
}

// Display work orders with filters and search
function displayWorkOrders(filter = 'all') {
    updateStats();

    const orders = getWorkOrders();
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyState');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    // Filter orders
    let filteredOrders = orders.filter(order => {
        const statusMatch = filter === 'all' || order.status === filter;
        const searchMatch = !searchTerm || 
                            order.description.toLowerCase().includes(searchTerm) || 
                            order.orderNumber.toLowerCase().includes(searchTerm);
        return statusMatch && searchMatch;
    });

    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived));

    ordersList.innerHTML = '';

    if (filteredOrders.length === 0) {
        emptyState.style.display = 'block';
        if (searchTerm) {
            emptyState.innerHTML = `<p>No orders found matching "${escapeHtml(searchTerm)}"</p>`;
        } else {
            emptyState.innerHTML = `<p>No work orders found. Add your first work order above.</p>`;
        }
    } else {
        emptyState.style.display = 'none';
        filteredOrders.forEach(order => {
            const orderCard = createOrderCard(order);
            ordersList.appendChild(orderCard);
        });
    }
}

// Create order card element
function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.setAttribute('data-order-id', order.id);

    const statusClass = order.status.toLowerCase().replace(' ', '-');
    const priority = order.priority || 'Medium';
    const priorityClass = priority.toLowerCase();
    const formattedDate = formatDate(order.dateReceived);

    card.innerHTML = `
        <div class="order-header">
            <div class="order-number">${escapeHtml(order.orderNumber)}</div>
            <div>
                <span class="priority-badge priority-${priorityClass}">${escapeHtml(priority)}</span>
                <span class="status-badge status-${statusClass}">${escapeHtml(order.status)}</span>
            </div>
        </div>
        <div class="order-details">
            <p><strong>Description:</strong> ${escapeHtml(order.description)}</p>
            <p class="order-date"><strong>Date Received:</strong> ${formattedDate}</p>
        </div>
        <div class="order-actions">
            <button class="btn btn-edit" onclick="editWorkOrder('${order.id}')">Edit</button>
            <button class="btn btn-export-pdf" onclick="exportToPDF('${order.id}')">Save as PDF</button>
            <button class="btn btn-export-img" onclick="exportToImage('${order.id}')">Save as Image</button>
            <button class="btn btn-delete" onclick="deleteWorkOrder('${order.id}')">Delete</button>
        </div>
    `;

    return card;
}

// Edit work order
function editWorkOrder(id) {
    const orders = getWorkOrders();
    const order = orders.find(o => o.id === id);

    if (order) {
        document.getElementById('editId').value = order.id;
        document.getElementById('editOrderNumber').value = order.orderNumber;
        document.getElementById('editDescription').value = order.description;
        document.getElementById('editDateReceived').value = order.dateReceived;
        document.getElementById('editStatus').value = order.status;
        document.getElementById('editPriority').value = order.priority || 'Medium';

        const modal = document.getElementById('editModal');
        modal.style.display = 'block';
    }
}

// Delete work order
function deleteWorkOrder(id) {
    if (confirm('Are you sure you want to delete this work order?')) {
        const orders = getWorkOrders();
        const filteredOrders = orders.filter(order => order.id !== id);
        
        if (saveWorkOrders(filteredOrders)) {
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            displayWorkOrders(activeFilter);
            showToast('Work order deleted.', 'info');
        }
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

// Escape HTML
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Toast Notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    requestAnimationFrame(() => { toast.classList.add('show'); });

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (container.contains(toast)) { container.removeChild(toast); }
        }, 300);
    }, 3000);
}

// Backup & Restore
function downloadBackup() {
    const orders = localStorage.getItem(STORAGE_KEY);
    if (!orders || orders === '[]') {
        showToast('No data to backup.', 'error');
        return;
    }
    const blob = new Blob([orders], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `work_orders_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully.', 'success');
}

function importBackup(input) {
    const file = input.files[0];
    if (!file) return;
    if (!confirm('WARNING: This will overwrite all current work orders. Are you sure?')) {
        input.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) throw new Error('Invalid data format');
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            displayWorkOrders();
            showToast('Data restored successfully!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            showToast('Error restoring data. Invalid file.', 'error');
        }
        input.value = '';
    };
    reader.readAsText(file);
}

// Export functions
function exportToPDF(orderId) {
    const orders = getWorkOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    const statusClass = order.status.toLowerCase().replace(' ', '-');
    const formattedDate = formatDate(order.dateReceived);
    const priority = order.priority || 'Medium';
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Work Order ${escapeHtml(order.orderNumber)}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { color: #2c3e50; margin: 0; }
                .info-row { display: flex; margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #eee; }
                .info-label { font-weight: bold; width: 150px; color: #555; }
                .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 600; text-transform: uppercase; }
                .status-pending { background-color: #fff3cd; color: #856404; }
                .status-in-progress { background-color: #cfe2ff; color: #084298; }
                .status-completed { background-color: #d1e7dd; color: #0f5132; }
                .description { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; margin-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header"><h1>Work Order #${escapeHtml(order.orderNumber)}</h1></div>
            <div class="order-info">
                <div class="info-row"><div class="info-label">Order Number:</div><div class="info-value">${escapeHtml(order.orderNumber)}</div></div>
                <div class="info-row"><div class="info-label">Status:</div><div class="info-value"><span class="status-badge status-${statusClass}">${escapeHtml(order.status)}</span></div></div>
                <div class="info-row"><div class="info-label">Priority:</div><div class="info-value">${escapeHtml(priority)}</div></div>
                <div class="info-row"><div class="info-label">Date Received:</div><div class="info-value">${formattedDate}</div></div>
            </div>
            <div class="description">${escapeHtml(order.description).replace(/\n/g, '<br>')}</div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
}

function exportToImage(orderId) {
    if (typeof html2canvas === 'undefined') {
        showToast('Image export library is loading. Please try again.', 'info');
        return;
    }
    
    const orders = getWorkOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const targetCard = document.querySelector(`.order-card[data-order-id="${orderId}"]`);
    if (!targetCard) {
        showToast('Could not find work order card.', 'error');
        return;
    }
    
    const clonedCard = targetCard.cloneNode(true);
    if (clonedCard.querySelector('.order-actions')) clonedCard.querySelector('.order-actions').remove();
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = targetCard.offsetWidth + 'px';
    tempContainer.style.backgroundColor = '#fff';
    tempContainer.style.padding = '20px';
    tempContainer.appendChild(clonedCard);
    document.body.appendChild(tempContainer);
    
    html2canvas(clonedCard, { backgroundColor: '#ffffff', scale: 2, logging: false }).then(canvas => {
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Work_Order_${order.orderNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('Image downloaded!', 'success');
        }, 'image/png');
        document.body.removeChild(tempContainer);
    }).catch(error => {
        console.error('Error exporting image:', error);
        showToast('Error exporting image.', 'error');
        if (document.body.contains(tempContainer)) { document.body.removeChild(tempContainer); }
    });
}

// Global exports
window.editWorkOrder = editWorkOrder;
window.deleteWorkOrder = deleteWorkOrder;
window.exportToPDF = exportToPDF;
window.exportToImage = exportToImage;
window.downloadBackup = downloadBackup;
window.importBackup = importBackup;
