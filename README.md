# Jean Test Mobile

## Description

Jean Test Mobile is a React Native application prototype designed for managing invoices. It connects to a REST API to list, create, and manage invoices.

## Features

### Core Features

1. **Invoice List**: View a list of invoices with details like customer name, total amount, and statuses (Paid, Finalized, Overdue).
2. **Create Invoice**: Add new invoices with customers, products, deadlines, and invoice lines.
3. **Manage Invoice**:
   - Edit invoice details and lines.
   - Finalize invoices (mark as completed and uneditable except for payment status).
   - Delete invoices.

### Advanced Features (Future Improvements)

- **Filtering and Sorting**: Add filters for customers, dates, and payment status.
- **Enhanced Navigation**: Improve user navigation through deep linking and better routing.
- **Offline Mode**: Cache invoice data for offline viewing and editing.
- **Analytics**: Include insights such as total revenue or outstanding payments.
- **Integration with External Systems**: Synchronize invoices with accounting software.

## Technology Stack

- **Framework**: React Native (v0.72.6)
- **State Management**: React Context API
- **API Client**: `openapi-client-axios`
- **Testing**: Jest and React Native Testing Library
- **Styling**: React Native Stylesheets

## Getting Started

### Prerequisites

- **Node.js**: >=16
- **Yarn**: Package manager
- **React Native CLI**: For running the app on emulators or devices

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:pennylane-hq/jean_test_mobile.git
   cd jean_test_mobile
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your `X-SESSION` token to the `.env` file.
3. Install dependencies:
   ```bash
   yarn install
   ```
4. Run the application:
   - iOS: `yarn ios`
   - Android: `yarn android`

## API Integration

### Overview

The application communicates with the Jean Test API available at `https://jean-test-api.herokuapp.com`. An OpenAPI definition for this API is provided and used to generate TypeScript types and an API client.

### API Resources

- **Customers**: List and search customers.
- **Products**: List and search products.
- **Invoices**: CRUD operations for invoices.
- **Invoice Lines**: Add, update, or delete invoice lines via their associated invoice.

### API Client Usage

The API client is integrated via a React Context and can be accessed with the `useApi` hook.

```tsx
import { useApi } from './api';

const MyComponent = () => {
  const apiClient = useApi();

  useEffect(() => {
    apiClient.getInvoices().then(res => {
      console.log(res.data);
    });
  }, [apiClient]);

  return null;
};
```

## Testing

The project includes a robust testing setup:

1. **Unit Tests**: Validate component functionality using Jest.
2. **Integration Tests**: Verify end-to-end workflows.

Run all tests with:
```bash
yarn test
```

## File Structure

### Key Directories

- **`src/components`**: Contains reusable UI components.
- **`src/screens`**: Screen components for navigation.
- **`src/services/invoices`**: API service hooks for invoices.
- **`src/api`**: API client setup.
- **`src/constants`**: Centralized constants for shared values.
- **`src/navigation`**: Navigation setup using React Navigation.
- **`src/utils`**: Utility functions for calculations and formatting.

### Important Files

- **`AppNavigator.tsx`**: Defines app navigation structure.
- **`InvoicesList.tsx`**: Lists all invoices.
- **`InvoiceDetailScreen.tsx`**: Displays detailed information for a single invoice.
- **`InvoiceModalCreate.tsx`**: Modal for creating invoices.
- **`InvoiceModalUpdate.tsx`**: Modal for editing invoices.
- **`DateTimePicker.tsx`**: Custom date picker component.
- **`StatusPills.tsx`**: Visual indicators for invoice statuses.
- **`Header.tsx`**: Custom header component.
