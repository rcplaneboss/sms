import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectDemo({items} : {items: {value: string, label: string}[]}) {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={items[0].label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Courses</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
