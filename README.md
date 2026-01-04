# Work Order Manager

A simple, mobile-friendly web application for managing work orders. Store and track work orders received from your manager, update their status, and keep everything organized in one place.

## Features

- ✅ Add new work orders with order number, description, and date
- 📝 Edit existing work orders
- 🗑️ Delete work orders with confirmation
- 🔍 Filter work orders by status (All, Pending, In Progress, Completed)
- 📱 Mobile-optimized responsive design
- 💾 Data stored locally in your browser (localStorage)
- 🎨 Color-coded status indicators for quick visual recognition

## Technology

- Pure HTML, CSS, and JavaScript (no frameworks or dependencies)
- localStorage for data persistence
- Mobile-first responsive design
- Works offline (after first load)

## Getting Started

### Local Use

1. Download all files to a folder on your computer
2. Open `index.html` in a web browser
3. Start adding work orders!

### Deployment to GitHub Pages (Free Hosting)

1. **Create a GitHub account** (if you don't have one)
   - Go to [github.com](https://github.com) and sign up

2. **Create a new repository**
   - Click the "+" icon in the top right
   - Select "New repository"
   - Name it (e.g., "work-order-manager")
   - Choose "Public" (required for free GitHub Pages)
   - Do NOT initialize with README
   - Click "Create repository"

3. **Upload files to GitHub**
   
   **Option A: Using GitHub Web Interface**
   - In your new repository, click "uploading an existing file"
   - Drag and drop all four files: `index.html`, `styles.css`, `script.js`, and `README.md`
   - Click "Commit changes"

   **Option B: Using Git (if you have it installed)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" tab
   - Scroll down to "Pages" section (left sidebar)
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"
   - Wait a few minutes for GitHub to deploy

5. **Access your app**
   - Your app will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`
   - Example: `https://johndoe.github.io/work-order-manager/`
   - You can bookmark this URL on your Android phone

## Usage

### Adding a Work Order

1. Fill in the "Order Number" (required)
2. Enter a "Description" (required)
3. Select or confirm the "Date Received"
4. Choose a "Status" (defaults to Pending)
5. Click "Add Work Order"

### Editing a Work Order

1. Click the "Edit" button on any work order card
2. Modify the details in the popup form
3. Click "Save Changes"

### Changing Status

- Edit the work order and change the status dropdown, OR
- Use the filter buttons to view orders by status

### Deleting a Work Order

1. Click the "Delete" button on any work order card
2. Confirm the deletion

### Filtering Work Orders

Use the filter buttons at the top:
- **All**: Show all work orders
- **Pending**: Show only pending orders
- **In Progress**: Show only in-progress orders
- **Completed**: Show only completed orders

## Data Storage

All work orders are stored in your browser's localStorage. This means:
- ✅ Data persists between browser sessions
- ✅ No server or database required
- ⚠️ Data is specific to each device/browser
- ⚠️ Clearing browser data will delete your work orders
- ⚠️ Data is not synced across devices

## Status Types

- **Pending**: Work order received but not started (Yellow/Orange badge)
- **In Progress**: Work order is currently being worked on (Blue badge)
- **Completed**: Work order is finished (Green badge)

## Browser Compatibility

Works on all modern browsers including:
- Chrome (Android and desktop)
- Firefox
- Safari (iOS and desktop)
- Edge

## Notes

- This app uses localStorage, so your data is stored locally in your browser
- If you clear your browser data, your work orders will be lost
- To backup your data, you can export it (future feature) or take screenshots
- The app works offline after the first load

## License

Free to use and modify for personal use.

## Support

For issues or questions:
1. Check that you're using a modern web browser
2. Ensure JavaScript is enabled
3. Try clearing your browser cache and reloading

---

**Enjoy managing your work orders!** 📋✨
