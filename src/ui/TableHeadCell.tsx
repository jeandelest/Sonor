import { TableCell as MuiTableCell, TableCellProps, TableSortLabel } from "@mui/material";
import { useTranslation } from "../functions/translate";

type Props = {
  columnId: string;
  label: string;
  sort?: boolean;
  order?: "asc" | "desc";
  orderBy?: string;
  onRequestSort?: (event: React.MouseEvent<unknown>, property: string) => void;
} & Pick<TableCellProps, "sx">;

export const TableHeadCell = ({
  columnId,
  label,
  sort = true,
  order,
  orderBy,
  onRequestSort,
  sx,
}: Props) => {
  const { translate } = useTranslation();

  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort?.(event, property);
  };

  return (
    <MuiTableCell sx={{ ...sx, typography: "titleSmall", pb: 2 }}>
      {sort ? (
        <TableSortLabel
          className="Mui-active"
          active={orderBy === columnId}
          direction={orderBy === columnId ? order : "desc"}
          onClick={createSortHandler(columnId)}
        >
          {translate(label)}
        </TableSortLabel>
      ) : (
        translate(label)
      )}
    </MuiTableCell>
  );
};
