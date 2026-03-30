import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const CancellationPolicy = () => {
  return (
  <>
  <Navbar />
    <div className="max-w-4xl poppins-regular  mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">CANCELLATION POLICY</h1>
      <p className="mb-4">
        Orders can only be cancelled if they haven’t been dispatched yet. To request a
        cancellation, please drop us an email at{" "}
        <a href="mailto:customercare.Dermedico@gmail.com" className="text-blue-600 underline">
          customercare.Dermedico@gmail.com
        </a>.
      </p>
      <p className="mb-4">
        Once your request is confirmed, we’ll process your refund within 7 working days.
      </p>
      <p className="mb-8">
        Kindly note: orders that have already been shipped cannot be cancelled.
      </p>

      <h2 className="text-xl font-semibold mb-4">ORDERS & SHIPPING</h2>
      <p className="mb-4">
        When you place an order, you’ll receive an email acknowledging it. A second email
        will follow once your items are dispatched — this also serves as confirmation of
        acceptance.
      </p>
      <p className="mb-4">
        Please note that items in your order may be shipped separately depending on
        availability. Every product is carefully inspected and securely packed before being
        handed over to our reliable courier partners.
      </p>
      <p className="mb-4">
        Our delivery partners will make every effort to get your package to you on time. If
        there’s any issue with the address or delivery time, they will reach out directly to
        coordinate.
      </p>
      <p className="mb-6">
        Most orders are shipped within 2 business days (excluding Sundays & public holidays).
      </p>
      <ul className="list-disc ml-6 space-y-2">
        <li>Free shipping on all orders ₹499 & above.</li>
        <li>Shipping fee: ₹90 for orders below ₹499.</li>
        <li>COD fee: Additional ₹90 applies to all cash-on-delivery orders.</li>
      </ul>
    </div>

    <Footer />
  </>
  );
};

export default CancellationPolicy;
