import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useB3Lang } from '@b3/lang';
import { Box } from '@mui/material';

import { B2BAutoCompleteCheckbox } from '@/components';
import B3Filter from '@/components/filter/B3Filter';
import B3Spin from '@/components/spin/B3Spin';
import { B3PaginationTable, GetRequestList } from '@/components/table/B3PaginationTable';
import { TableColumnItem } from '@/components/table/B3Table';
import { useMobile, useSort } from '@/hooks';
import {
  getB2BAllOrders,
  getBCAllOrders,
  getBcOrderStatusType,
  getOrdersCreatedByUser,
  getOrderStatusType,
} from '@/shared/service/b2b';
import { isB2BUserSelector, useAppSelector } from '@/store';
import { CustomerRole } from '@/types';
import { currencyFormat, displayFormat, ordersCurrencyFormat } from '@/utils';

import OrderStatus from './components/OrderStatus';
import { orderStatusTranslationVariables } from './shared/getOrderStatus';
import {
  defaultSortKey,
  FilterSearchProps,
  getFilterMoreData,
  getInitFilter,
  getOrderStatusText,
  sortKeys,
} from './config';
import { OrderItemCard } from './OrderItemCard';
import { getOrders, OrderItem } from '@/shared/service/bannerApi/orders';
import CustomButton from '@/components/button/CustomButton';

interface CompanyInfoProps {
  companyId: string;
  companyName: string;
  companyAddress: string;
  companyCountry: string;
  companyState: string;
  companyCity: string;
  companyZipCode: string;
  phoneNumber: string;
  bcId: string;
}

// interface ListItem {
//   firstName: string;
//   lastName: string;
//   orderId: string;
//   poNumber?: string;
//   money: string;
//   totalIncTax: string;
//   status: string;
//   createdAt: string;
//   companyName: string;
//   companyInfo?: CompanyInfoProps;
// }

interface ListItem extends OrderItem {}

interface SearchChangeProps {
  startValue?: string;
  endValue?: string;
  PlacedBy?: string;
  orderStatus?: string | number;
  company?: string;
}

interface OrderProps {
  isCompanyOrder?: boolean;
  isDashBoard?: boolean;
}

function useData() {
  const isB2BUser = useAppSelector(isB2BUserSelector);
  const companyB2BId = useAppSelector(({ company }) => company.companyInfo.id);
  const role = useAppSelector(({ company }) => company.customer.role);
  const salesRepCompanyId = useAppSelector(({ b2bFeatures }) => b2bFeatures.masqueradeCompany.id);
  const isAgenting = useAppSelector(({ b2bFeatures }) => b2bFeatures.masqueradeCompany.isAgenting);

  const { order: orderSubViewPermission } = useAppSelector(
    ({ company }) => company.pagesSubsidiariesPermission,
  );

  const { selectCompanyHierarchyId, isEnabledCompanyHierarchy } = useAppSelector(
    ({ company }) => company.companyHierarchyInfo,
  );
  const currentCompanyId =
    role === CustomerRole.SUPER_ADMIN && isAgenting
      ? Number(salesRepCompanyId)
      : Number(companyB2BId);

  const companyId = companyB2BId || salesRepCompanyId;

  return {
    role,
    isAgenting,
    isB2BUser,
    orderSubViewPermission,
    selectCompanyHierarchyId,
    isEnabledCompanyHierarchy,
    currentCompanyId,
    companyId,
  };
}

function Order({ isCompanyOrder = false, isDashBoard }: OrderProps) {
  const b3Lang = useB3Lang();
  const [isMobile] = useMobile();
  const {
    role,
    isAgenting,
    companyId,
    isB2BUser,
    orderSubViewPermission,
    selectCompanyHierarchyId,
    isEnabledCompanyHierarchy,
    currentCompanyId,
  } = useData();

  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [allTotal, setAllTotal] = useState(0);
  const [filterData, setFilterData] = useState<Partial<FilterSearchProps> | null>(null);
  const [filterInfo, setFilterInfo] = useState<Array<any>>([]);
  const [getOrderStatuses, setOrderStatuses] = useState<Array<any>>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  const [handleSetOrderBy, order, orderBy] = useSort(
    sortKeys,
    defaultSortKey,
    filterData,
    setFilterData,
  );

  useEffect(() => {
    const search = getInitFilter(isCompanyOrder, isB2BUser);
    if (isB2BUser) {
      search.companyIds = [Number(selectCompanyHierarchyId) || Number(currentCompanyId)];
    }
    setFilterData(search);
    setIsAutoRefresh(true);
    if (role === 100) return;

    const initFilter = async () => {
      const createdByUsers =
        isB2BUser && isCompanyOrder ? await getOrdersCreatedByUser(Number(companyId), 0) : {};

      const orderStatuses = isB2BUser ? await getOrderStatusType() : await getBcOrderStatusType();

      const filterInfo = getFilterMoreData(
        isB2BUser,
        role,
        isCompanyOrder,
        isAgenting,
        createdByUsers,
        orderStatuses,
      );
      setOrderStatuses(orderStatuses);

      const filterInfoWithTranslatedLabel = filterInfo.map((element) => {
        const translatedElement = element;
        translatedElement.label = b3Lang(element.idLang);

        if (element.name === 'orderStatus') {
          translatedElement.options = element.options.map(
            (option: { customLabel: string; systemLabel: string }) => {
              const optionLabel = orderStatusTranslationVariables[option.systemLabel];
              const elementOption = option;
              elementOption.customLabel =
                b3Lang(optionLabel) === elementOption.systemLabel
                  ? elementOption.customLabel
                  : b3Lang(optionLabel);

              return option;
            },
          );
        }

        return element;
      });

      setFilterInfo(filterInfoWithTranslatedLabel);
    };

    initFilter();
    // disabling as we only need to run this once and values at starting render are good enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectCompanyHierarchyId]);

  const fetchList: GetRequestList<Partial<FilterSearchProps>, ListItem> = async (params) => {
    // const { edges = [], totalCount } = isB2BUser
    //   ? await getB2BAllOrders(params)
    //   : await getBCAllOrders(params);

    console.log('params', params);
    const orders = await getOrders("2022-10-26", "2023-06-26", [], 2);

    if(!orders) {
      return {
        edges: [],
        totalCount: 0
      }
    }

    orders.value = orders?.value.sort((a: ListItem, b: ListItem) => {
      switch (params.orderBy){

        case "orderId": 
          return Number(a.orderNumber) - Number(b.orderNumber);

        case "-orderId": 
          return Number(b.orderNumber) - Number(a.orderNumber);

        case "orderDate": 
          return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        
        case "-orderDate":
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        
        case "poNumber":
          return a.poNumber.localeCompare(b.poNumber);
        
        case "-poNumber":
          return b.poNumber.localeCompare(a.poNumber);
        
        case "totalAmount": 
          return a.unitPrice - b.unitPrice;
        
        case "-totalAmount": 
          return b.unitPrice - a.unitPrice;
        
        case "orderedBy":
          return a.contactName.localeCompare(b.contactName);
        
        case "-orderedBy":
          return b.contactName.localeCompare(a.contactName);
        
        case "status":
          return a.orderCancelled ? 1 : -1;
        
        case "-status":
          return b.orderCancelled ? 1 : -1;
        
      }

      return 0;  
    }) || [];

    const edges = 
    isDashBoard ?
      orders?.value.slice(0, 4) || []
    :
      orders?.value.slice(Number(params.offset), Number(params.offset) + Number(params.first)) || [] ;

    const totalCount = isDashBoard ? 4 : orders?.value.length || 0;

    setAllTotal(totalCount);
    setIsAutoRefresh(false);
    return {
      edges,
      totalCount,
    };
  };

  const navigate = useNavigate();

  const goToDetail = (item: ListItem, index: number) => {
    navigate(`/orderDetail/${item.orderNumber}`, {
      state: {
        currentIndex: index,
        searchParams: filterData,
        totalCount: allTotal,
        isCompanyOrder,
        beginDateAt: filterData?.beginDateAt,
        endDateAt: filterData?.endDateAt,
      },
    });
  };

  const columnAllItems: TableColumnItem<ListItem>[] = [
    {
      key: 'orderId',
      title: b3Lang('orders.order'),
      width: '10%',
      isSortable: true,
      render: (item: ListItem, index: number) => {
        const { orderNumber } = item;

        return <Box
          sx={{
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          onClick={() => {
            if (index !== undefined) {
              goToDetail(item, index);
            }
          }}
        >{ orderNumber || '–'}</Box>;
      }
    },
    {
      key: 'orderDate',
      title: b3Lang('orders.date'),
      width: '10%',
      isSortable: true,
      render: (item: ListItem) => {
        const { orderDate } = item;

        return <Box
          sx={{
            fontSize: '12px',
          }}
        >{ `${displayFormat(orderDate, true)}` || '–'}</Box>;
      },
    },
    {
      key: 'poNumber',
      title: b3Lang('orders.poReference'),
      render: (item: ListItem) => <Box
        sx={{
          fontSize: '12px',
        }}
      >{item.poNumber ? item.poNumber : '–'}</Box>,
      width: '10%',
      isSortable: true,
    },
    {
      key: 'totalAmount',
      title: b3Lang('orders.orderAmount'),
      render: (item: ListItem) =>
        item?.salesTax
          ? `${ordersCurrencyFormat(JSON.parse(JSON.parse(String(item.unitPrice))), item.salesTax)}`
          : `${currencyFormat(item.unitPrice)}`,
      width: '8%',
      style: {
        textAlign: 'left',
        fontSize: '12px',
      },
      isSortable: true,
    },
    {
      key: 'orderedBy',
      title: b3Lang('orders.orderedBy'),
      width: '10%',
      isSortable: true,
      render: (item: ListItem) => {
        const { contactName } = item;

        return <Box
        sx={{
          fontSize: '12px',
        }}
        >{contactName || '–'}</Box>;
      },
    },
    {
      key: 'status',
      title: b3Lang('orders.orderStatus'),
      render: (item: ListItem) => {
        const getStatus = (item:ListItem): string => {
          if (item.orderCancelled) 
            return "Cancelled";
            
          return "Shipped"; // Default status if none are true
        }
        return <OrderStatus text={getOrderStatusText(getStatus(item), getOrderStatuses)} code={getStatus(item)} />
      },
      width: '10%',
      isSortable: true,
    },
    {
      key: 'placedBy',
      title: b3Lang('orders.placedBy'),
      render: (item: ListItem) => `${item.contactName}`,
      width: '10%',
      style:{
        fontSize: '12px',
      },
      isSortable: true,
    },
    {
      key: 'action',
      title: '',
      render: (item: ListItem, index: number) => {
        return <CustomButton
          variant='outlined'
          color='primary'
          size='small'
          sx={{
            textTransform: 'none',
            fontWeight: 400,
          }}
          onClick={() => {
            if (index !== undefined) {
              goToDetail(item, index);
            }
          }}
        >
          {b3Lang('orders.view')}
        </CustomButton>
      },
      width: '5%',
      isSortable: true,
    },
  ];

  const getColumnItems = () => {
    const getNewColumnItems = columnAllItems.filter((item: { key: string }) => {
      const { key } = item;
      if (!isB2BUser && key === 'companyName') return false;
      if ((!isB2BUser || (Number(role) === 3 && !isAgenting)) && key === 'placedBy') return false;
      if (key === 'companyId' && isB2BUser && (Number(role) !== 3 || isAgenting)) return false;
      if (
        (key === 'companyId' || key === 'placedBy') &&
        !(Number(role) === 3 && !isAgenting) &&
        !isCompanyOrder
      )
        return false;
      return true;
    });

    return getNewColumnItems;
  };

  const handleChange = (key: string, value: string) => {
    if (key === 'search') {
      setFilterData({
        ...filterData,
        q: value,
      });
    }
  };

  const handleFilterChange = (value: SearchChangeProps) => {
    let currentStatus = value?.orderStatus || '';
    if (currentStatus) {
      const originStatus = getOrderStatuses.find(
        (status) => status.customLabel === currentStatus || status.systemLabel === currentStatus,
      );

      currentStatus = originStatus?.systemLabel || currentStatus;
    }

    const search: Partial<FilterSearchProps> = {
      beginDateAt: value?.startValue || null,
      endDateAt: value?.endValue || null,
      createdBy: value?.PlacedBy || '',
      statusCode: currentStatus,
      companyName: value?.company || '',
    };
    setFilterData({
      ...filterData,
      ...search,
    });
  };

  const columnItems = getColumnItems();

  const handleSelectCompanies = (company: number[]) => {
    const newCompanyIds = company.includes(-1) ? [] : company;

    setFilterData({
      ...filterData,
      companyIds: newCompanyIds,
    });
  };

  getOrders("2022-10-26", "2023-06-26", [], 2).then(data => console.log(data));

  return (
    <B3Spin isSpinning={isRequestLoading}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
        }}
      >
        {!isDashBoard && <Box
          sx={{
            width: isMobile ? '100%' : 'auto',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: isMobile ? 'flex-start' : 'center',
            flexDirection: isMobile ? 'column' : 'row',

            '& > div': {
              width: isMobile ? '100%' : 'auto',
            },
          }}
        >
          {isEnabledCompanyHierarchy && orderSubViewPermission && (
            <Box sx={{ mr: isMobile ? 0 : '10px', mb: '30px' }}>
              <B2BAutoCompleteCheckbox handleChangeCompanyIds={handleSelectCompanies} />
            </Box>
          )}
          <B3Filter
            startPicker={{
              isEnabled: true,
              label: b3Lang('orders.from'),
              defaultValue: filterData?.beginDateAt || null,
              pickerKey: 'start',
            }}
            endPicker={{
              isEnabled: true,
              label: b3Lang('orders.to'),
              defaultValue: filterData?.endDateAt || null,
              pickerKey: 'end',
            }}
            filterMoreInfo={filterInfo}
            handleChange={handleChange}
            handleFilterChange={handleFilterChange}
            pcTotalWidth="100%"
            pcContainerWidth="100%"
            pcSearchContainerWidth="100%"
          />
        </Box>}

        <B3PaginationTable
          columnItems={columnItems}
          rowsPerPageOptions={[10, 20, 30]}
          getRequestList={fetchList}
          searchParams={filterData || {}}
          isCustomRender={false}
          requestLoading={setIsRequestLoading}
          tableKey="orderId"
          pageType="orderListPage"
          isAutoRefresh={isAutoRefresh}
          sortDirection={order}
          orderBy={orderBy}
          sortByFn={handleSetOrderBy}
          showPagination={!isDashBoard}
          renderItem={(row, index) => (
            <OrderItemCard
              key={row.orderNumber}
              item={row}
              index={index}
              allTotal={allTotal}
              filterData={filterData}
              isCompanyOrder={isCompanyOrder}
            />
          )}
          // onClickRow={(item, index) => {
          //   if (index !== undefined) {
          //     goToDetail(item, index);
          //   }
          // }}
          hover
        />
      </Box>
    </B3Spin>
  );
}

export default Order;
