import MenuItem from "@mui/material/MenuItem";
import { Box, Button, Checkbox, Popover, Typography } from "@mui/material";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import shadows from "@mui/material/styles/shadows";
import { Filter, emptyFilter } from "../hooks/useSearchFilter";
import { useDebouncedState } from "../hooks/useDebouncedState";
import { SearchField } from "./SearchField";
import { StateChip } from "./StateChip";
import { useTranslation } from "../hooks/useTranslation";

const style = {
  root: {
    boxShadow: shadows[2],
    borderRadius: 8,
    justifyContent: "space-between",
  },
};

export type Option = { label: string | number; value: string };

type Props = {
  label: string;
  name: string;
  options: Option[];
  toggleSearchFilter: (name: string, value: string) => void;
  filters: typeof emptyFilter;
  canSearch?: boolean;
};

export const SelectWithCheckbox = ({
  label,
  options,
  name,
  filters,
  toggleSearchFilter,
  canSearch = false,
}: Props) => {
  const { translate } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [debouncedSearch, setDebouncedSearch] = useDebouncedState("", 500);

  const open = Boolean(anchorEl);

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const onClose = () => {
    setAnchorEl(null);
    setDebouncedSearch("");
  };

  const filteredOptions = filterOptions({ options, search: debouncedSearch });
  return (
    <>
      <Button
        onClick={onClick}
        style={style.root}
        sx={{ textTransform: "none", typography: "bodySmall", height: "48px" }}
        size="large"
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        color="inherit"
      >
        {label}
      </Button>
      <Popover
        sx={{ my: 0.5 }}
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {canSearch && (
          <SearchField
            sx={{ m: 2 }}
            onChange={e => setDebouncedSearch(e.target.value)}
            label={translate("searchLabel")}
            placeholder={translate("searchInterviewerPlaceholder")}
          />
        )}
        <Box sx={{ overflow: "auto", maxHeight: "calc(100vh - 420px)" }}>
          {filteredOptions.map(option => (
            <MenuItem
              key={option.value}
              onClick={() => {
                toggleSearchFilter(name, option.value);
              }}
              sx={{ pl: 1, py: 0, minWidth: "150px" }}
            >
              <Checkbox
                size="small"
                checked={filters[name as keyof Omit<Filter, "all">].includes(option.value)}
              />
              {name !== "states" ? (
                <Typography variant="bodySmall" fontWeight={600}>
                  {option.label}
                </Typography>
              ) : (
                <StateChip value={option.value} />
              )}
            </MenuItem>
          ))}
        </Box>
      </Popover>
    </>
  );
};

const filterOptions = ({ options, search }: { options: Option[]; search?: string }) => {
  if (search) {
    return options.filter(item => item.label.toString().toLowerCase().includes(search.toLowerCase()));
  }
  return options;
};
