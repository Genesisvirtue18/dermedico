import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const ShippingRefundPolicy = () => {
  return (
   <>
   <Navbar />

    <div className="max-w-4xl poppins-regular mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">SHIPPING & REFUND POLICY</h1>

      <h2 className="text-xl font-semibold mb-2">SHIPPING POLICY</h2>
      <p className="mb-4">
        At Dermedico, every product is thoughtfully made to cater to our customers’ needs.
        Orders are usually processed and dispatched within 3–4 business days of purchase. We
        ensure that each item passes quality checks before leaving our facility.
      </p>
      <p className="mb-4">
        For Cash on Delivery (COD) orders, an additional charge of ₹90 can be applied.
      </p>
      <p className="mb-8">
        Once your order is placed, you’ll receive tracking details and timely updates on the
        status of your shipment until it reaches you.
      </p>

      <h2 className="text-xl font-semibold mb-2">RETURN POLICY</h2>
      <p className="mb-4">
        We take pride in our quality standards and packaging, ensuring your products arrive
        safely and in excellent condition. Each item is thoroughly inspected prior to
        dispatch, and our delivery partners are carefully chosen to maintain reliability.
      </p>
      <p className="mb-4">
        In the rare case that you receive a damaged or defective item, please inform us
        within 3 days of delivery, and we will arrange a replacement of the same or an
        equivalent product.
      </p>
      <p className="mb-4">
        As our products are naturally formulated, minor differences in texture, fragrance,
        or color are to be expected. These variations are normal and do not compromise
        product performance.
      </p>
      <p className="mb-4">
        While we strive to present our products as accurately as possible online, actual
        shades and appearances may vary slightly depending on screen settings.
      </p>
      <p>For any queries or assistance, our team is always ready to help.</p>
    </div>
   <Footer />
   </>
  );
};

export default ShippingRefundPolicy;
