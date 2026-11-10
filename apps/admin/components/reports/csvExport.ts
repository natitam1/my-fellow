import toast from "react-hot-toast";

/**
 * Escapes fields for CSV according to RFC 4180:
 * - Wrap in double quotes if it contains commas, double quotes, or newlines
 * - Escape internal double quotes with two double quotes ("")
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Client-side CSV generator and trigger download.
 * Adds UTF-8 BOM for full compatibility with Excel and local characters.
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
  successMessage?: string
) {
  try {
    const csvContent = [
      headers.map(escapeCSVValue).join(","),
      ...rows.map((row) => row.map(escapeCSVValue).join(",")),
    ].join("\r\n");

    // Prepend UTF-8 BOM so Excel opens Ethiopian names and special characters correctly
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (successMessage) {
      toast.success(successMessage);
    } else {
      toast.success(`Exported ${rows.length} rows to ${filename}`);
    }
  } catch (error) {
    console.error("CSV Export error:", error);
    toast.error("Failed to generate CSV export file.");
  }
}
