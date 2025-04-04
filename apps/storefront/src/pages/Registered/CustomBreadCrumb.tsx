import React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const CustomBreadcrumbs = () => {
  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ margin: '16px 0' }}
    >
    <Link
      color="primary"
      href="/"
      sx={{ fontSize: '14px' }}
    >
      Home
    </Link>
      <Link
        color="primary"
        href="/become-a-customer"
        sx={{ fontSize: '14px' }}
      >
        Become a customer
      </Link>
      <Typography
        color="text.primary"
        sx={{ fontSize: '14px' }}
      >
        Set up a credit line and credit card account
      </Typography>
    </Breadcrumbs>
  );
};

export default CustomBreadcrumbs;