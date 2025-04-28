// // src/components/Sidebar.tsx
// import { Link, useLocation } from "react-router-dom";
// import { Home, Calendar, Flag, CreditCard } from "lucide-react";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";

// export const Sidebar = () => {
//   const location = useLocation();
//   const [role, setRole] = useState<"manager" | "coach" | "entrepreneur">(
//     "manager"
//   );

//   const menuItems = [
//     {
//       name: "Dashboard",
//       path: `/${role}/dashboard`,
//       icon: <Home className="h-5 w-5" />,
//     },
//     {
//       name: "Sessions",
//       path: `/${role}/sessions`,
//       icon: <Calendar className="h-5 w-5" />,
//     },
//     {
//       name: "Goals",
//       path: `/${role}/goals`,
//       icon: <Flag className="h-5 w-5" />,
//     },
//     ...(role === "manager"
//       ? [
//           {
//             name: "Payments",
//             path: "/manager/payments",
//             icon: <CreditCard className="h-5 w-5" />,
//           },
//         ]
//       : []),
//   ];

//   return (
//     <div className="h-screen border-r w-64 flex flex-col justify-between bg-background">
//       <div>
//         <div className="p-4 border-b">
//           <select
//             className="w-full p-2 rounded-md border"
//             value={role}
//             onChange={(e) => setRole(e.target.value as any)}
//           >
//             <option value="manager">Manager</option>
//             <option value="coach">Coach</option>
//             <option value="entrepreneur">Entrepreneur</option>
//           </select>
//         </div>

//         <nav className="mt-4 flex flex-col gap-1 px-2">
//           {menuItems.map((item) => (
//             <Link key={item.name} to={item.path}>
//               <Button
//                 variant={
//                   location.pathname === item.path ? "secondary" : "ghost"
//                 }
//                 className="w-full justify-start gap-2"
//               >
//                 {item.icon}
//                 {item.name}
//               </Button>
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </div>
//   );
// };
