import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const TermsAndConditions = () => {
  return (
   <>
<Navbar />
    <div className="max-w-4xl poppins-regular mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">TERMS & CONDITION</h1>
      <p className="uppercase text-sm mb-8">
        PLEASE READ THE FOLLOWING TERMS & CONDITIONS VERY CAREFULLY AS YOUR USE OF SERVICE
        IS SUBJECT TO YOUR ACCEPTANCE OF AND COMPLIANCE WITH THE FOLLOWING TERMS AND
        CONDITIONS (“TERMS”). Dermedico RESERVES THE RIGHT TO MAKE CHANGES TO THIS WEBSITE,
        THE POLICIES, AND THESE TERMS AND CONDITIONS AT ANY POINT IN TIME. YOU WILL BE
        SUBJECT TO THE TERMS AND CONDITIONS IN FORCE AT THE TIME.
      </p>

      <h2 className="text-xl font-semibold mb-2">Privacy:</h2>
      <p className="mb-4">
        We view the protection of your privacy as a very important principle. We understand
        clearly that you and your personal information is one of the most important. We
        store and process your information on our computers that may be protected by
        physical as well as procedural safeguards as per IT ACT 2000.
      </p>

      <h2 className="text-xl font-semibold mb-2">Important Note:</h2>
      <p>
        We provide doorstep service for our product, nationally. No packing charges are
        there for any order. We will ensure that your product reaches you with full safety,
        giving a major focus on packing. If you have any issues regarding the product,
        please contact us.
      </p>
    </div>
   <Footer />
   </>
  );
};

export default TermsAndConditions;
