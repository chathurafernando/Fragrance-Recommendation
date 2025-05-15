// /*global payhere*/
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const VendorBannerPayment = () => {
//   const [businessInfo, setBusinessInfo] = useState(null);
// const [price, setPrice] = useState(null);

//   // Fetch business info on component mount
//   useEffect(() => {
//     const fetchBusinessInfo = async () => {
//       try {
//         const storedUser = JSON.parse(localStorage.getItem("user"));
//         const userId = storedUser?.id;

//         if (!userId) {
//           console.warn("User ID not found in localStorage.");
//           return;
//         }
//         // Fetch business info
//         const businessRes = await axios.get(`/business/${userId}`);
//         setBusinessInfo(businessRes.data);

//         // Fetch advertisement price
//         const priceRes = await axios.get(`/advertisement/price/${userId}`);
//         setPrice(priceRes.data.price); // ✅ store price

//       } catch (error) {
//         console.error("Error fetching business info:", error);
//       }
//     };

//     fetchBusinessInfo();
//   }, []);

//   const handlePayment = async () => {
//     if (!businessInfo) {
//       console.warn("Business information not available.");
//       return;
//     }

//     // Safe fallback mapping
//     const paymentDetails = {
//       order_id: "ItemNo12345",
//     amount: price.toFixed(2), // ✅ use dynamic price
//       currency: "LKR",
//       first_name: businessInfo.companyName?.split(" ")[0] || "Vendor",
//       last_name: businessInfo.companyName?.split(" ")[1] || "Business",
//       email: businessInfo.email?.trim() || "vendor@example.com",
//       phone: businessInfo.phoneOffice?.trim() || "0700000000",
//       address: businessInfo.address?.trim() || "No.1, Main Road",
//       city: businessInfo.city?.trim() || "Colombo",
//       country: businessInfo.country?.trim() || "Sri Lanka",
//     };

//     console.log("Prepared paymentDetails:", paymentDetails); // Debug

//     try {
//       const response = await fetch("/payment/start", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(paymentDetails),
//       });

//       if (response.ok) {
//         const { hash, merchant_id } = await response.json();

//         const payment = {
//           merchant_id: merchant_id,
//           return_url: "payment/success",
//           cancel_url: "payment/cancel",
//           notify_url: "/payment/notify",
//           order_id: paymentDetails.order_id,
//           items: "Item Title",
//           amount: paymentDetails.amount,
//           currency: paymentDetails.currency,
//           first_name: paymentDetails.first_name,
//           last_name: paymentDetails.last_name,
//           email: paymentDetails.email,
//           phone: paymentDetails.phone,
//           address: paymentDetails.address,
//           city: paymentDetails.city,
//           country: paymentDetails.country,
//           hash: hash,
//         };

//         console.log("Final PayHere payload:", payment); // Debug

//         payhere.startPayment(payment);
//       } else {
//         console.error("Failed to generate hash for payment.");
//       }
//     } catch (error) {
//       console.error("An error occurred while processing payment:", error);
//     }
//   };

//   return (
//     <div>
//       <button id="payhere-payment" onClick={handlePayment} disabled={!businessInfo}>
//         PayHere Pay
//       </button>
//     </div>
//   );
// };

// export default VendorBannerPayment;
/* global payhere */
import React, { useEffect, useState } from "react";
import axios from "axios";

const VendorBannerPayment = () => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [advertisement, setAdvertisement] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Get user info from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?.id) {
          console.warn("User not found in localStorage.");
          return;
        }

        // Get advertisement info from localStorage
        const storedAdStr = localStorage.getItem("ad_payment_info");
        const storedAd = storedAdStr ? JSON.parse(storedAdStr) : null;
        if (!storedAd?.advertisementId || !storedAd?.price) {
          console.warn("Advertisement not found in localStorage.");
          return;
        }
        setAdvertisement(storedAd);


        setAdvertisement(storedAd);

        // Fetch vendor's business info
        const res = await axios.get(`/business/${storedUser.id}`);
        setBusinessInfo(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDetails();
  }, []);

  useEffect(() => {
    if (businessInfo && advertisement) {
      handlePayment(); // Auto-trigger payment when data is ready
    }
  }, [businessInfo, advertisement]);

  const handlePayment = async () => {
    const paymentDetails = {
      order_id: `Ad-${advertisement.id}`,
      amount: Number(advertisement.price).toFixed(2),
      currency: "LKR",
      first_name: businessInfo.companyName?.split(" ")[0] || "Vendor",
      last_name: businessInfo.companyName?.split(" ")[1] || "Business",
      email: businessInfo.email || "vendor@example.com",
      phone: businessInfo.phoneOffice || "0700000000",
      address: businessInfo.address || "No.1, Main Road",
      city: businessInfo.city || "Colombo",
      country: businessInfo.country || "Sri Lanka",
      // adId: advertisement.id,
    };

    try {
      const response = await fetch("/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentDetails),
      });

      if (response.ok) {
        const { hash, merchant_id } = await response.json();

        const payment = {
          merchant_id,
          return_url: `/payment/success`,
          cancel_url: `/payment/cancel`,
          notify_url: `/payment/notify`,
          order_id: paymentDetails.order_id,
          items: "Advertisement Payment",
          amount: paymentDetails.amount,
          currency: paymentDetails.currency,
          first_name: paymentDetails.first_name,
          last_name: paymentDetails.last_name,
          email: paymentDetails.email,
          phone: paymentDetails.phone,
          address: paymentDetails.address,
          city: paymentDetails.city,
          country: paymentDetails.country,
          hash: hash,
        };

        payhere.startPayment(payment);
      } else {
        console.error("Payment start failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  return (
    <div className="text-center mt-5">
      <h4>Preparing your payment...</h4>
      {!businessInfo || !advertisement ? (
        <p>Loading advertisement details...</p>
      ) : (
        <p>Redirecting to PayHere...</p>
      )}
    </div>
  );
};

export default VendorBannerPayment;
