# AutoSaaz Admin Dashboard

A modern React-based admin dashboard for the AutoSaaz platform, built with JSX, Tailwind CSS, and React Router.

## Features

- **Authentication System**: Secure login with mock authentication
- **Dashboard Overview**: Key metrics and recent activity display
- **User Management**: View, search, and filter platform users
- **Garage Management**: Manage garage listings with ratings and services
- **Order Management**: Track and update order statuses
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Modern UI**: Clean design with Lucide React icons

## Technologies Used

- **React 18** - Frontend framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **PostCSS** - CSS processing
- **Create React App** - Build tooling

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AutoSaaz-Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port shown in the terminal)

### Demo Login

Use these credentials to access the admin dashboard:
- **Email**: admin@autosaaz.com
- **Password**: admin123

## Available Scripts

### `npm start`
Runs the app in development mode. The page will reload when you make changes.

### `npm run build`
Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── Layout.js      # Main layout wrapper
│       ├── Header.js      # Top navigation header
│       └── Sidebar.js     # Left navigation sidebar
├── context/
│   └── AuthContext.js     # Authentication state management
├── pages/
│   ├── DashboardPage.js   # Dashboard overview
│   ├── LoginPage.js       # Authentication page
│   ├── UserManagementPage.js
│   ├── GarageManagementPage.js
│   └── OrderManagementPage.js
├── services/
│   └── apiService.js      # API service layer
├── App.js                 # Main app component
└── index.js              # App entry point
```

## Key Features

### Dashboard
- Overview of key metrics (users, garages, orders, revenue)
- Growth indicators with trend arrows
- Recent orders table
- Responsive grid layout

### User Management
- Searchable user list
- Role-based filtering (Customer, Garage Owner)
- Status indicators (Active, Inactive)
- User details display

### Garage Management
- Card-based garage display
- Star rating system
- Service tags
- Status management
- Location information

### Order Management
- Comprehensive order tracking
- Status update functionality
- Revenue calculations
- Advanced filtering and search

### Authentication
- Mock authentication system
- Protected routes
- Persistent login state
- Clean logout functionality

## Customization

### Adding New Pages
1. Create a new component in `src/pages/`
2. Add routing in `App.js`
3. Update navigation in `Sidebar.js`

### Styling
The project uses Tailwind CSS with a custom color palette. Main colors:
- Primary: Orange/amber theme
- Status colors: Green (success), Yellow (warning), Red (error), Blue (info)

### API Integration
Replace the mock data in `apiService.js` with actual API endpoints. The service layer is already structured for easy integration.

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

## Build and Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Serve the build folder with any static file server:
   ```bash
   npx serve -s build
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@autosaaz.com or open an issue on GitHub.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
