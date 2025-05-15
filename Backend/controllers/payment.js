import crypto from 'crypto';

const merchant_id = "1230432";
const merchant_secret = "MjE1NjgyODIwMjE1ODA2MzYyMTAyOTkxODkxOTI4MTM5MzU2NDU2";

export const startPayment = (req, res) => {
  const { order_id, amount, currency } = req.body;
  console.log("Payment request for order:", order_id);

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

export const handleNotification = (req, res) => {
  console.log("Payment notification received");

  const {
    merchant_id: req_merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  const local_md5sig = crypto
    .createHash("md5")
    .update(
      req_merchant_id +
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

  if (local_md5sig === md5sig && status_code === "2") {
    console.log("Payment successful for order:", order_id);
    res.sendStatus(200);
  } else {
    console.log("Payment verification failed for order:", order_id);
    res.sendStatus(400);
  }
};
