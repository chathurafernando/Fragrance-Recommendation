// // AddBusinessEntry.jsx
// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { Button, Stack } from "react-bootstrap";

// const AddBusinessEntry = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="p-4">
//       <Stack direction="horizontal" gap={3}>
//         <Button variant="primary" onClick={() => navigate("/admin/add-business-form")}>
//           Add Business
//         </Button>
//         <Button variant="success" onClick={() => navigate("/admin/add-vendor-form")}>
//           Add Vendor
//         </Button>
//       </Stack>
//     </div>
//   );
// };

// export default AddBusinessEntry;
import React from "react";
import { Tabs, Tab, Stack, Button } from "react-bootstrap";
import BusinessInfoTable from "./BusinessInfoTable";
import VendorInfoTable from "./VendorInfoTable";
import { useNavigate } from "react-router-dom";

const AddBusinessEntry = ({ businesses, vendors, handleEditBusiness, handleDeleteBusiness, handleEditVendor, handleDeleteVendor }) => {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <Stack direction="horizontal" gap={3} className="mb-3">
        <Button variant="primary" onClick={() => navigate("/admin/add-business-form")}>
          Add Business
        </Button>
        <Button variant="success" onClick={() => navigate("/admin/add-vendor-form")}>
          Add Vendor
        </Button>
      </Stack>

      <Tabs defaultActiveKey="business" id="entry-tabs" className="mb-3">
        <Tab eventKey="business" title="Business Info">
          <BusinessInfoTable
            businesses={businesses}
            handleEditBusiness={handleEditBusiness}
            handleDeleteBusiness={handleDeleteBusiness}
          />
        </Tab>
        <Tab eventKey="vendor" title="Vendor Info">
          <VendorInfoTable
            vendors={vendors}
            handleEditVendor={handleEditVendor}
            handleDeleteVendor={handleDeleteVendor}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default AddBusinessEntry;
