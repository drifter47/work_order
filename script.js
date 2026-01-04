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

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    cancelBtn.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
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
        alert('Error saving work order. Please check your browser settings.');
        return false;
    }
}

// Get next order number (starts from 0001, increments based on existing orders)
function getNextOrderNumber() {
    try {
        const orders = getWorkOrders();
        let maxOrderNumber = 0;
        
        // Find the highest order number from existing orders
        orders.forEach(order => {
            const orderNum = parseInt(order.orderNumber);
            if (!isNaN(orderNum) && orderNum > maxOrderNumber) {
                maxOrderNumber = orderNum;
            }
        });
        
        // Increment from the highest existing order number
        maxOrderNumber++;
        
        // Format as 4-digit number with leading zeros (0001, 0002, etc.)
        return maxOrderNumber.toString().padStart(4, '0');
    } catch (error) {
        console.error('Error getting next order number:', error);
        // Fallback: use timestamp as order number if localStorage fails
        return Date.now().toString().slice(-4);
    }
}

// Handle add work order form submission
function handleAddWorkOrder(e) {
    e.preventDefault();

    const orderNumber = getNextOrderNumber();
    const description = document.getElementById('description').value.trim();
    const dateReceived = document.getElementById('dateReceived').value;
    const status = document.getElementById('status').value;

    if (!description) {
        alert('Please fill in the description field.');
        return;
    }

    const newOrder = {
        id: Date.now().toString(),
        orderNumber: orderNumber,
        description: description,
        dateReceived: dateReceived,
        status: status,
        lastUpdated: new Date().toISOString()
    };

    const orders = getWorkOrders();
    orders.push(newOrder);
    
    if (saveWorkOrders(orders)) {
        // Reset form
        document.getElementById('workOrderForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dateReceived').value = today;

        // Refresh display
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        displayWorkOrders(activeFilter);

        // Scroll to top to see the new order
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Handle edit work order form submission
function handleEditWorkOrder(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const description = document.getElementById('editDescription').value.trim();
    const dateReceived = document.getElementById('editDateReceived').value;
    const status = document.getElementById('editStatus').value;

    if (!description) {
        alert('Please fill in the description field.');
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
            lastUpdated: new Date().toISOString()
        };
        
        if (saveWorkOrders(orders)) {
            // Close modal
            document.getElementById('editModal').style.display = 'none';

            // Refresh display
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            displayWorkOrders(activeFilter);
        }
    }
}

// Display work orders
function displayWorkOrders(filter = 'all') {
    const orders = getWorkOrders();
    const ordersList = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyState');

    // Filter orders
    let filteredOrders = orders;
    if (filter !== 'all') {
        filteredOrders = orders.filter(order => order.status === filter);
    }

    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.dateReceived) - new Date(a.dateReceived));

    // Clear existing content
    ordersList.innerHTML = '';

    if (filteredOrders.length === 0) {
        emptyState.style.display = 'block';
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
    const formattedDate = formatDate(order.dateReceived);

    card.innerHTML = `
        <div class="order-header">
            <div class="order-number">${escapeHtml(order.orderNumber)}</div>
            <span class="status-badge status-${statusClass}">${escapeHtml(order.status)}</span>
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
            // Refresh display
            const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
            displayWorkOrders(activeFilter);
        }
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Export work order to PDF
function exportToPDF(orderId) {
    const orders = getWorkOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Create a printable version of the work order
    const printWindow = window.open('', '_blank');
    const statusClass = order.status.toLowerCase().replace(' ', '-');
    const formattedDate = formatDate(order.dateReceived);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Work Order ${escapeHtml(order.orderNumber)}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    border-bottom: 3px solid #2c3e50;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                }
                .order-info {
                    margin-bottom: 30px;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 15px;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                }
                .info-label {
                    font-weight: bold;
                    width: 150px;
                    color: #555;
                }
                .info-value {
                    flex: 1;
                    color: #333;
                }
                .status-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-pending {
                    background-color: #fff3cd;
                    color: #856404;
                }
                .status-in-progress {
                    background-color: #cfe2ff;
                    color: #084298;
                }
                .status-completed {
                    background-color: #d1e7dd;
                    color: #0f5132;
                }
                .description {
                    background-color: #f8f9fa;
                    padding: 15px;
                    border-left: 4px solid #3498db;
                    margin-top: 10px;
                }
                @media print {
                    body { padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Work Order #${escapeHtml(order.orderNumber)}</h1>
            </div>
            <div class="order-info">
                <div class="info-row">
                    <div class="info-label">Order Number:</div>
                    <div class="info-value">${escapeHtml(order.orderNumber)}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value">
                        <span class="status-badge status-${statusClass}">${escapeHtml(order.status)}</span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date Received:</div>
                    <div class="info-value">${formattedDate}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Description:</div>
                    <div class="info-value"></div>
                </div>
            </div>
            <div class="description">
                ${escapeHtml(order.description).replace(/\n/g, '<br>')}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load, then print
    setTimeout(() => {
        printWindow.print();
    }, 250);
}

// Export work order to image (JPEG/PNG)
function exportToImage(orderId) {
    // Check if html2canvas is loaded
    if (typeof html2canvas === 'undefined') {
        alert('Image export library is loading. Please try again in a moment.');
        return;
    }
    
    const orders = getWorkOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Find the card element
    const targetCard = document.querySelector(`.order-card[data-order-id="${orderId}"]`);
    
    if (!targetCard) {
        alert('Could not find work order card.');
        return;
    }
    
    // Clone the card to avoid modifying the original
    const clonedCard = targetCard.cloneNode(true);
    
    // Remove action buttons from clone
    const actionButtons = clonedCard.querySelector('.order-actions');
    if (actionButtons) {
        actionButtons.remove();
    }
    
    // Create temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = targetCard.offsetWidth + 'px';
    tempContainer.style.backgroundColor = '#fff';
    tempContainer.style.padding = '20px';
    tempContainer.appendChild(clonedCard);
    document.body.appendChild(tempContainer);
    
    // Convert to canvas
    html2canvas(clonedCard, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
    }).then(canvas => {
        // Create download link
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Work_Order_${order.orderNumber}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 'image/png');
        
        // Clean up
        document.body.removeChild(tempContainer);
    }).catch(error => {
        console.error('Error exporting image:', error);
        alert('Error exporting image. Please try again.');
        if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
        }
    });
}

// Make functions globally available for inline onclick handlers
window.editWorkOrder = editWorkOrder;
window.deleteWorkOrder = deleteWorkOrder;
window.exportToPDF = exportToPDF;
window.exportToImage = exportToImage;
