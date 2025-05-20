// import crypto from 'crypto';

// const merchant_id = "1230464";
// const merchant_secret = "MTc4MDMyMjIwNDI1ODE1Nzc5MjAxODkxMTA4MTM5NDE4MTQ1MjE0OQ==";

// export const startPayment = (req, res) => {
//    const { order_id, amount, currency } = req.body;
//   console.log("Payment request for order:", order_id);
  

//   // Generate the hash value
//   const hash = crypto
//     .createHash("md5")
//     .update(
//       merchant_id +
//         order_id +
//         amount +
//         currency +
//         crypto
//           .createHash("md5")
//           .update(merchant_secret)
//           .digest("hex")
//           .toUpperCase()
//     )
//     .digest("hex")
//     .toUpperCase();

//     console.log("Hash generated for order:", order_id);
    

//   res.json({ hash, merchant_id });
// };

// export const handleNotification = (req, res) => {
//   console.log("Payment notification received",req);
  
  
//   const {
//     merchant_id,
//     order_id,
//     payhere_amount,
//     payhere_currency,
//     status_code,
//     md5sig,
//   } = req.body;

//   const local_md5sig = crypto
//     .createHash("md5")
//     .update(
//       merchant_id +
//         order_id +
//         payhere_amount +
//         payhere_currency +
//         status_code +
//         crypto
//           .createHash("md5")
//           .update(merchant_secret)
//           .digest("hex")
//           .toUpperCase()
//     )
//     .digest("hex")
//     .toUpperCase();

//     console.log("Payment notification for order:", order_id);


    

//   if (local_md5sig === md5sig && status_code == "2") {
//     // Payment success - update the database
//     console.log("Payment successful for order:", order_id);
//     res.sendStatus(200);
//   } else {
//     // Payment verification failed
//     console.log("Payment verification failed for order:", order_id);
//     res.sendStatus(400);
//   }
// };


import crypto from 'crypto';
import bodyParser from 'body-parser';
import { Advertisement } from '../models/Advertisement.js';

const merchant_id = "1230464";
const merchant_secret = "MTc4MDMyMjIwNDI1ODE1Nzc5MjAxODkxMTA4MTM5NDE4MTQ1MjE0OQ==";

export const startPayment = (req, res) => {
   const { order_id, amount, currency } = req.body;
   console.log("Payment request for order:", order_id);
  
   // Generate the hash value
   const hash = crypto
     .createHash("md5")
     .update(
       merchant_id +
         order_id +
         amount +
         currency +
         crypto
           .createHash("md5")
           .update(merchant_secret)
           .digest("hex")
           .toUpperCase()
     )
     .digest("hex")
     .toUpperCase();

    console.log("Hash generated for order:", order_id);
    
   res.json({ hash, merchant_id });
};

// export const handleNotification = (req, res) => {
//   console.log("Payment notification received - body:", req.body);
  
//   const {
//     merchant_id,
//     order_id,
//     payhere_amount,
//     payhere_currency,
//     status_code,
//     md5sig,
//   } = req.body;

//   // Handle case when body is empty
//   if (!order_id) {
//     console.log("Payment notification received but order_id is missing");
//     return res.sendStatus(400);
//   }

//   const local_md5sig = crypto
//     .createHash("md5")
//     .update(
//       merchant_id +
//         order_id +
//         payhere_amount +
//         payhere_currency +
//         status_code +
//         crypto
//           .createHash("md5")
//           .update(merchant_secret)
//           .digest("hex")
//           .toUpperCase()
//     )
//     .digest("hex")
//     .toUpperCase();

//   console.log("Payment notification for order:", order_id);
//   console.log("Status code:", status_code);
//   console.log("Expected MD5:", local_md5sig);
//   console.log("Received MD5:", md5sig);

//   if (local_md5sig === md5sig && status_code == "2") {
//     // Payment success - update the database
//     console.log("Payment successful for order:", order_id);
//     res.sendStatus(200);
//   } else {
//     // Payment verification failed
//     console.log("Payment verification failed for order:", order_id);
//     res.sendStatus(400);
//   }
// };

export const handleNotification = async (req, res) => {
  console.log("Payment notification received - body:", req.body);
  
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  // Handle case when body is empty
  if (!order_id) {
    console.log("Payment notification received but order_id is missing");
    return res.sendStatus(400);
  }

  const local_md5sig = crypto
    .createHash("md5")
    .update(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        crypto
          .createHash("md5")
          .update(merchant_secret)
          .digest("hex")
          .toUpperCase()
    )
    .digest("hex")
    .toUpperCase();

  console.log("Payment notification for order:", order_id);
  console.log("Status code:", status_code);
  console.log("Expected MD5:", local_md5sig);
  console.log("Received MD5:", md5sig);

  try {
    // Find the advertisement by order_id
    const advertisement = await Advertisement.findByPk(order_id);
    
    if (!advertisement) {
      console.log("Advertisement not found for order:", order_id);
      return res.sendStatus(404);
    }

    // Update the payment status regardless of success/failure
    await advertisement.update({ payment_status: parseInt(status_code) });

    if (local_md5sig === md5sig && status_code == "2") {
      // Payment success - update the advertisement
      console.log("Payment successful for order:", order_id);
      
      // Set advertisement as published
      await advertisement.update({ is_published: true });
      
      res.sendStatus(200);
    } else {
      // Payment verification failed or not successful
      console.log("Payment verification failed or unsuccessful for order:", order_id);
      console.log("Payment status code:", status_code);
      
      // Make sure it's not published
      await advertisement.update({ is_published: false });
      
      res.sendStatus(200); // Still return 200 to acknowledge receipt
    }
  } catch (error) {
    console.error("Error updating advertisement status:", error);
    res.sendStatus(500);
  }
};