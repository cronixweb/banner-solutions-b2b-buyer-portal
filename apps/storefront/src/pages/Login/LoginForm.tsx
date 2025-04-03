import { SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { useB3Lang } from '@b3/lang';
import { Box, Button, Checkbox, FormControlLabel, Link, TextField, Typography, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { getContrastColor } from '@/components/outSideComponents/utils/b3CustomStyles';
import { getLoginFields, LoginConfig } from './config';
import { useState } from 'react';

interface LoginFormProps {
  loginBtn: string;
  handleLoginSubmit: (data: LoginConfig) => void;
  backgroundColor: string;
}

function LoginForm(props: LoginFormProps) {
  const { loginBtn, handleLoginSubmit, backgroundColor } = props;

  const b3Lang = useB3Lang();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setValue,
    register,
  } = useForm<LoginConfig>({
    mode: 'onSubmit',
    defaultValues: {
      emailAddress: '',
      password: '',
    },
  });

  const handleLoginClick: SubmitHandler<LoginConfig> = (data) => {
    handleLoginSubmit(data);
  };

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  const loginFields = getLoginFields(b3Lang, handleSubmit(handleLoginClick));

  return (
    <Box
      sx={{
        // display: 'flex',
        // flexDirection: 'column',
        // maxWidth: '400px',
      }}
    >
      <form onSubmit={handleSubmit(handleLoginClick)}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ 
            font: 'normal normal normal clamp( 14px, 0.7291666666666667vw, 18px) / 0.625vw Inter',
            color: '#191919',
            textAlign: 'left',
            letterSpacing: '0px',
            paddingBottom: '0.4166666666666667vw',
          }}>
            Username (Email Address)
          </Typography>
          <TextField
            {...register('emailAddress', { required: true })}
            placeholder="Enter your Username"
            fullWidth
            variant="outlined"
            error={!!errors.emailAddress}
            helperText={errors.emailAddress ? 'Email is required' : ''}
            sx={{
              width: '100%',
              border: '0',
              margin: '0',
              display: 'block',
              padding: '6px 0 7px',
              minWidth: '0',
              background: 'none',
              boxSizing: 'content-box',
              animationName: 'mui-auto-fill-cancel',
              letterSpacing: 'inherit',
              animationDuration: '10ms',
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                backgroundColor: '#fff',
                '& fieldset': {
                  borderColor: '#ccc',
                },
                '&:hover fieldset': {
                  borderColor: '#4A3C96',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4A3C96',
                },
              },
              '& .MuiInputBase-input': {
                padding: '18px 14px',
                fontSize: '14px',
              },
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{
            font: 'normal normal normal clamp( 14px, 0.7291666666666667vw, 18px) / 0.625vw Inter',
            color: '#191919',
            textAlign: 'left',
            letterSpacing: '0px',
            paddingBottom: '0.4166666666666667vw',
           }}>
            Password
          </Typography>
          <TextField
            {...register('password', { required: true })}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            fullWidth
            variant="outlined"
            error={!!errors.password}
            helperText={errors.password ? 'Password is required' : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end" style={{opacity: '0.5'}}>
                    {!showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              width: '100%',
              border: '0',
              margin: '0',
              display: 'block',
              padding: '6px 0 7px',
              minWidth: '0',
              background: 'none',
              boxSizing: 'content-box',
              animationName: 'mui-auto-fill-cancel',
              letterSpacing: 'inherit',
              animationDuration: '10ms',
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                backgroundColor: '#fff',
                '& fieldset': {
                  borderColor: '#ccc',
                },
                '&:hover fieldset': {
                  borderColor: '#4A3C96',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#4A3C96',
                },
              },
              '& .MuiInputBase-input': {
                padding: '18px 14px',
                fontSize: '14px',
              },
            }}
          />
          <Typography variant="caption" sx={{ 
            font:' normal normal 600 clamp( 12px, 0.7291666666666667vw, 16px) / 0.8854166666666667vw Inter',
            color: '#646464',
            marginTop: '0.8333333333333334vw',
            textAlign: 'left',
            marginLeft: '0',
            marginBottom: '2.5vw',
            display: 'block',
            letterSpacing: '0px',
            lineHeight: '1.25'
            }}>
            Logging in for first time? <br></br> 
            <span style={{fontWeight: 'normal'}}>Use the default password shared on email</span>
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <FormControlLabel
            control={<Checkbox />}
            label="Remember me"
            sx={{ '& .MuiTypography-root': { 
              font: 'normal normal normal clamp( 12px, 0.7291666666666667vw, 16px) / 0.8854166666666667vw Inter',
              color: '#383838',
              opacity: '1',
              lineHeight: '1.25',
              letterSpacing: '0.63px',
            } }}
          />
          <Link
            component={RouterLink}
            to="/forgotPassword"
            sx={{    
              font: 'normal normal normal clamp( 12px, 0.7291666666666667vw, 16px) / 0.8854166666666667vw Inter',
              color:' #383838',
              opacity: '1',
              letterSpacing: '0px',
              textDecoration: 'underline',
              lineHeight: '1.25',
            }}
          >
            Forgot Password?
          </Link>
        </Box>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            font: 'normal normal 600 clamp(14px, 0.8333333333333334vw, 18px) / 1.0416666666666667vw Inter',
            color: '#ffffff',
            // height: '2.5vw',
            paddingBlock: '16px',
            opacity: '1',
            background: '#4A25AA 0% 0% no-repeat padding-box',
            marginTop: '1.6666666666666667vw',
            borderRadius: '6px',
            letterSpacing: '0px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#3b2e7a',
            },
          }}
        >
          {loginBtn}
        </Button>
      </form>
    </Box>
  );
}

export default LoginForm;