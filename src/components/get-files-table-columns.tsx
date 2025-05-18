"use client";

import type { DataTableRowAction } from "@/types/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, FileIcon, Text } from "lucide-react";
import * as React from "react";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { formatDate, formatFileSize } from "@/lib/format";
import { File } from "@/lib/validations/file";

interface GetTasksTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<File> | null>
  >;
}

export function getFilesTableColumns({
  setRowAction,
}: GetTasksTableColumnsProps): ColumnDef<File>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      id: "code",
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Task" />
      ),
      cell: ({ row }) => <div className="w-20">{row.getValue("code")}</div>,
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("name")}
            </span>
          </div>
        );
      },
      meta: {
        label: "Name",
        placeholder: "Search names...",
        variant: "text",
        icon: Text,
      },
      enableColumnFilter: true,
    },
    {
      id: "size",
      accessorKey: "size",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
      ),
      cell: ({ cell }) => formatFileSize(cell.getValue<number | null>()),
      meta: {
        label: "Size",
        variant: "range",
        icon: FileIcon,
      },
      enableColumnFilter: true,
    },
    {
      id: "tags",
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ cell }) => {
        const tags = cell.getValue<string[] | null>();

        if (!tags) return null;

        return (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="py-1 [&>svg]:size-3.5"
              >
                <span className="capitalize">{tag}</span>
              </Badge>
            ))}
          </div>
        );
      },
      meta: {
        label: "Tags",
        variant: "multiSelect",
        // TODO: Add tags options
      },
      enableColumnFilter: true,
    },
    {
      id: "uploaded",
      accessorKey: "uploaded",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Uploaded" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: "Uploaded",
        variant: "dateRange",
        icon: CalendarIcon,
      },
      enableColumnFilter: true,
    },
  ];
}
