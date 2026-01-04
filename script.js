// Data management
const STORAGE_KEY = 'workOrders';
const ORDER_NUMBER_KEY = 'workOrderCounter';

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
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Save work orders to localStorage
function saveWorkOrders(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

// Get next order number (starts from 0001, increments)
function getNextOrderNumber() {
    let counter = parseInt(localStorage.getItem(ORDER_NUMBER_KEY)) || 0;
    counter++;
    localStorage.setItem(ORDER_NUMBER_KEY, counter.toString());
    // Format as 4-digit number with leading zeros (0001, 0002, etc.)
    return counter.toString().padStart(4, '0');
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
    saveWorkOrders(orders);

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
        saveWorkOrders(orders);

        // Close modal
        document.getElementById('editModal').style.display = 'none';

        // Refresh display
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        displayWorkOrders(activeFilter);
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
        saveWorkOrders(filteredOrders);

        // Refresh display
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');
        displayWorkOrders(activeFilter);
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

// Make functions globally available for inline onclick handlers
window.editWorkOrder = editWorkOrder;
window.deleteWorkOrder = deleteWorkOrder;
