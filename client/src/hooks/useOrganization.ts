import { useAuth } from "./useAuth";
import { useCallback } from "react";

interface Organization {
  id: string;
  name: string;
  role: string;
}

export function useOrganization() {
  const { user, mutate } = useAuth();

  // Get the current organization based on localStorage or first org
  const getCurrentOrganization = useCallback((): Organization | undefined => {
    if (!user?.organizations.length) return undefined;

    const storedOrgId = localStorage.getItem("currentOrganizationId");
    return (
      user.organizations.find((org) => org.id === storedOrgId) ||
      user.organizations[0]
    );
  }, [user]);

  const switchOrganization = useCallback(
    async (organizationId: string) => {
      try {
        const newOrg = user?.organizations.find(
          (org) => org.id === organizationId
        );
        if (!newOrg) {
          throw new Error("Organization not found");
        }

        localStorage.setItem("currentOrganizationId", organizationId);

        if (user) {
          const updatedUser = {
            ...user,
            organizations: [
              newOrg,
              ...user.organizations.filter((org) => org.id !== organizationId),
            ],
          };
          await mutate({ user: updatedUser }, false);
        }
      } catch (error) {
        console.error("Error switching organization:", error);
        throw error;
      }
    },
    [user, mutate]
  );

  const currentOrganization = getCurrentOrganization();

  return {
    switchOrganization,
    currentOrganization,
    organizations: user?.organizations || [],
    organizationRole: currentOrganization?.role,
  };
}
