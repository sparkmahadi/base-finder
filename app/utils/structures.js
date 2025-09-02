import { useCallback } from "react";

  // Define editable fields
  export const editableFields = [
    { key: 'sample_date', label: 'Sample Date', type: 'date', isDate: true },
    { key: 'buyer', label: 'Buyer', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'style', label: 'Style', type: 'text' },
    { key: 'no_of_sample', label: 'Number of Samples', type: 'number' },
    { key: 'shelf', label: 'Shelf', type: 'text' },
    { key: 'division', label: 'Division', type: 'text' },
    { key: 'position', label: 'Position', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'season', label: 'Season', type: 'text' },
    { key: 'comments', label: 'Comments', type: 'textarea' },
    { key: 'availability', label: 'Availability', type: 'text' },
  ];


// Define non-editable fields
  export const nonEditableFields = [
    { key: 'added_by', label: 'Added By' },
    { key: 'added_at', label: 'Added At', isDate: true },
    { key: 'released', label: 'Released', isDate: true },
    { key: 'last_taken_at', label: 'Last Taken At', isDate: true },
    { key: 'last_taken_by', label: 'Last Taken By' },
  ];

  export const tableHeadings = [
    { label: "SL" },
    { label: "Sample Date", key: "sample_date" },
    { label: "Buyer", key: "buyer" },
    { label: "Category", key: "category" },
    { label: "Style", key: "style" },
    { label: "Shelf", key: "shelf" },
    { label: "Division", key: "division" },
    { label: "Position", key: "position" },
    { label: "Availability", key: "availability" },
    { label: "Status", key: "status" },
    { label: "Added by", key: "added_by" },
    { label: "Actions" },
  ];

  export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  export const getAuthHeaders = useCallback(() => {
      const token = localStorage.getItem("token");
      return { Authorization: `Bearer ${token}` };
    }, []);