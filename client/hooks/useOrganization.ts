// import { useAuth } from "./useAuth";
// import { useCallback } from "react";
// import useSWR from "swr";
// import axios from "axios";

// interface Organization {
//   id: string;
//   name: string;
//   role: string;
//   isSelected: boolean;
// }

// const fetcher = async (url: string) => {
//   const response = await axios.get(url, { withCredentials: true });
//   return response.data;
// };

// export function useOrganization() {
//   const { user, mutate: mutateAuth, organization } = useAuth();
//   console.log(user);
//   if (!user) {
//     return {
//       organizations: [],
//       selectedOrganization: null,
//       switchOrganization: () => {},
//       isLoading: true,
//       error: null,
//     };
//   }
//   const {
//     data: organizations,
//     error,
//     mutate: mutateOrganizations,
//   } = useSWR<Organization[]>(
//     `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/${organizations.role}/organizations`,
//     fetcher
//   );

//   const switchOrganization = useCallback(
//     async (organizationId: string) => {
//       try {
//         // Optimistically update the UI
//         mutateOrganizations(
//           (prevOrganizations) =>
//             prevOrganizations?.map((org) => ({
//               ...org,
//               isSelected: org.id === organizationId,
//             })),
//           false
//         );

//         // Make the API call to switch the organization
//         await axios.post(
//           `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/switch-organization`,
//           { organizationId },
//           { withCredentials: true }
//         );

//         await mutateAuth();
//         await mutateOrganizations();
//       } catch (error) {
//         console.error("Error switching organization:", error);
//         // Revalidate to revert the optimistic update on error
//         mutateOrganizations();
//       }
//     },
//     [mutateAuth, mutateOrganizations]
//   );

//   const selectedOrganization = organizations?.find((org) => org.isSelected);

//   return {
//     organizations,
//     selectedOrganization,
//     switchOrganization,
//     isLoading: !error && !organizations,
//     error,
//   };
// }

//--------------------------------------------------------------------

// import { useAuth } from "./useAuth";
// import { useCallback } from "react";
// import useSWR from "swr";
// import axios from "axios";

// interface Organization {
//   id: string;
//   name: string;
//   role: string;
//   isSelected: boolean;
// }

// const fetcher = async (url: string) => {
//   try {
//     const response = await axios.get(url, { withCredentials: true });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching organizations:", error);
//     return []; // Return an empty array in case of error
//   }
// };

// export function useOrganization() {
//   const { user, mutate: mutateAuth } = useAuth();

//   const {
//     data: organizations,
//     error,
//     mutate: mutateOrganizations,
//   } = useSWR<Organization[]>(
//     user ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/${user.organizations.role}/organizations` : null,
//     fetcher
//   );

//   const switchOrganization = useCallback(
//     async (organizationId: string) => {
//       try {
//         // Optimistically update the UI
//         mutateOrganizations(
//           (prevOrganizations) =>
//             prevOrganizations?.map((org) => ({
//               ...org,
//               isSelected: org.id === organizationId,
//             })),
//           false
//         );

//         // Make the API call to switch the organization
//         await axios.post(
//           `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/switch-organization`,
//           { organizationId },
//           { withCredentials: true }
//         );

//         await mutateAuth();
//         await mutateOrganizations();
//       } catch (error) {
//         console.error("Error switching organization:", error);
//         // Revalidate to revert the optimistic update on error
//         mutateOrganizations();
//       }
//     },
//     [mutateAuth, mutateOrganizations]
//   );

//   const selectedOrganization = organizations?.find((org) => org.isSelected);

//   return {
//     organizations: organizations || [], // Ensure organizations is always an array
//     selectedOrganization: selectedOrganization || null, // Ensure selectedOrganization is not undefined
//     switchOrganization,
//     isLoading: !error && !organizations,
//     error,
//   };
// }

//-------------------------------------

import { useAuth } from "./useAuth";
import { useCallback } from "react";
import useSWR from "swr";
import axios from "axios";

interface Organization {
  id: string;
  name: string;
  role: string;
  isSelected: boolean;
}

const fetcher = async (url: string) => {
  try {
    const response = await axios.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return []; // Return an empty array in case of error
  }
};

export function useOrganization() {
  const { user, mutate: mutateAuth } = useAuth();

  const {
    data: organizations,
    error,
    mutate: mutateOrganizations,
    isLoading,
  } = useSWR<Organization[]>(
    user
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/${user.organizations.role}/organizations`
      : null,
    fetcher
  );

  const switchOrganization = useCallback(
    async (organizationId: string) => {
      try {
        // Optimistically update the UI
        mutateOrganizations(
          (prevOrganizations) =>
            prevOrganizations?.map((org) => ({
              ...org,
              isSelected: org.id === organizationId,
            })),
          false
        );

        // Make the API call to switch the organization
        await axios.post(
          `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/switch-organization`,
          { organizationId },
          { withCredentials: true }
        );

        await mutateAuth();
        await mutateOrganizations();
      } catch (error) {
        console.error("Error switching organization:", error);
        // Revalidate to revert the optimistic update on error
        mutateOrganizations();
      }
    },
    [mutateAuth, mutateOrganizations]
  );

  const selectedOrganization = organizations?.find((org) => org.isSelected);

  return {
    organizations: organizations || [], // Ensure organizations is always an array
    selectedOrganization: selectedOrganization || null, // Ensure selectedOrganization is not undefined
    switchOrganization,
    isLoading,
    error,
  };
}
