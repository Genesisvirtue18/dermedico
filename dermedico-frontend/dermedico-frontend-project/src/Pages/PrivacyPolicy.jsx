import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const PrivacyPolicy = () => {
  return (
 <>
 <Navbar />

    <div className="max-w-4xl poppins-regular mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-2xl font-bold text-center mb-8">PRIVACY POLICY</h1>

      <h2 className="text-xl font-semibold mb-2">WHO WE ARE</h2>
      <p className="mb-4">
        At Dermedico, we bring together the purity of nature and the science of skincare to
        create products that nurture, protect, and enhance your natural beauty. To us,
        skincare is more than a routine—it’s a ritual of self-care. We are committed not
        only to your skin but also to respecting and protecting your privacy.
      </p>

      <h2 className="text-xl font-semibold mb-2">COMMENTS</h2>
      <p className="mb-4">
        When visitors share comments on our site, we collect the information provided in the
        comment form, along with the visitor’s IP address and browser details. This helps us
        with spam detection and maintaining a safe community.
      </p>

      <h2 className="text-xl font-semibold mb-2">MEDIA</h2>
      <p className="mb-4">
        If you choose to upload images to our site, please ensure that location data (EXIF
        GPS) is removed. Other visitors may be able to download and extract location details
        from images shared publicly.
      </p>

      <h2 className="text-xl font-semibold mb-2">COOKIES</h2>
      <p className="mb-4">
        We use cookies to improve your browsing experience. Cookies may store login details,
        display preferences, and temporary session data. These expire automatically after a
        set duration or when you log out.
      </p>

      <h2 className="text-xl font-semibold mb-2">WHO WE SHARE YOUR DATA WITH</h2>
      <p className="mb-4">
        If you request a password reset, your IP address will be included in the reset email
        for security purposes.
      </p>

      <h2 className="text-xl font-semibold mb-2">HOW LONG WE RETAIN YOUR DATA</h2>
      <p className="mb-4">
        Comments and their metadata are stored indefinitely to help us auto-approve future
        contributions. Registered users can view, update, or delete their information at any
        time (except their username).
      </p>

      <h2 className="text-xl font-semibold mb-2">YOUR DATA RIGHTS</h2>
      <p className="mb-4">
        You may request an exported copy of your personal data or ask us to erase it,
        excluding data we are legally required to retain.
      </p>

      <h2 className="text-xl font-semibold mb-2">WHERE YOUR DATA IS SENT</h2>
      <p>
        Visitor comments may be scanned by an automated spam detection system to protect the
        community.
      </p>
    </div>
 <Footer />
 </>
  );
};

export default PrivacyPolicy;
