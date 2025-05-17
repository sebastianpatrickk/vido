"use client";

import type { File } from "@/lib/validations/file";
import type { DataTableRowAction } from "@/types/data-table";
import * as React from "react";

import { DataTable } from "@/components/data-table/data-table";
import { useDataTable } from "@/hooks/use-data-table";
import { getFilesTableColumns } from "./get-files-table-columns";

const placeholderData = {
  data: Array.from({ length: 10 }, (_, i) => ({
    id: String(i + 1),
    cloudflareId: String(i + 1),
    url: "https://example.com",
    code: `VID-${String(5123 + i).padStart(4, "0")}`,
    name: `Example ${i + 1}`,
    size: Math.floor(Math.random() * 5000000000) + 100000000,
    tags: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      (_, i) => `tag${Math.floor(Math.random() * 5) + 1}`,
    ),
    uploaded: new Date("2025-01-01"),
  })),
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
