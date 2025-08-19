import React from "react";
import { FiFacebook, FiInstagram, FiTwitter } from "react-icons/fi";
import { MdMail, MdPhone } from "react-icons/md";
import { NavigationMenuDemo } from "./ui/Navigation";
import { Button } from "./ui/LinkAsButton";
import { DarkModeToggle } from "./ui/switch-toggle";
const Header = () => {
  return (
    <main className="flex flex-col w-screen sticky top-0 z-50">
      <DarkModeToggle />
      <div className="bg-p1-hex px-30 w-screen flex font-mono text-t-light h-10 max-md:px-16">
        <div className="flex justify-between w-full">
          <div className="flex gap-3 items-center">
            <div className="text-xs flex items-center gap-1">
              <MdPhone />
              +234-70-855-440-64
            </div>
            <div className="text-xs flex items-center gap-1  max-md:hidden">
              <MdMail />
              alitqanonlineschool3@gmail.com
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-full w-7 h-7 bg-p1-hex border-2 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors duration-200 cursor-pointer">
              <FiFacebook className="text-white transition-colors duration-200" />
            </div>

            <div className="rounded-full w-7 h-7 bg-p1-hex border-2 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors duration-200 cursor-pointer">
              <FiInstagram className="text-white transition-colors duration-200" />
            </div>

            <div className="rounded-full w-7 h-7 bg-p1-hex border-2 border-gray-400 flex items-center justify-center hover:bg-gray-400 transition-colors duration-200 cursor-pointer">
              <FiTwitter className="text-white transition-colors duration-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white h-16 px-30 max-md:px-16 flex justify-center items-center dark:bg-black">
        <div className="flex justify-between w-full items-center">
          <div>
            {/* <Image src="/logo.png" alt="Logo" width={100} height={100} /> */}
            <h1 className="text-2xl font-bold font-sans">Al-Itqan</h1>
          </div>

          <div className="font-mono text-t-dark dark:text-t-light text-sm max-md:hidden">
            <NavigationMenuDemo />
          </div>

          <div className="max-md:hidden">
            <Button href="/about" variant="primary">Contact Us</Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Header;
