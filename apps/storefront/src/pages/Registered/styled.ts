import styled from '@emotion/styled';
import { Box, Button, TextField } from '@mui/material';

export const StyleTipContainer = styled('p')(() => ({
  margin: '2rem auto',
}));

export const InformationLabels = styled('h3')(() => ({
  margin: '1rem 0',
  display: 'flex',
  justifyContent: 'center',
  fontSize: '34px',
  fontWeight: '400',
}));

export const InformationFourLabels = styled('h4')(() => ({
  font: '500 clamp(16px, 1.04167vw, 30px) / 0.625vw Inter',
  color: 'rgb(25, 25, 25)',
  letterSpacing: '0px',
  lineHeight: '1.25',
}));

export const TipContent = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

export const TipLogin = styled('div')(() => ({
  cursor: 'pointer',
  color: '#1976d2',
  borderBottom: '1px solid #1976d2',
}));

export const RegisterIconText = styled('p')((props: CustomFieldItems) => {
  const { isMobile = false } = props;
  const style = {
    font: 'normal normal normal clamp(14px, 0.8333vw, 20px) / clamp(14px, 1.0417vw, 20px) Inter',
    color: '#191919',
    width: isMobile ? 'clamp(100px,20.8125vw, 200px)' : 'clamp(110px, 7.8125vw, 150px)',
    height: isMobile ? 'clamp(80px, 5.1667vw, 100px)' : 'clamp(40px, 4.1667vw, 100%)',
    minHeight: 'max-content',
    boxShadow: '0px clamp(1px, 0.1042vw, 5px) clamp(3px, 0.3125vw, 10px) #00000014',
    paddingTop: 'clamp(10px, 1.6667vw, 30px)',
    borderRadius: 'clamp(10px, 2.0833vw, 20px) clamp(10px, 2.0833vw, 20px) clamp(2px, 0.3125vw, 5px) clamp(2px, 0.3125vw, 5px)',
    letterSpacing: '0px',
    paddingBottom: 'clamp(2px, 0.4167vw, 10px)',
    backgroundColor: '#FAFAFA',
    lineHeight: '1.25',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 'clamp(10px, 1.6667vw, 30px) clamp(4px, 0.0417vw, 20px)',
  };
  return style;
})

export const RegisteredContainer = styled('div')((props: CustomFieldItems) => {
  const { isMobile = false } = props;
  const style = isMobile
    ? {}
    : {
      paddingInline: '1rem',
      maxWidth: '1600px',
      marginInline: 'auto'
    };

  return style;
});

export const RegisteredImage = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
});


export const FormContainer = styled(Box)({
  width: '537px',
  boxShadow: '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px rgba(0, 0, 0, 0.14), 0px 1px 3px rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
  background: '#FFFFFF',
  margin: '1rem auto',
});

export const BannerSection = styled(Box)({
  backgroundColor: '#F5F5F5',
  padding: '0px 1.66667vw 1.66667vw',
  borderRadius: '4px',
  marginBottom: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
});

export const IconWrapper = styled(Box)({
  backgroundColor: '#FFFFFF',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
});

export const OnboardingSection = styled(Box)({
  width: "100%",
  padding: '1rem',
  borderRadius: '0.625vw 0vw 0vw 0.625vw',
  backgroundColor: '#E7DEFF',
  textAlign: 'center',
});

export const DownloadSection = styled(Box)({
  padding: 'clamp(1px, 3.07292vw, 2rem)',
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '1.66667vw',
  borderRadius: '0.625vw',
  boxShadow: 'rgba(55, 32, 110, 0.1) -0.104167vw 0.260417vw 0.520833vw',
  backgroundColor: 'rgb(255, 255, 255)',
});

export const RegisterButton = styled(Button)({
  backgroundColor: '#5E35B1',
  color: '#FFFFFF',
  textTransform: 'none',
  padding: '0.5rem 2rem',
  '&:hover': {
    backgroundColor: '#4527A0',
  },
});

export const NoCustomerMessage = styled(Box)({
  marginTop: '1rem',
  padding: '1rem',
  backgroundColor: '#F5F5F5',
  borderRadius: '4px',
  textAlign: 'center',
});

export const CustomTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#E0E0E0',
    },
    '&:hover fieldset': {
      borderColor: '#5E35B1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5E35B1',
    },
  },
  '& .MuiInputBase-input': {
    font: 'normal normal 500 (16px, 0.8333333333333334vw, 20px) / 1.0416666666666667vw Inter',
    padding: '18.5px 14px',
  },
  '& .MuiInputBase-input::placeholder': {
    font: 'normal normal 500 (16px, 0.8333333333333334vw, 20px) / 1.0416666666666667vw Inter',
    color: '#A0A0A0',
  },
});

export const CustomLabel = styled(Box)({
  font: 'normal normal normal clamp(14px, 0.7291666666666667vw, 20px) / 0.625vw Inter',
  color: '#333333',
  marginBottom: '0.4166666666666667vw',
  letterSpacing: '0vw',
  display: 'flex',
  alignItems: 'center',
  lineHeight: '1.25',
  '& .required-asterisk': {
    color: 'red',
    marginLeft: '2px',
  },
});