/*global payhere*/
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Alert, Spinner } from "react-bootstrap";

const VendorBannerPayment = () => {
  const [businessInfo, setBusinessInfo] = useState(null);
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        // Get user info from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          throw new Error("User not logged in");
        }

        const user = JSON.parse(userStr);
        if (!user?.id) {
          throw new Error("Invalid user data");
        }

        // Get advertisement payment info from localStorage
        const adPaymentStr = localStorage.getItem("ad_payment_info");
        if (!adPaymentStr) {
          throw new Error("Advertisement payment info not found");
        }

        const adPayment = JSON.parse(adPaymentStr);
        if (!adPayment?.advertisementId || !adPayment?.price) {
          throw new Error("Invalid advertisement data");
        }

        setAdvertisement(adPayment);

        // Fetch business info
        const response = await axios.get(`/business/${user.id}`);
        if (!response.data) {
          throw new Error("Business info not found");
        }

        setBusinessInfo(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBusinessInfo();
  }, []);

  useEffect(() => {
    if (businessInfo && advertisement && !loading) {
      handlePayment();
    }
  }, [businessInfo, advertisement, loading]);

  const handlePayment = async () => {
    if (!businessInfo || !advertisement) return;

    const paymentDetails = {
      order_id: `Ad-${advertisement.advertisementId}`,
      amount: Number(advertisement.price).toFixed(2),
      currency: "LKR",
      first_name: businessInfo.companyName?.split(" ")[0] || "Business",
      last_name: businessInfo.companyName?.split(" ")[1] || "Owner",
      email: businessInfo.email || "business@example.com",
      phone: businessInfo.phoneOffice || "0770000000",
      address: businessInfo.address || "No.1, Business Street",
      city: businessInfo.city || "Colombo",
      country: businessInfo.country || "Sri Lanka",
    };

    try {
      const response = await fetch("/payment/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentDetails),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to initialize payment");
      }

      const { hash, merchant_id } = await response.json();

      // if (typeof window.payhere === "undefined") {
      //   throw new Error("Payment gateway not loaded");
      // }

      const payment = {
        sandbox: true, // Set to false for production
        merchant_id: merchant_id,
        return_url: "/payment/success",
        cancel_url: "/payment/cancel",
        notify_url: "http://localhost:8803/api/payment/notify",
        order_id: paymentDetails.order_id,
        items: "Advertisement Banner",
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
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Clear existing data to force refetch
    setBusinessInfo(null);
    setAdvertisement(null);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <h4 className="mt-3">Preparing your payment...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">
          <Alert.Heading>Payment Error</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button
              onClick={handleRetry}
              className="btn btn-primary me-2"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Go Back
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="text-center mt-5">
      <h4>Redirecting to PayHere...</h4>
      <Spinner animation="border" variant="success" className="mt-3" />
    </div>
  );
};

export default VendorBannerPayment;