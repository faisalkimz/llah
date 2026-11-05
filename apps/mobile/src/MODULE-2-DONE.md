# Module 2 — Customers

## Files created
- `src/api/customers.js` — getCustomers, getCustomer, createCustomer, updateCustomer
- `src/components/ui/SearchBar.jsx`
- `src/components/ui/SectionCard.jsx`
- `src/components/ui/DetailRow.jsx`
- `src/screens/app/customers/CustomersScreen.jsx`
- `src/screens/app/customers/CustomerDetailScreen.jsx`
- `src/screens/app/customers/CreateCustomerScreen.jsx`
- `src/screens/app/customers/EditCustomerScreen.jsx`
- `src/navigation/CustomersNavigator.jsx`

## Files modified
- `src/navigation/AppNavigator.jsx` — Customers tab now uses CustomersNavigator

## Navigation
CustomersNavigator uses `createNativeStackNavigator` from `@react-navigation/native-stack` (already installed).
NavigationContainer is provided by RootNavigator — no double-wrap.
Screens: Customers → CustomerDetail → CreateCustomer / EditCustomer.
All screens use `headerShown: false`; each screen renders its own custom header row.

## API
All calls use apiRequest from client.js with Bearer token and x-organization-id header.
The API wraps responses in `{ data: ... }` — client.js unwraps this, so screens receive the payload directly.
List endpoint returns `{ customers: [...], total: N }` — CustomersScreen handles both array and object shapes.
