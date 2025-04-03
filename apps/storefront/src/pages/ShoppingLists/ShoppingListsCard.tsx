import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useB3Lang } from '@b3/lang';
import styled from '@emotion/styled';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import CustomButton from '@/components/button/CustomButton';
import { rolePermissionSelector, useAppSelector } from '@/store';
import { displayFormat, verifyLevelPermission } from '@/utils';
import { b2bPermissionsMap } from '@/utils/b3CheckPermissions/config';

import { ShoppingListsItemsProps } from './config';
import { ShoppingStatus } from './ShoppingStatus';

export interface OrderItemCardProps {
  item: ShoppingListsItemsProps;
  onEdit: (data: ShoppingListsItemsProps) => void;
  onDelete: (data: ShoppingListsItemsProps) => void;
  onCopy: (data: ShoppingListsItemsProps) => void;
  isPermissions: boolean;
  isB2BUser: boolean;
}

const Flex = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
}));

const FontBold = styled(Typography)(() => ({
  fontWeight: '500',
  paddingRight: '5px',
}));

const FlexItem = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
}));

function ShoppingListsCard(props: OrderItemCardProps) {
  const { item: shoppingList, onEdit, onDelete, onCopy, isPermissions, isB2BUser } = props;
  const b3Lang = useB3Lang();

  const [isCanEditShoppingList, setIsCanEditShoppingList] = useState<boolean>(true);

  const { submitShoppingListPermission, approveShoppingListPermission } =
    useAppSelector(rolePermissionSelector);

  const getEditPermissions = (status: number) => {
    if (submitShoppingListPermission) {
      if (status === 30 || status === 0) return false;
      return true;
    }

    if (status === 40) return true;

    return false;
  };

  const getDeletePermissions = (status: number) => {
    if (submitShoppingListPermission) {
      if (status === 20 || status === 30) return false;
      return true;
    }

    return false;
  };

  const navigate = useNavigate();

  const goToDetail = (shoppingList: ShoppingListsItemsProps) =>
    navigate(`/shoppingList/${shoppingList.id}`, {
      state: {
        from: 'shoppingList',
      },
    });

  useEffect(() => {
    if (isB2BUser) {
      const { companyInfo, customerInfo } = shoppingList;

      const { shoppingListCreateActionsPermission } = b2bPermissionsMap;
      const shoppingListActionsPermission = verifyLevelPermission({
        code: shoppingListCreateActionsPermission,
        companyId: Number(companyInfo?.companyId || 0),
        userId: Number(customerInfo.userId),
      });

      setIsCanEditShoppingList(shoppingListActionsPermission);
    }
  }, [shoppingList, isB2BUser]);

  return (
    <Box
      key={shoppingList.id}
      sx={{
        '& .b2b-card-content': {
          paddingBottom: '16px',
          background:'#F8F8F8',
          p: '15px 12px 12px 24px',
          borderRadius: '4px',
        },
      }}
    >
      <CardContent
        className="b2b-card-content"
        sx={{
          color: '#313440',
        }}
      >
        <Flex>
          
          <Box
            sx={{
              display: `${isPermissions ? 'block' : 'none'}`,
            }}
          >
            {/* {!getEditPermissions(shoppingList.status) && isCanEditShoppingList && (
              <IconButton
                aria-label="edit"
                size="small"
                color='primary'
                sx={{
                  marginRight: '8px',
                }}
                onClick={() => {
                  onEdit(shoppingList);
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            )} */}

            <IconButton
              aria-label="duplicate"
              size="small"
              color='primary'
              onClick={() => {
                onCopy(shoppingList);
              }}
            >
              <ContentCopyIcon fontSize="inherit"
                sx={{
                  p: '1px'
                }}
              />
            </IconButton>
            
            {!getDeletePermissions(shoppingList.status) && isCanEditShoppingList && (
              <IconButton
                aria-label="delete"
                color='primary'
                size="small"
                onClick={() => {
                  onDelete(shoppingList);
                }}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            )}
          </Box>
        </Flex>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(0, 0, 0, 0.87)',
            width: '100%',
            wordBreak: 'break-all',
            fontSize: '15px',
            fontWeight: '600',
          }}
        >
          {shoppingList.name}
        </Typography>
        <Box
          sx={{
            mb: '10px',
            fontSize: '10px',
            fontStyle: 'italic',
            fontWeight: '400',
          }}
        >
           Last saved on {String(displayFormat(shoppingList.updatedAt))}
        </Box>
        <Box
          sx={{
            pt: '8px',
            pb: '20px',
            fontSize: '12px',
          }}
        >
          {isB2BUser &&
            (submitShoppingListPermission ||
              (approveShoppingListPermission && shoppingList.approvedFlag)) && (
              <Box
                sx={{
                  pb: '25px',
                }}
              >
                <ShoppingStatus status={shoppingList.status} />
              </Box>
            )}
          <Box
            sx={{
              width: '100%',
              wordBreak: 'break-all',
            }}
          >
            {shoppingList.description}
          </Box>

          {isB2BUser && (
            <FlexItem
            sx={{
              mb: '8px',
            }}>
              {b3Lang('shoppingLists.card.createdBy')}&nbsp;
              <FontBold fontSize={'12px'}>{shoppingList.customerInfo.firstName} {shoppingList.customerInfo.lastName}</FontBold>
            </FlexItem>
          )}
          
          <FlexItem
            sx={{
              mb: '8px',
            }}>
            {b3Lang('shoppingLists.card.lastActivity')}&nbsp;
            <FontBold fontSize={'12px'}>{`${displayFormat(shoppingList.updatedAt)}`}</FontBold>
          </FlexItem>

          <FlexItem
            sx={{
              mb: '8px',
            }}>
            Total Products:&nbsp;
            <FontBold fontSize={'12px'}>{shoppingList.products.totalCount}</FontBold>
          </FlexItem>

        </Box>

        <CustomButton
            sx={{
              m: '0 0 0 -8px',
              minWidth: 0,
              textTransform: 'none',
              fontSize: '12px',
            }}
            onClick={() => goToDetail(shoppingList)}
          >
            View Project
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M 9,6 9,7 13,11 13,12 9,16 9,17 10,17 15,12 15,11 10,6" fill="#4a25a9" stroke='#4a25a9' strokeWidth='1px'/>
            </svg>
          </CustomButton>

      </CardContent>
    </Box>
  );
}

export default ShoppingListsCard;
