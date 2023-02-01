const getAccountFormFields = (isMobile: boolean) => {
  const accountFormFields = [
    {
      name: 'label',
      label: 'Address label',
      required: false,
      default: '',
      fieldType: 'text',
      xs: 12,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'firstName',
      label: 'First Name',
      required: false,
      default: '',
      fieldType: 'text',
      xs: isMobile ? 12 : 6,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'lastName',
      label: 'Last Name',
      required: false,
      default: '',
      fieldType: 'text',
      xs: isMobile ? 12 : 6,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'company',
      label: 'Company',
      required: false,
      default: '',
      fieldType: 'text',
      xs: 12,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'country',
      label: 'Country',
      required: false,
      default: '',
      fieldType: 'dropdown',
      options: [],
      xs: 12,
      variant: 'filled',
      size: 'small',
      replaceOptions: {
        label: 'countryName',
        value: 'countryCode',
      },
    },
    {
      name: 'address',
      label: 'Address line 1 ',
      required: false,
      default: '',
      fieldType: 'text',
      xs: 12,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'apartment',
      label: 'Address line 2',
      required: false,
      default: '',
      fieldType: 'text',
      xs: 12,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'city',
      label: 'City',
      required: false,
      default: '',
      fieldType: 'text',
      options: [],
      xs: 12,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'state',
      label: 'State',
      required: false,
      default: '',
      fieldType: 'text',
      options: [],
      xs: isMobile ? 12 : 6,
      variant: 'filled',
      size: 'small',
      replaceOptions: {
        label: 'stateName',
        value: 'stateName',
      },
    },
    {
      name: 'zipCode',
      label: 'Zip code',
      required: false,
      default: '',
      fieldType: 'text',
      options: [],
      xs: isMobile ? 12 : 6,
      variant: 'filled',
      size: 'small',
    },
    {
      name: 'phoneNumber',
      label: 'Phone Number',
      required: false,
      default: '',
      fieldType: 'text',
      xs: 12,
      variant: 'filled',
      size: 'small',
    },
  ]

  return accountFormFields
}

export {
  getAccountFormFields,
}
