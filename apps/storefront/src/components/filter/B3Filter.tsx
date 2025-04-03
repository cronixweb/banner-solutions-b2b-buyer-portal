import { BaseSyntheticEvent, useRef, useState } from 'react';
import { Box } from '@mui/material';

import useMobile from '@/hooks/useMobile';

import CustomButton from '../button/CustomButton';
import { B3Select } from '../ui';

import B3FilterMore from './B3FilterMore';
import B3FilterSearch from './B3FilterSearch';

import AddCircleOutlineOutlined from '@mui/icons-material/AddCircleOutlineOutlined'
import B3CustomForm from '../B3CustomForm';
import { useForm } from 'react-hook-form';
import B3FilterPicker from './B3FilterPicker';
import B3CustomRowForm from '../B3CustomRowForm';

interface SortByItemNameProps {
  valueName: string;
  labelName: string;
}

interface PickerProps {
  isEnabled: boolean;
  defaultValue?: Date | number | string | null;
  label: string;
  w?: number;
  pickerKey?: string;
}

interface SortByConfigProps {
  isEnabled: boolean;
  sortByList?: any[];
  sortByItemName?: SortByItemNameProps | undefined;
  sortByLabel: string;
  defaultValue?: string | undefined;
  isFirstSelect?: boolean;
  firstSelectText?: string;
  w?: number;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

interface CustomButtonProps {
  isEnabled: boolean;
  customLabel: string;
  customButtonStyle?: { [key: string]: string };
}

interface B3FilterProps<T, Y> {
  sortByConfig?: SortByConfigProps;
  customButtonConfig?: CustomButtonProps;
  startPicker?: PickerProps;
  endPicker?: PickerProps;
  filterMoreInfo: Array<DeepPartial<T>>;
  handleChange: (key: string, value: string) => void;
  handleFilterChange: (value: Y) => void;
  handleFilterCustomButtonClick?: () => void;
  showB3FilterMoreIcon?: boolean;
  searchValue?: string;
  resetFilterInfo?: () => void;
  pcContainerWidth?: string;
  pcSearchContainerWidth?: string;
  pcTotalWidth?: string;
}

interface PickerRefProps extends HTMLInputElement {
  setClearPickerValue: () => void;
  getPickerValue: () => { [key: string]: string };
}

function B3Filter<T, Y>(props: B3FilterProps<T, Y>) {
  const {
    sortByConfig,
    startPicker,
    endPicker,
    filterMoreInfo,
    customButtonConfig,
    handleChange,
    handleFilterChange,
    handleFilterCustomButtonClick,
    showB3FilterMoreIcon = true,
    searchValue = '',
    resetFilterInfo,
    pcContainerWidth = '29rem',
    pcSearchContainerWidth = '35%',
    pcTotalWidth = 'unset',
  } = props;

  const [isMobile] = useMobile();

  const [sortByValue, setSortBy] = useState<string>(sortByConfig?.defaultValue || '');

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    handleChange('sortBy', value);
  };

  const handleSearchChange = (value: string) => {
    handleChange('search', value);
  };

  const handleCustomBtnClick = () => {
    if (handleFilterCustomButtonClick) handleFilterCustomButtonClick();
  };

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
  } = useForm({
    mode: 'onSubmit',
  });

  const pickerRef = useRef<PickerRefProps | null>(null);
  const [cacheData, setCacheData] = useState<CustomFieldItems | null>(null);
  const [isOpen, setOpen] = useState(false);
  
  const handleSaveFilters = (event: BaseSyntheticEvent<object, any, any> | undefined) => {
    handleSubmit((data) => {
      const getPickerValues = pickerRef.current?.getPickerValue();
        const submitData: any = {
          ...getPickerValues,
          ...data,
        };

        // handleFilterStatus(submitData);
        handleFilterChange(submitData);

        setCacheData({
          ...data,
        });
    })(event);
  };

  const handleFilterClick = () => {
    setOpen(!isOpen);
  }
    
  const handleClearFilters = () => {
    Object.keys(getValues()).forEach((item: string) => {
      setValue(item, '');
    });

    if (resetFilterInfo) {
      resetFilterInfo();
    }
    pickerRef.current?.setClearPickerValue();
  };

  return (
    <>
      {!isMobile && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: '30px',
              width: pcTotalWidth,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {sortByConfig?.isEnabled && (
                <Box
                  sx={{
                    ml: '5px',
                    mr: 0,
                  }}
                >
                  <B3Select
                    list={sortByConfig?.sortByList || []}
                    value={sortByValue}
                    handleChange={handleSortByChange}
                    label={sortByConfig?.sortByLabel || ''}
                    config={sortByConfig?.sortByItemName}
                    isFirstSelect={sortByConfig?.isFirstSelect}
                    firstSelectText={sortByConfig?.firstSelectText}
                    w={sortByConfig?.w || 150}
                  />
                </Box>
              )}
              {customButtonConfig?.isEnabled && (
                <CustomButton
                  size="large"
                  variant="contained"
                  sx={{
                    p: '20px 20px',
                    ...(customButtonConfig?.customButtonStyle || {}),
                    background: "none",
                    boxShadow: "none",
                    border: "1px dashed rgba(0,0,0,0.42)",
                    color: "#4A25A9",
                    textTransform: "none",
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.04)',
                      boxShadow: 'none',
                    },
                  }}
                  onClick={handleCustomBtnClick}
                  >
                  <AddCircleOutlineOutlined sx={{
                    marginRight: '8px',
                  }} />
                  {customButtonConfig?.customLabel || ''}
                </CustomButton>
              )}
              {/* <B3FilterToggleTable /> */}
            </Box>

            <Box
              sx={{
                maxWidth: pcContainerWidth,
                flexBasis: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
              }}
            >
              {showB3FilterMoreIcon && (
                <B3FilterMore
                  startPicker={startPicker}
                  endPicker={endPicker}
                  filterMoreInfo={filterMoreInfo}
                  onChange={handleFilterChange}
                  resetFilterInfo={resetFilterInfo}
                  handleFilterClick={handleFilterClick}
                  isFilterOpen={isOpen}
                />
              )}

              <B3FilterSearch
                handleChange={handleSearchChange}
                w={pcSearchContainerWidth}
                searchValue={searchValue}
                placeholder='Search projects'
                h='1.2em'
              />
            </Box>
          </Box>

        {isOpen && <Box
          sx={{
            background: 'rgb(248, 245, 255)',
            marginBottom: 2,
            p: 2,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <Box
              sx={{
                width: `${isMobile ? '100%' : '520px'}`,
              }}
            >
              <B3CustomRowForm
                formFields={filterMoreInfo}
                errors={errors}
                control={control}
                getValues={getValues}
                setValue={setValue}
              />

              <B3FilterPicker ref={pickerRef} startPicker={startPicker} endPicker={endPicker} />
              
            </Box>
            <CustomButton
              sx={{
                mt: 1,
                textTransform: 'none',
                height: 36,
                ml: 4,
                fontSize: 12,
                borderRadius: 1,
                borderWidth: 1.5
              }}
              onClick={handleClearFilters}
              size="large"
              variant='outlined'
            >
              {/* {b3Lang('global.filter.clearFilters')} */}
              Reset Filters
            </CustomButton>

            <CustomButton
              variant='contained'
              size='large'
              sx={{
                mt: 1,
                ml: 4,
                height: 36,
                textTransform: 'none',
                fontSize: 12,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              }}
              onClick={(e) => handleSaveFilters(e)}
              autoFocus
            >
              Apply Filters
            </CustomButton>
          </Box>}
        </Box>
      )}
      {isMobile && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mb: '5vw',
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <B3FilterSearch handleChange={handleSearchChange} w="90%" searchValue={searchValue} />
            <B3FilterMore
              startPicker={startPicker}
              endPicker={endPicker}
              filterMoreInfo={filterMoreInfo}
              onChange={handleFilterChange}
              resetFilterInfo={resetFilterInfo}
              handleFilterClick={handleFilterClick}
              isFilterOpen={isOpen}
            />
          </Box>
          {customButtonConfig?.isEnabled && (
            <CustomButton
              size="small"
              variant="contained"
              fullWidth
              sx={{
                marginTop: '20px',
                height: '42px',
                ...(customButtonConfig?.customButtonStyle || {}),
              }}
              onClick={handleCustomBtnClick}
            >
              {customButtonConfig?.customLabel || ''}
            </CustomButton>
          )}
        </Box>
      )}
    </>
  );
}

export default B3Filter;
