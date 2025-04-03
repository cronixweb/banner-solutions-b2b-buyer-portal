import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { dispatchEvent } from '@b3/hooks';
import { useB3Lang } from '@b3/lang';
import { Alert, Box, Container, Typography } from '@mui/material';

import { B3Card } from '@/components';
import B3Spin from '@/components/spin/B3Spin';
import { CHECKOUT_URL, PATH_ROUTES } from '@/constants';
import { useTablet } from '@/hooks';
import { CustomStyleContext } from '@/shared/customStyleButton';
import { GlobalContext } from '@/shared/global';
import { getBCForcePasswordReset } from '@/shared/service/b2b';
import { b2bLogin, bcLogin, customerLoginAPI } from '@/shared/service/bc';
import { isLoggedInSelector, useAppDispatch, useAppSelector } from '@/store';
import { setB2BToken } from '@/store/slices/company';
import { CustomerRole, UserTypes } from '@/types';
import { LoginFlagType } from '@/types/login';
import { b2bJumpPath, channelId, loginJump, snackbar, storeHash } from '@/utils';
import b2bLogger from '@/utils/b3Logger';
import { getCurrentCustomerInfo } from '@/utils/loginInfo';

import { type PageProps } from '../PageProps';
import { isLoginFlagType, loginCheckout, LoginConfig, loginType } from './config';
import LoginForm from './LoginForm';
import { useLogout } from './useLogout';

export default function Login(props: PageProps) {
  const { setOpenPage } = props;
  const storeDispatch = useAppDispatch();
  const logout = useLogout();

  const isLoggedIn = useAppSelector(isLoggedInSelector);
  const quoteDetailToCheckoutUrl = useAppSelector(
    ({ quoteInfo }) => quoteInfo.quoteDetailToCheckoutUrl,
  );

  const [isLoading, setLoading] = useState(true);
  const [isTablet] = useTablet();
  const [showTipInfo, setShowTipInfo] = useState<boolean>(true);
  const [flag, setLoginFlag] = useState<LoginFlagType>();
  const [loginAccount, setLoginAccount] = useState<LoginConfig>({
    emailAddress: '',
    password: '',
  });
  const navigate = useNavigate();
  const b3Lang = useB3Lang();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    state: { isCheckout, registerEnabled },
  } = useContext(GlobalContext);

  const {
    state: {
      loginPageButton,
      loginPageDisplay,
      portalStyle: { backgroundColor = 'FEF9F5' },
    },
  } = useContext(CustomStyleContext);

  const { primaryButtonColor, signInButtonText } = loginPageButton;
  const { pageTitle } = loginPageDisplay;

  const loginInfo = {
    loginTitle: pageTitle || b3Lang('login.button.signIn'),
    loginBtn: 'Login',
    btnColor: primaryButtonColor || '#4A3C96',
  };

  useEffect(() => {
    (async () => {
      try {
        const loginFlag = searchParams.get('loginFlag');
        const showTipInfo = searchParams.get('showTip') !== 'false';

        setShowTipInfo(showTipInfo);

        if (isLoginFlagType(loginFlag)) {
          setLoginFlag(loginFlag);
        }

        if (loginFlag === 'invoiceErrorTip') {
          const { tip } = loginType[loginFlag];
          snackbar.error(b3Lang(tip));
        }

        if (loginFlag === 'loggedOutLogin' && isLoggedIn) {
          await logout();
        }

        setLoading(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [b3Lang, isLoggedIn, logout, searchParams]);

  const tipInfo = (loginFlag: LoginFlagType, email = '') => {
    const { tip, alertType } = loginType[loginFlag];

    return {
      message: b3Lang(tip, { email }),
      severity: alertType,
    };
  };

  const getForcePasswordReset = async (email: string) => {
    const forcePasswordReset = await getBCForcePasswordReset(email);

    if (forcePasswordReset) {
      setLoginFlag('resetPassword');
    } else {
      setLoginFlag('accountIncorrect');
    }
  };

  const forcePasswordReset = async (email: string, password: string) => {
    const { errors: bcErrors } = await bcLogin({
      email,
      pass: password,
    });

    if (bcErrors?.[0]) {
      const { message } = bcErrors[0];

      if (message === 'Reset password') {
        getForcePasswordReset(email);
        return true;
      }
    }

    return false;
  };

  const handleLoginSubmit = async (data: LoginConfig) => {
    setLoading(true);
    setLoginAccount(data);
    setSearchParams((prevURLSearchParams) => {
      prevURLSearchParams.delete('loginFlag');
      return prevURLSearchParams;
    });

    if (isCheckout) {
      try {
        const response = await loginCheckout(data);

        if (response.status === 400 && response.type === 'reset_password_before_login') {
          setLoginFlag('resetPassword');
        } else if (response.type === 'invalid_login') {
          setLoginFlag('accountIncorrect');
        } else {
          window.location.href = CHECKOUT_URL;
        }
      } catch (error) {
        b2bLogger.error(error);
        await getForcePasswordReset(data.emailAddress);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const loginData = {
          email: data.emailAddress,
          password: data.password,
          storeHash,
          channelId,
        };

        const isForcePasswordReset = await forcePasswordReset(data.emailAddress, data.password);
        if (isForcePasswordReset) return;

        const {
          login: {
            result: { token, storefrontLoginToken },
            errors,
          },
        } = await b2bLogin({ loginData });

        storeDispatch(setB2BToken(token));
        customerLoginAPI(storefrontLoginToken);

        dispatchEvent('on-login', { storefrontToken: storefrontLoginToken });

        if (errors?.[0] || !token) {
          if (errors?.[0]) {
            const { message } = errors[0];
            if (message === 'Operation cannot be performed as the storefront channel is not live') {
              setLoginFlag('accountPrelaunch');
              setLoading(false);
              return;
            }
          }
          getForcePasswordReset(data.emailAddress);
        } else {
          const info = await getCurrentCustomerInfo(token);

          if (quoteDetailToCheckoutUrl) {
            navigate(quoteDetailToCheckoutUrl);
            return;
          }

          if (
            info?.userType === UserTypes.MULTIPLE_B2C &&
            info?.role === CustomerRole.SUPER_ADMIN
          ) {
            navigate('/dashboard');
            return;
          }
          const isLoginLandLocation = loginJump(navigate);

          if (!isLoginLandLocation) return;

          if (info?.userType === UserTypes.B2C) {
            navigate(PATH_ROUTES.ORDERS);
          }

          const path = b2bJumpPath(info?.role);

          navigate(path);
        }
      } catch (error) {
        snackbar.error(b3Lang('login.loginTipInfo.accountIncorrect'));
      } finally {
        setLoading(false);
      }
    }
  };

  const tip = flag && tipInfo(flag, loginAccount?.emailAddress);

  return (
    <Container maxWidth={false} style={{padding:'0', borderBottom: '4px solid #AE8FFD', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      {/* <B3Card setOpenPage={setOpenPage}> */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isTablet ? 'column' : 'row',
            minHeight: 'max-content',
            marginTop: isTablet ? '80px' : '150px',
            marginInline: isTablet ? '0' : '10vw',
            backgroundColor: '#fff',
            padding: isTablet ? '20px' : '0',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '5.052083333333334vw',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Left Section: Image */}
          <Box
            sx={{
              flex: 2,
              backgroundImage: `url('https://cdn.bannersolutions.com/9d/86/7445ce994144ba60789525b1d4cf/login-rnd-text-959-698.png')`,
              backgroundSize: 'cover',
              width: '100%',
              backgroundPosition: 'bottom left',
              position: 'relative',
              display: isTablet ? 'none' : 'flex',
              alignItems: 'flex-end',
              borderRadius: '12px 0px 0px 12px',
              padding: '30px',
            }}
          >
          </Box>

          {/* Right Section: Login Form */}
          <Box
            sx={{
              flex: 1,
              width: isTablet ? '100%' : '30.833333333333336vw',
              background: ' #FFFFFF 0% 0% no-repeat padding-box',
              boxShadow: '-2px 5px 10px #37206E1A',
              paddingTop: '4.270833333333334vw',
              paddingLeft: '4.166666666666667vw',
              borderRadius: '12px',
              paddingRight: '4.166666666666667vw',
            }}
          >
            <B3Spin isSpinning={isLoading} tip={b3Lang('global.tips.loading')} background="transparent" isFlex={false}>
              <Box sx={{ display: 'block', }}>
                {flag && showTipInfo && tip && (
                  <Alert severity={tip.severity} variant="filled" sx={{ mb: 2 }}>
                    {tip.message}
                  </Alert>
                )}
                {quoteDetailToCheckoutUrl && (
                  <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
                    {b3Lang('login.loginText.quoteDetailToCheckoutUrl')}
                  </Alert>
                )}
                <Typography
                  variant="h4"
                  sx={{
                    font: 'normal normal 600 clamp(22px, 1.6666666666666667vw, 40px) / 0.625vw Inter',
                    color: '#191919',
                    textAlign: 'left',
                    letterSpacing: '0.38px',
                    paddingBottom: '2.604166666666667vw',
                    lineHeight: '1.25',
                  }}
                >
                  Log in to Your Account
                </Typography>
                <LoginForm
                  loginBtn={loginInfo.loginBtn}
                  handleLoginSubmit={handleLoginSubmit}
                  backgroundColor={backgroundColor}
                />
                <Box
                  sx={{
                    mt: 2,
                    mb: 6,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                  }}
                >
                  <Typography variant="body2" sx={{
                    font: 'normal normal normal clamp( 14px, 0.7291666666666667vw, 18px) / 0.8854166666666667vw Inter',
                    color: '#383838',
                    opacity: '1',
                    letterSpacing: '0.63px',
                    textAlign: 'center'
                  }}>
                    New User?{' '}
                    <Link to="/register" style={{ color: '#4A3C96', textDecoration: 'underline', cursor: 'pointer' }}>
                      Register
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </B3Spin>
          </Box>
        </Box>
        {/* Footer */}
        <Box
          sx={{
            padding: '15px',
            textAlign: 'center',
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: '8px',
            width: '100%',
            height: '4.166666666666667vw',
            marginTop: 'auto',
            display: isTablet ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F1EBFF',
          }}
        >
          <Typography variant="body2" sx={{
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 'clamp(14px, 1.0416666666666667vw, 20px)',
            lineHeight: '1.0416666666666667vw',
            color: '#191919',
            opacity: 1,
            marginRight: '3.125vw',
            letterSpacing: '0px',
            display: 'block',
          }}>
            Having trouble logging in?{' '}

          </Typography>
          <Typography variant="body2" sx={{
            fontFamily: 'Inter',
            fontWeight: 500,
            fontSize: 'clamp(14px, 1.0416666666666667vw, 20px)',
            lineHeight: '1.0416666666666667vw',
            color: '#4C4C4C',
            opacity: '1',
            letterSpacing: '0px',
          }}>

            <span role="img" aria-label="phone">
              📞
            </span>{' '}
            Call us @ <a style={{ color: 'rgb(74, 37, 170)', textDecoration: 'underline' }} href='tel:888-362-0750'>888-362-0750</a>

          </Typography>
        </Box>
      {/* </B3Card> */}
    </Container>
  );
}