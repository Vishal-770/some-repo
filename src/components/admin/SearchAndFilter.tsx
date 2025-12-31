"use client";

import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { SearchFilters } from "./types";

interface SearchAndFilterProps {
  searchValue: string;
  searchField: "email" | "name";
  onSearchValueChange: (value: string) => void;
  onSearchFieldChange: (field: "email" | "name") => void;
  onSearch: () => void;
}

export function SearchAndFilter({
  searchValue,
  searchField,
  onSearchValueChange,
  onSearchFieldChange,
  onSearch,
}: SearchAndFilterProps) {
  return (
    <div className="flex gap-4">
      <Select value={searchField} onValueChange={onSearchFieldChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Search by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="name">Name</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="text"
        placeholder={`Search by ${searchField}...`}
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        className="flex-1"
      />

      <Button onClick={onSearch}>Search</Button>
    </div>
  );
}
