import { createContext, useContext, useState } from "react";

const OrganizationContext = createContext<any>(null);

export const OrganizationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [organization] = useState({
    id: "org-123",
    name: "Tech Incubator",
    settings: {
      logoUrl: "/logo.png",
      primaryColor: "#4f46e5",
      paymentTerms: "Net 30",
    },
  });

  return (
    <OrganizationContext.Provider value={{ organization }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => useContext(OrganizationContext);
