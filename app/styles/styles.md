# Styles Component Documentation

## Overview
The `Styles` component is a **Next.js client component** used for displaying a table of **fashion styles** fetched from the backend API. It provides **search, filter, sorting, Excel download, and admin-only actions** like delete and screen status display.  

This component integrates **PRO-SCREEN and PP-SCREEN statuses** using Lucide icons to indicate **Done ✅** or **Pending 🕒**.

---

## Features

### 1. Data Fetching
- Fetches styles from the API endpoint:  
  ```
  GET ${process.env.NEXT_PUBLIC_API_BASE_URL}/styles
  ```
- Uses **JWT token** from `localStorage` for authentication.
- Handles errors with **react-toastify** notifications.

---

### 2. Search & Filters
- **Search by style name**.
- **Filters by:**  
  - Buyer  
  - Season  
  - Fabrication  
  - Factory Name  
  - Status
- Filter logic handles:
  - Matching nested array fields (`productionRecords.factory_name`)  
  - Case-insensitive and whitespace-insensitive comparison.
- Filters are **cleared** using `Clear Filters` button.

---

### 3. Excel Download
- Dynamically flattens nested objects using `flattenObject` helper.
- Maps database field names to **user-friendly headers** (`headerMap`).
- Generates downloadable Excel file using `xlsx` library.

---

### 4. Table Display
- Columns include:  
  - SL  
  - Buyer  
  - Season  
  - Style  
  - Fabrication  
  - Versions  
  - Status (color-coded badges)  
  - Factory Names  
  - Screen Status (PRO/PP) → **admin only**  
  - Actions (View/Delete)
- **Sorting:** By `SAMPLING_STAGES` and `added_at` date.

---

### 5. Status Badge
- `getStatusBadge(status)` generates **colored badges** for each stage:  
  ```js
  inquiry: gray
  testing: yellow
  fit: blue
  pp: green
  rpp: pink
  pro: purple
  ```

---

### 6. PRO-SCREEN & PP-SCREEN Logic

#### 6.1 PRO-SCREEN
- Checks for:
  1. `productionRecords` array exists and **all `factory_name`s are filled**.
  2. `prints` > 0
  3. `PRO-SCREEN.date` exists.
- Status display:
  ```jsx
  Done ✅  → green color + <Check />
  Pending 🕒 → orange color + <Clock />
  ```
- Only displays if `PRO-SCREEN` field exists.

#### 6.2 PP-SCREEN
- Checks for:
  1. `PP.date` exists
  2. `PP-SCREEN.date` exists
- Status display same as PRO-SCREEN.
- Only displays if `PP` field exists.

#### 6.3 Combined Display
- Both statuses shown in **single table cell** (`td`), one below the other.
- If `prints <= 0`, displays `-n/a`.

```jsx
{userInfo?.role === "admin" && (
  <td className="px-6 py-4 whitespace-nowrap text-sm">
    {(() => {
      const printsValue = isNaN(parseInt(item.prints)) ? 0 : parseInt(item.prints);

      if (printsValue <= 0) return <div className="text-gray-500 italic">-n/a</div>;

      let proScreenElement = null;
      if (item["PRO-SCREEN"]) {
        const hasFactories =
          Array.isArray(item?.productionRecords) &&
          item?.productionRecords.length > 0 &&
          item?.productionRecords.every(record => !!record.factory_name);
        const hasProScreenDate = !!item["PRO-SCREEN"]?.date;
        const proScreenDone = hasFactories && printsValue > 0 && hasProScreenDate;

        proScreenElement = (
          <div className={`font-medium ${proScreenDone ? "text-green-600" : "text-orange-600"} flex items-center gap-1`}>
            {proScreenDone ? <Check size={16} /> : <Clock size={16} />}
            PRO-SCREEN
          </div>
        );
      }

      let ppScreenElement = null;
      if (item.PP) {
        const hasPPDate = !!item?.PP?.date;
        const hasPPScreenDate = !!item["PP-SCREEN"]?.date;
        const ppScreenDone = hasPPDate && hasPPScreenDate;

        ppScreenElement = (
          <div className={`font-medium ${ppScreenDone ? "text-green-600" : "text-orange-600"} flex items-center gap-1`}>
            {ppScreenDone ? <Check size={16} /> : <Clock size={16} />}
            PP-SCREEN
          </div>
        );
      }

      if (!proScreenElement && !ppScreenElement) {
        return <div className="text-gray-500 italic">-n/a</div>;
      }

      return (
        <div className="flex flex-col gap-1">
          {proScreenElement}
          {ppScreenElement}
        </div>
      );
    })()}
  </td>
)}
```

---

### 7. Actions
- **View:** Navigates to `/styles/[id]`  
- **Delete:** Admin only → Opens `Modal` for confirmation.

---

### 8. Loading State
- Animated placeholder using Tailwind's `animate-pulse`.

---

### 9. Utilities
- **flattenObject:** Flatten nested objects for Excel export.
- **getStyleStatus:** Determine current stage dynamically using `SAMPLING_STAGES`.
- **sortByStatusAndDate:** Sort table rows by stage and creation date.

---

### 10. Dependencies
- React 18+
- Next.js 14+
- axios
- react-toastify
- lucide-react
- xlsx
- Tailwind CSS
- AuthContext (`useAuth`)

---

### 11. Notes / Best Practices
- Always check `prints` field before showing PRO/PP statuses.
- `productionRecords` may contain multiple factories; logic validates all for PRO-SCREEN.
- Only display PP-SCREEN if `PP` exists.
- Admin-only features controlled by `userInfo.role === "admin"`.