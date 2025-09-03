// "use client";

// import Link from "next/link";
// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   navigationMenuTriggerStyle,
// } from "@/components/ui/navigation-menu";

// export function NavigationMenuDemo() {
//   return (
//     <NavigationMenu className="max-md:px-24">
//       <NavigationMenuList>
//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/">Home</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>

//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/about">About</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>

//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/programs">Programs</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>

//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/pricing">Pricing</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>

//         {/* Vacancy link - render only when active */}
//         {/* Example: vacancies.length > 0 */}
//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/vacancy">Vacancies</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>

//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/register">Register</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>

//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/vacancy">Apply as Teacher</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>

//         <NavigationMenuItem>
//           <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
//             <Link href="/login">Login</Link>
//           </NavigationMenuLink>
//         </NavigationMenuItem>
//       </NavigationMenuList>
//     </NavigationMenu>
//   );
// }


import { AppNav } from "@/components/AppNav";

export function RoleNav({items}) {
  return <AppNav items={items} />;
}

