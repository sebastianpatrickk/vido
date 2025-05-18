"use client";

import type { File } from "@/lib/validations/file";
import type { DataTableRowAction } from "@/types/data-table";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { getFilesTableColumns } from "./get-files-table-columns";

const placeholderData = {
  data: [
    {
      id: "1",
      cloudflareId: "1",
      url: "https://example.com",
      code: "VID-5123",
      name: "Example 1",
      size: 3627401339,
      tags: ["tag1", "tag1", "tag5"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "2",
      cloudflareId: "2",
      url: "https://example.com",
      code: "VID-5124",
      name: "Example 2",
      size: 2460433646,
      tags: ["tag5", "tag2", "tag3"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "3",
      cloudflareId: "3",
      url: "https://example.com",
      code: "VID-5125",
      name: "Example 3",
      size: 3288993998,
      tags: ["tag1", "tag1"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "4",
      cloudflareId: "4",
      url: "https://example.com",
      code: "VID-5126",
      name: "Example 4",
      size: 3707901669,
      tags: ["tag1", "tag4", "tag3"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "5",
      cloudflareId: "5",
      url: "https://example.com",
      code: "VID-5127",
      name: "Example 5",
      size: 710300769,
      tags: ["tag4", "tag1", "tag2"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "6",
      cloudflareId: "6",
      url: "https://example.com",
      code: "VID-5128",
      name: "Example 6",
      size: 2181130815,
      tags: ["tag2", "tag2"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "7",
      cloudflareId: "7",
      url: "https://example.com",
      code: "VID-5129",
      name: "Example 7",
      size: 3847494648,
      tags: ["tag3"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "8",
      cloudflareId: "8",
      url: "https://example.com",
      code: "VID-5130",
      name: "Example 8",
      size: 1949684568,
      tags: ["tag2"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "9",
      cloudflareId: "9",
      url: "https://example.com",
      code: "VID-5131",
      name: "Example 9",
      size: 2750678641,
      tags: ["tag3", "tag1"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
    {
      id: "10",
      cloudflareId: "10",
      url: "https://example.com",
      code: "VID-5132",
      name: "Example 10",
      size: 2409899323,
      tags: ["tag4", "tag1"],
      uploaded: new Date("2025-01-01T00:00:00.000Z"),
    },
  ],
  pageCount: 1,
};

export function FilesTable() {
  const { data, pageCount } = placeholderData;

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<File> | null>(null);

  const columns = React.useMemo(
    () =>
      getFilesTableColumns({
        setRowAction,
      }),
    [],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: "uploaded", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <>
      <DataTable table={table}></DataTable>
    </>
  );
}
