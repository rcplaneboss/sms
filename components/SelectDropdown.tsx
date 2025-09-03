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

export function SelectDemo({items, value, onChange} : {items: {value: string, label: string}[], value: string, onChange: (value: string) => void}) {
  return (
    <Select value={value} onValueChange={onChange} required>
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
