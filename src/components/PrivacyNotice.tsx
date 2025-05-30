import { useState, useEffect } from "react";

/**
 * PrivacyNotice component displays a privacy and consent notice modal.
 * Users must accept before using the app.
 */
export default function PrivacyNotice() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    // Check if user has already accepted
    if (typeof window !== "undefined") {
      setAccepted(localStorage.getItem("privacyAccepted") === "yes");
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("privacyAccepted", "yes");
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h2 className="text-xl font-bold mb-2">Privacy & Consent Notice</h2>
        <p className="mb-4 text-sm">
          This application is intended for demonstration purposes only. Do not enter real patient-identifiable information.
          <br /><br />
          All data you enter is processed for translation and correction using Azure OpenAI services. No data is stored after your session ends.
          <br /><br />
          By clicking "Accept", you acknowledge and consent to this processing.
        </p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
}