const express = require("express");
const axios = require("axios");
const router = express.Router();

const generateAccessToken = async () => {
  const clientId = 'AQ2DyWK8hB66bbRbWK5gc61IxetlZF5dK55Q69jCjNSuRN9JBTTGsvzLJLrEuCbIg_e3if3DLxzRD8id';
  const clientSecret = 'EA3wZ1YBH-B-3oIThA0Yxd0ZOCjxcaWS2_K8a3aYFw7TLBtZlV_MVt0bhMH1pkVzFoF3csSBUVcHGSpO';

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await axios.post(
    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data.access_token;
};

router.post("/paypal/capture", verifyToken, async (req, res) => {
  const { orderId, payerId, ticketId, userId } = req.body;

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);

    if (response.result.status === "COMPLETED") {
      await Ticket.findByIdAndUpdate(ticketId, {
        status: "sold",
        bookedBy: userId,
      });
    }

    res.status(200).json({
      message: " Payment captured successfully",
      orderStatus: response.result.status,
    });
  } catch (error) {
    console.error(" capturePayPalOrder Error:", error);
    res.status(500).json({ message: "Failed to capture PayPal payment", error });
  }
});

module.exports = router;