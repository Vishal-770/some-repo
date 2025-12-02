import Navbar from "@/src/components/Navbar";
import React from "react";

const PublicPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default PublicPageLayout;
