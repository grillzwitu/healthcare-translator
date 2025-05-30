/**
 * The main entry point for the application.
 * Renders the DualPanelChat component, which provides the chat interface
 * for both Patient and Provider roles.
 * 
 * This file is marked as a Client Component using the "use client" directive,
 * enabling the use of React hooks and client-side interactivity.
 */

"use client";
import DualPanelChat from "@/components/DualPanelChat";
import PrivacyNotice from "@/components/PrivacyNotice";

/**
 * Home page component.
 * @returns The DualPanelChat interface for the healthcare translator app.
 */
export default function Home() {
  // Render the main chat interface
  return (
    <>
      <PrivacyNotice />
      <DualPanelChat />
    </>
  );
}
