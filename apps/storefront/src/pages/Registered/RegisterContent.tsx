import React, { useContext, useState, MouseEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useB3Lang } from '@b3/lang';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { getContrastColor } from '@/components/outSideComponents/utils/b3CustomStyles';
import { GlobalContext } from '@/shared/global';
import {
  checkUserBCEmail,
  checkUserEmail,
  createB2BCompanyUser,
  createBCCompanyUser,
  sendSubscribersState,
  uploadB2BFile,
} from '@/shared/service/b2b';
import { channelId, storeHash } from '@/utils';
import b2bLogger from '@/utils/b3Logger';

import { RegisteredContext } from './context/RegisteredContext';
import { deCodeField, emailError, toHump } from './config';
import { BannerSection, CustomLabel, CustomTextField, DownloadSection, FormContainer, IconWrapper, InformationFourLabels, NoCustomerMessage, OnboardingSection, RegisterButton, RegisterIconText } from './styled';
import { RegisterFields } from './types';
import { useTablet } from '@/hooks';
import NotCustomer from './NotCustomer';


interface RegisterContentProps {
  handleFinish: () => void;
  backgroundColor: string;
}

interface RegisterFormData {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
  isExistingCustomer: string;
}
const countries = [
  {
    name: 'United States',
    code: 'us',
    countryCode: '+1',
    flag: 'https://flagcdn.com/16x12/us.png',
  },
  {
    name: 'Canada',
    code: 'ca',
    countryCode: '+1',
    flag: 'https://flagcdn.com/16x12/ca.png',
  },
  {
    name: 'Mexico',
    code: 'mx',
    countryCode: '+52',
    flag: 'https://flagcdn.com/16x12/mx.png',
  },
];
export default function RegisterContent({ handleFinish, backgroundColor }: RegisterContentProps) {
  const b3Lang = useB3Lang();
  const { state, dispatch } = useContext(RegisteredContext);
  const {
    state: { blockPendingAccountOrderCreation },
  } = useContext(GlobalContext);

  const customColor = getContrastColor(backgroundColor);
  const [errorTips, setErrorTips] = useState<string>('');
  const [enterEmail, setEnterEmail] = useState<string>('');
  const [isExistingCustomer, setIsExistingCustomer] = useState<string>('Yes');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    contactInformation = [],
    bcContactInformation = [],
    passwordInformation = [],
    bcPasswordInformation = [],
    accountType,
    addressBasicFields = [],
    bcAddressBasicFields = [],
    companyInformation = [],
    emailMarketingNewsletter,
  } = state;

  const list: RegisterFields[] = accountType === '1' ? contactInformation : bcContactInformation;
  const passwordInfo: RegisterFields[] = accountType === '1' ? passwordInformation : bcPasswordInformation;
  const addressBasicList: RegisterFields[] = accountType === '1' ? addressBasicFields : bcAddressBasicFields;
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to USA
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
  } = useForm<RegisterFormData>({
    mode: 'onSubmit',
    defaultValues: {
      customerId: '',
      firstName: (list.find((item) => item.fieldId === 'field_first_name')?.default as string) || '',
      lastName: (list.find((item) => item.fieldId === 'field_last_name')?.default as string) || '',
      email: (list.find((item) => item.fieldId === 'field_email')?.default as string) || '',
      phoneNumber: (list.find((item) => item.fieldId === 'field_phone')?.default as string) || '',
      countryCode: '+1',
      password: (passwordInfo.find((item) => item.name === 'password')?.default as string) || '',
      confirmPassword: (passwordInfo.find((item) => item.name === 'confirmPassword')?.default as string) || '',
      isExistingCustomer: 'Yes',
    },
  });

  React.useEffect(() => {
    const emailFields = list.find((item) => item.name === 'email');
    setEnterEmail((emailFields?.default as string) || '');
  }, [list]);

  const showLoading = (isShow = false) => {
    dispatch({
      type: 'loading',
      payload: {
        isLoading: isShow,
      },
    });
  };

  const validateEmailValue = async (email: string) => {
    const isRegisterAsB2BUser = accountType === '1';
    try {
      showLoading(true);
      const {
        isValid,
        userType,
        userInfo: { companyName = '' } = {},
      } = isRegisterAsB2BUser
          ? await checkUserEmail({ email, channelId })
          : await checkUserBCEmail({ email, channelId });

      if (!isValid) {
        setErrorTips(
          b3Lang(emailError[userType], {
            companyName: companyName || '',
            email,
          }),
        );
        setError('email', {
          type: 'custom',
          message: '',
        });
      } else {
        setErrorTips('');
      }

      return isValid;
    } catch (error) {
      return false;
    } finally {
      showLoading(false);
    }
  };

  const getBCFieldsValue = (data: RegisterFormData) => {
    const bcFields: any = {};

    bcFields.authentication = {
      force_password_reset: false,
      new_password: data.password,
    };

    bcFields.accepts_product_review_abandoned_cart_emails = emailMarketingNewsletter;

    if (list) {
      list.forEach((item: any) => {
        const name = deCodeField(item.name);
        if (name === 'accepts_marketing_emails') {
          bcFields.accepts_product_review_abandoned_cart_emails = !!item?.default?.length;
        } else if (!item.custom) {
          bcFields[name] = item?.default || '';
        }
      });

      bcFields.form_fields = [];
    }

    bcFields.addresses = [];
    bcFields.origin_channel_id = channelId;
    bcFields.channel_ids = [channelId];

    if (accountType === '2') {
      const addresses: any = {};

      const getBCAddressField = addressBasicList.filter((field: any) => !field.custom);

      if (getBCAddressField) {
        bcFields.addresses = {};
        getBCAddressField.forEach((field: any) => {
          if (field.name === 'country') {
            addresses.country_code = field.default || 'US';
          } else if (field.name === 'state') {
            addresses.state_or_province = field.default;
          } else if (field.name === 'postalCode') {
            addresses.postal_code = field.default;
          } else if (field.name === 'firstName') {
            addresses.first_name = data.firstName;
          } else if (field.name === 'lastName') {
            addresses.last_name = data.lastName;
          } else if (field.name === 'phone') {
            addresses.phone = data.phoneNumber;
          } else {
            addresses[field.name] = field.default;
          }
        });
      }

      addresses.form_fields = [];
      bcFields.addresses = [addresses];
      bcFields.trigger_account_created_notification = true;
    }

    const userItem = {
      storeHash,
      ...bcFields,
    };

    return createBCCompanyUser(userItem);
  };

  const getB2BFieldsValue = async (
    data: RegisterFormData,
    customerId: number | string,
    fileList: any,
  ) => {
    try {
      const b2bFields: any = {};
      b2bFields.customerId = customerId || '';
      b2bFields.storeHash = storeHash;

      const b2bContactInformationList = list || [];
      const companyUserExtraFieldsList = b2bContactInformationList.filter((item) => !!item.custom);

      if (companyUserExtraFieldsList.length) {
        const companyUserExtraFields: Array<any> = [];
        companyUserExtraFieldsList.forEach((item: any) => {
          const itemExtraField: any = {};
          itemExtraField.fieldName = deCodeField(item.name);
          itemExtraField.fieldValue = item?.default || '';
          companyUserExtraFields.push(itemExtraField);
        });
        b2bFields.userExtraFields = companyUserExtraFields;
      }

      const companyInfo = companyInformation.filter(
        (list) => !list.custom && list.fieldType !== 'files',
      );
      const companyExtraInfo = companyInformation.filter((list) => !!list.custom);

      if (companyInfo.length) {
        companyInfo.forEach((item: any) => {
          b2bFields[toHump(deCodeField(item.name))] = item?.default || '';
        });
      }

      if (companyExtraInfo.length) {
        const extraFields: Array<any> = [];
        companyExtraInfo.forEach((item: any) => {
          const itemExtraField: any = {};
          itemExtraField.fieldName = deCodeField(item.name);
          itemExtraField.fieldValue = item?.default || '';
          extraFields.push(itemExtraField);
        });
        b2bFields.extraFields = extraFields;
      }

      const addressBasicInfo = addressBasicList.filter((list) => !list.custom) || [];
      const addressExtraBasicInfo = addressBasicList.filter((list) => !!list.custom) || [];

      if (addressBasicInfo.length) {
        addressBasicInfo.forEach((field: any) => {
          const name = deCodeField(field.name);
          if (name === 'address1') {
            b2bFields.addressLine1 = field.default;
          }
          if (name === 'address2') {
            b2bFields.addressLine2 = field.default;
          }
          if (name === 'firstName') {
            b2bFields.firstName = data.firstName;
          }
          if (name === 'lastName') {
            b2bFields.lastName = data.lastName;
          }
          if (name === 'phone') {
            b2bFields.phone = data.phoneNumber;
          }
          b2bFields[name] = field.default;
        });
      }

      if (addressExtraBasicInfo.length) {
        const extraFields: Array<any> = [];
        addressExtraBasicInfo.forEach((item: any) => {
          const itemExtraField: any = {};
          itemExtraField.fieldName = deCodeField(item.name);
          itemExtraField.fieldValue = item?.default || '';
          extraFields.push(itemExtraField);
        });
        b2bFields.addressExtraFields = extraFields;
      }
      b2bFields.fileList = fileList;
      b2bFields.channelId = channelId;

      return await createB2BCompanyUser(b2bFields);
    } catch (error) {
      b2bLogger.error(error);
    }
    return undefined;
  };

  const getFileUrl = async (attachmentsList: RegisterFields[]) => {
    let attachments: File[] = [];

    if (!attachmentsList.length) return undefined;

    attachmentsList.forEach((field: any) => {
      attachments = field.default;
    });

    try {
      const fileResponse = await Promise.all(
        attachments.map((file: File) =>
          uploadB2BFile({
            file,
            type: 'companyAttachedFile',
          }),
        ),
      );

      const fileList = fileResponse.reduce((fileList: any, res: any) => {
        let list = fileList;
        if (res.code === 200) {
          const newData = {
            ...res.data,
          };
          newData.fileSize = newData.fileSize ? `${newData.fileSize}` : '';
          list = [...fileList, newData];
        } else {
          throw (
            res.data.errMsg || res.message || b3Lang('intl.global.fileUpload.fileUploadFailure')
          );
        }
        return list;
      }, []);

      return fileList;
    } catch (error) {
      b2bLogger.error(error);
      throw error;
    }
  };

  const saveRegisterData = (data: RegisterFormData) => {
    const newContactInfo = list.map((item: RegisterFields) => {
      const newContactItem = { ...item };
      if (item.fieldId === 'field_first_name') {
        newContactItem.default = data.firstName;
      } else if (item.fieldId === 'field_last_name') {
        newContactItem.default = data.lastName;
      } else if (item.fieldId === 'field_email') {
        newContactItem.default = data.email;
      } else if (item.fieldId === 'field_phone') {
        newContactItem.default = `${data.countryCode}${data.phoneNumber}`;
      }
      return newContactItem;
    });

    const newPasswordInfo = passwordInfo.map((item: RegisterFields) => {
      const newPasswordItem = { ...item };
      if (item.name === 'password') {
        newPasswordItem.default = data.password;
      } else if (item.name === 'confirmPassword') {
        newPasswordItem.default = data.confirmPassword;
      }
      return newPasswordItem;
    });

    dispatch({
      type: 'all',
      payload: {
        contactInformation: accountType === '1' ? [...newContactInfo] : contactInformation,
        bcContactInformation: accountType === '2' ? [...newContactInfo] : bcContactInformation,
        passwordInformation: accountType === '1' ? [...newPasswordInfo] : passwordInformation,
        bcPasswordInformation: accountType === '2' ? [...newPasswordInfo] : bcPasswordInformation,
      },
    });
  };

  const handleSendSubscribersState = async () => {
    if (list && list.length > 0) {
      const emailMe = list.find(
        (item: RegisterFields) =>
          item.fieldId === 'field_email_marketing_newsletter' && item.fieldType === 'checkbox',
      );
      const firstName = list.find((item) => item.fieldId === 'field_first_name') || { default: '' };
      const lastName = list.find((item) => item.fieldId === 'field_last_name') || { default: '' };
      const isChecked = emailMe?.isChecked || false;
      const defaultValue = emailMe?.default || [];

      if (isChecked && (defaultValue as Array<string>).length > 0) {
        try {
          await sendSubscribersState({
            storeHash,
            email: enterEmail,
            first_name: firstName.default as string,
            last_name: lastName.default as string,
            channel_id: channelId || 1,
          });
        } catch (err: any) {
          setErrorTips(err?.message || err);
        }
      }
    }
  };

  const handleSubmitForm = (event: MouseEvent) => {
    handleSubmit(async (data: RegisterFormData) => {
      if (!(await validateEmailValue(data.email))) {
        return;
      }

      if (data.password !== data.confirmPassword) {
        setError('confirmPassword', {
          type: 'manual',
          message: b3Lang('global.registerComplete.passwordMatchPrompt'),
        });
        setError('password', {
          type: 'manual',
          message: b3Lang('global.registerComplete.passwordMatchPrompt'),
        });
        return;
      }

      try {
        showLoading(true);
        let isAuto = true;

        const updatedData = {
          ...data,
          phoneNumber: `${data.countryCode}${data.phoneNumber}`,
        };

        saveRegisterData(updatedData);

        if (accountType === '2') {
          await getBCFieldsValue(updatedData);
        } else {
          const attachmentsList = companyInformation.filter((list) => list.fieldType === 'files');
          const fileList = await getFileUrl(attachmentsList || []);
          const res = await getBCFieldsValue(updatedData);
          const {
            customerCreate: { customer: bcData },
          } = res;
          const accountInfo = await getB2BFieldsValue(updatedData, bcData.id, fileList);

          const companyStatus = accountInfo?.companyCreate?.company?.companyStatus || '';
          isAuto = Number(companyStatus) === 1;
        }

        dispatch({
          type: 'finishInfo',
          payload: {
            submitSuccess: true,
            isAutoApproval: isAuto,
            blockPendingAccountOrderCreation,
          },
        });

        await handleSendSubscribersState();
        handleFinish();
      } catch (err: any) {
        setErrorTips(err?.message || err);
      } finally {
        showLoading(false);
      }
    })(event);
  };
  const [isTablet] = useTablet();

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  return (
    <FormContainer boxShadow={'none !important'} width={'100% !important'} >
      <Box sx={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row' }}>
        <Box sx={{
          flex: 1, borderRadius: '0.625vw 0.625vw', overflow: 'hidden', maxWidth: isTablet ? '100%' : '40%', display: 'flex', flexDirection: 'column',
          backgroundColor: '#F5F5F5',

        }}>
          {/* Banner Section */}
          <BannerSection sx={{ marginBottom: '0 !important' }}>
            <Box component="h5" sx={{
              font: 'normal normal 600 clamp(20px, 1.4583333333333335vw, 40px) / 2.1875vw Inter',
              color: '#4C4C4C',
              lineHeight: '1.25'
            }}>
              Banner: Offering a place for your business to flourish
            </Box>
            <Box sx={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <IconWrapper sx={{
                  marginBottom: isTablet ? '-20px !important' : '-30px !important',
                  backgroundColor: 'transparent !important'
                }}>
                  <img src="https://www.bannersolutions.com/icons/Onboarding_CompetetivePricing.svg" alt="Competitive Pricing" style={{ width: isTablet ? 'clamp(40px, 10.91667vw, 200px)' : '2.91667vw' }} />
                </IconWrapper>
                <RegisterIconText isMobile={isTablet}>
                  Competitive pricing
                </RegisterIconText>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <IconWrapper sx={{
                  marginBottom: isTablet ? '-20px !important' : '-30px !important',
                  backgroundColor: 'transparent !important'
                }}>
                  <img src="https://www.bannersolutions.com/icons/Onboarding_RealTimeOrders.svg" alt="Realtime Order Updates" style={{ width: isTablet ? 'clamp(40px, 10.91667vw, 200px)' : '2.91667vw' }} />
                </IconWrapper>
                <RegisterIconText isMobile={isTablet}>
                  Realtime order updates
                </RegisterIconText>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <IconWrapper sx={{
                  marginBottom: isTablet ? '-20px !important' : '-30px !important',
                  backgroundColor: 'transparent !important'
                }}>
                  <img src="https://www.bannersolutions.com/icons/Onboarding_InvoiceManagement.svg" alt="Invoice Management" style={{ width: isTablet ? 'clamp(40px, 10.91667vw, 200px)' : '2.91667vw' }} />
                </IconWrapper>
                <RegisterIconText isMobile={isTablet}>
                  Invoice management
                </RegisterIconText>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <IconWrapper sx={{
                  marginBottom: isTablet ? '-20px !important' : '-30px !important',
                  backgroundColor: 'transparent !important'
                }}>
                  <img src="https://www.bannersolutions.com/icons/Onboarding_UserManagement.svg" alt="User Management" style={{ width: isTablet ? 'clamp(40px, 10.91667vw, 200px)' : '2.91667vw' }} />
                </IconWrapper>
                <RegisterIconText isMobile={isTablet}>
                  User management
                </RegisterIconText>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <IconWrapper sx={{
                  marginBottom: isTablet ? '-20px !important' : '-30px !important',
                  backgroundColor: 'transparent !important'
                }}>
                  <img src="https://www.bannersolutions.com/icons/Onboarding_RequisitionList.svg" alt="Build a Request List" style={{ width: isTablet ? 'clamp(40px, 10.91667vw, 200px)' : '2.91667vw' }} />
                </IconWrapper>
                <RegisterIconText isMobile={isTablet}>
                  Build a request list
                </RegisterIconText>
              </Box>
            </Box>
          </BannerSection>
          {
            !isTablet && (
              <OnboardingSection sx={{ width: '100%', marginTop: 'auto !important' }}>
                <Box component="p" sx={{
                  font: 'normal normal 500 clamp(16px, 1.25vw, 30px) / 0.8854166666666667vw Inter',
                  color: '#191919',
                  height: '1.5104166666666667vw',
                  opacity: '1',
                  marginBottom: '0.36458333333333337vw',
                  letterSpacing: '0vw',
                  textTransform: 'capitalize',
                  lineHeight: '1.25',
                }}>
                  Check Your Onboarding Status
                </Box>
                <Box component="p" sx={{
                  font: 'normal normal 500 clamp(14px, 0.8333333333333334vw, 18px) / 0.8854166666666667vw Inter',
                  color: '#191919',
                  lineHeight: '1.25',
                  letterSpacing: '0vw',
                }}>
                  Email us at <a href='mailto:bdp@bannersolutions.com' style={{ color: '#4A25AA', textDecoration: 'underline' }}>bdp@bannersolutions.com</a>
                </Box>
              </OnboardingSection>
            )
          }
        </Box>

        {/* Form Section */}
        <Box sx={{
          flex: '1.5',
          borderRadius: '0.625vw',
          padding: '2.91667vw 2.29167vw',
          backgroundColor: 'rgb(255, 255, 255)',
          boxShadow: 'rgba(55, 32, 110, 0.1) -0.104167vw 0.260417vw 0.520833vw',
          marginLeft: isTablet ? '0' : '-1.04167vw',
          maxWidth: isTablet ? '100%' : '61%',
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: isTablet ? 'center' : 'start',
            alignItems: isTablet ? 'center' : 'start',
            flexDirection: 'column'
          }}>
            <InformationFourLabels>
              Is your company an existing Banner customer?
            </InformationFourLabels>
            <Controller
              name="isExistingCustomer"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  row
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsExistingCustomer(e.target.value);
                  }}
                  sx={{
                    '& .MuiRadio-root': {
                      color: '#5E35B1',
                      '&.Mui-checked': {
                        color: '#5E35B1',
                      },
                    },
                  }}
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </RadioGroup>
              )}
            />
          </Box>

          {isExistingCustomer === 'Yes' ? (
            <>
              {/* Customer ID field */}
              <Box sx={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: isTablet ? 'column' : 'row' }}>
                <Box sx={{ marginTop: '1rem', flex: 1 }}>
                  <CustomLabel>
                    Customer ID <span className="required-asterisk">*</span>
                  </CustomLabel>
                  <CustomTextField
                    fullWidth
                    variant="outlined"
                    {...control.register('customerId', { required: 'Customer ID is required' })}
                    error={!!errors.customerId}
                    helperText={errors.customerId?.message}
                    placeholder="Enter Customer ID"
                  />
                </Box>
                <Box sx={{ flex: 1 }}></Box>
              </Box>
              <Box component="p" sx={{
                font: 'clamp(14px, 0.729167vw, 20px) / 0.625vw Inter',
                color: 'rgb(76, 76, 76)',
                letterSpacing: '0vw',
                marginTop: '0.208333vw',
                marginBottom: '1.25vw',
                lineHeight: '1.25',
              }}>
                <span style={{ font: '600 clamp(14px, 0.729167vw, 20px) / 0.625vw Inter' }}>Don’t have a customer ID?</span> Apply for one by clicking <a style={{ font: '600 clamp(14px, 0.729167vw, 20px) / 0.625vw Inter', color: '#4A25AA' }} href='#' onClick={(e) => {
                  e.preventDefault();
                  setIsExistingCustomer('No');
                  setValue('isExistingCustomer', 'No'); // Programmatically set the radio button value
                }}>here</a>
              </Box>

              {/* First Name and Last Name */}
              <Box sx={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: isTablet ? 'column' : 'row' }}>
                <Box sx={{ flex: 1 }}>
                  <CustomLabel>
                    First Name <span className="required-asterisk">*</span>
                  </CustomLabel>
                  <CustomTextField
                    fullWidth
                    variant="outlined"
                    {...control.register('firstName', { required: 'First Name is required' })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    placeholder="Enter First Name"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomLabel>
                    Last Name <span className="required-asterisk">*</span>
                  </CustomLabel>
                  <CustomTextField
                    fullWidth
                    variant="outlined"
                    {...control.register('lastName', { required: 'Last Name is required' })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    placeholder="Enter Last Name"
                  />
                </Box>
              </Box>

              {/* Email and Phone Number */}
              <Box sx={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: isTablet ? 'column' : 'row' }}>
                <Box sx={{ flex: 1 }}>
                  <CustomLabel>
                    Username (Email Address) <span className="required-asterisk">*</span>
                  </CustomLabel>
                  <CustomTextField
                    fullWidth
                    variant="outlined"
                    {...control.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Invalid email address',
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    placeholder="Enter Email Address"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomLabel>
                    Phone Number <span className="required-asterisk">*</span>
                  </CustomLabel>
                  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    {/* Country Code and Flag Section */}
                    <Controller
                      name="countryCode"
                      control={control}
                      render={({ field }) => (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: errors.phoneNumber ? '1px solid red' : '1px solid #ccc',
                            borderRight: 'none',
                            borderRadius: '4px 0 0 4px',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            backgroundColor: '#fff',
                            height: '56px',
                          }}
                          onClick={() => setIsDropdownOpen((prev) => !prev)}
                        >
                          <img
                            src={selectedCountry.flag}
                            alt={`${selectedCountry.name} Flag`}
                            style={{ width: '24px', height: '18px', marginRight: '8px' }}
                          />
                          <span style={{ marginRight: '8px' }}>{selectedCountry.countryCode}</span>
                          <Box
                            sx={{
                              borderLeft: '4px solid transparent',
                              borderRight: '4px solid transparent',
                              borderTop: '4px solid #000',
                            }}
                          />
                        </Box>
                      )}
                    />

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          zIndex: 1000,
                          backgroundColor: '#fff',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          width: '150px',
                        }}
                      >
                        {countries.map((country) => (
                          <Box
                            key={country.code}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f0f0f0',
                              },
                            }}
                            onClick={() => {
                              setSelectedCountry(country);
                              setValue('countryCode', country.countryCode);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <img
                              src={country.flag}
                              alt={`${country.name} Flag`}
                              style={{ width: '24px', height: '18px', marginRight: '8px' }}
                            />
                            <span>{country.countryCode}</span>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Phone Number Input */}
                    <Controller
                      name="phoneNumber"
                      control={control}
                      rules={{ required: 'Phone Number is required' }}
                      render={({ field }) => (
                        <CustomTextField
                          fullWidth
                          variant="outlined"
                          autoComplete='off'
                          {...field}
                          name='phoneNumber'
                          error={!!errors.phoneNumber}
                          helperText={errors.phoneNumber?.message}
                          placeholder="Enter phone number"

                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '0 4px 4px 0',
                              height: '56px',
                              '& fieldset': {
                                borderLeft: 'none',
                                borderColor: errors.phoneNumber ? 'red' : '#ccc',
                              },
                              '&:hover fieldset': {
                                borderColor: errors.phoneNumber ? 'red' : '#ccc',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: errors.phoneNumber ? 'red' : '#ccc',
                                borderWidth: '1px',
                              },
                            },
                            '& .MuiOutlinedInput-input': {
                              padding: '16.5px 14px',
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Password and Confirm Password */}
              <Box sx={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: isTablet ? 'column' : 'row' }}>
                <Box sx={{ flex: 1 }}>
                  <CustomLabel>
                    Password <span className="required-asterisk">*</span>
                  </CustomLabel>
                  <CustomTextField
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    {...control.register('password', { required: 'Password is required' })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    placeholder="Enter Password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} edge="end" sx={{ opacity: '0.5' }}>
                            {!showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomLabel>
                    Confirm Password <span className="required-asterisk">*</span>
                  </CustomLabel>
                  <CustomTextField
                    type={showConfirmPassword ? 'text' : 'password'}
                    fullWidth
                    variant="outlined"
                    {...control.register('confirmPassword', { required: 'Confirm Password is required' })}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    placeholder="Enter Password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowConfirmPassword} edge="end" sx={{ opacity: '0.5' }}>
                            {!showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <RegisterButton onClick={handleSubmitForm}>Register</RegisterButton>
              </Box>
            </>
          ) : (
            <NotCustomer ></NotCustomer>
          )}
        </Box>
      </Box>

      {
        isTablet && (
          <OnboardingSection sx={{ width: '100%', marginTop: '0 !important' }}>
            <Box component="p" sx={{
              font: 'normal normal 500 clamp(16px, 1.25vw, 30px) / 0.8854166666666667vw Inter',
              color: '#191919',
              height: '1.5104166666666667vw',
              opacity: '1',
              marginBottom: '0.36458333333333337vw',
              letterSpacing: '0vw',
              lineHeight: '1.25',
              textTransform: 'capitalize',
            }}>
              Check Your Onboarding Status
            </Box>
            <Box component="p" sx={{
              font: 'normal normal 500 clamp(14px, 0.8333333333333334vw, 18px) / 0.8854166666666667vw Inter',
              color: '#191919',
              lineHeight: '1.25',
              letterSpacing: '0vw',
            }}>
              Email us at <a href='mailto:bdp@bannersolutions.com' style={{ color: '#4A25AA', textDecoration: 'underline' }}>bdp@bannersolutions.com</a>
            </Box>
          </OnboardingSection>
        )
      }
      <DownloadSection sx={{ boxShadow: isTablet ? 'none !important' : 'rgba(55, 32, 110, 0.1) -0.104167vw 0.260417vw 0.520833vw', flexDirection: isTablet ? 'column !important' : 'row', justifyContent: isTablet ? 'center !important' : 'space-between !important', alignItems: isTablet ? 'center !important' : 'start !important', gap: isTablet ? '10px ' : '', textAlign: isTablet ? 'center' : 'start' }}>
        <Box>
          <Box component="p" sx={{
            font: '600 clamp(16px, 1.30208vw, 24px) / 0.625vw Inter',
            color: 'rgb(25, 25, 25)',
            lineHeight: '1.25',
            padding: '0px',
            margin: '0px',
            letterSpacing: '0px',
            marginBottom: '0.416667vw',
          }}>
            Do you wish to onboard with Banner Solutions offline?
          </Box>
          <Box component="p" sx={{
            font: 'clamp(12px, 1.04167vw, 20px) / 0.625vw Inter',
            padding: '0px',
            margin: '0px',
            color: 'rgb(25, 25, 25)',
            lineHeight: '1.25',
            letterSpacing: '0px',
          }}>
            Download and fill out the customer application form now!
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="outlined" sx={{
            color: '#4A25AA',
            border: '0.052083333333333336vw solid #4A25AA',
            height: '2.5vw',
            borderRadius: '0.3125vw',
            textTransform: 'none',
            lineHeight: '1.25',
            padding: '20px 30px',
          }} startIcon={<span>⬇</span>}>
            Download
          </Button>

        </Box>
      </DownloadSection>
    </FormContainer>
  );
}