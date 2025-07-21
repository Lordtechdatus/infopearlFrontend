import React from "react";
import InvoiceListComponent from './InvoiceList';
import InvoiceDownloadComponent from './InvoiceDownload';

// Create a placeholder for InvoiceEdit
const InvoiceEdit = ({ match }) => {
  return (
    <div className="container mt-4">
      <h2>Edit Invoice</h2>
      <p>This feature is coming soon. Invoice ID: {match?.params?.id}</p>
    </div>
  );
};

// Create a placeholder for InvoiceView
const InvoiceView = ({ match }) => {
  return (
    <div className="container mt-4">
      <h2>View Invoice</h2>
      <p>This feature is coming soon. Invoice ID: {match?.params?.id}</p>
    </div>
  );
};

// Export the components
export const InvoiceList = InvoiceListComponent;
export const InvoiceDownload = InvoiceDownloadComponent;
export { InvoiceEdit, InvoiceView };
