import React from 'react';
import styled from '@emotion/styled';
import { useTablet } from '@/hooks';

const Container = styled.div`
  padding: 0;
`;

interface Props {
  isTablet: boolean;
}

const Heading = styled.h5<Props>`
  font: 500 clamp(16px, 1.04167vw, 22px) / 0.625vw Inter;
  color: rgb(25, 25, 25);
  letter-spacing: 0px;
  margin-top: 2.5vw;
  margin-bottom: clamp(32px, 1.25vw, 50px);
  text-align: ${({ isTablet }: Props) => (isTablet ? 'center' : 'left')};
  line-height: 1.25;
`;

const CardContainer = styled.div<Props>`
  display: flex;
  gap: ${({ isTablet }: Props) => (isTablet ? '0.5rem' : '1.5rem')};
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Card = styled.div`
  width: 47%;
  border-radius: 2px;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardContent = styled.div`
  padding: 0;
  margin-bottom: 2rem;
`;

const IconContainer = styled.div<Props>`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ isTablet }: Props) => (isTablet ? '0' : '2rem')};
`;

const IconWrapper = styled.div<Props>`
  background-color: ${({ isTablet }: Props) => (isTablet ? 'transparent' : '#F1EBFF')};
  border-radius: ${({ isTablet }: Props) =>
    isTablet ? '0' : '0.3125vw 0vw 10.416666666666668vw 10.416666666666668vw'};
  padding: 2rem;
  padding-top: 0;
  width: 6.666666666666667vw;
  display: flex;
  align-items: start;
  justify-content: center;
`;

const IconImage = styled.img`
  width: clamp(48px, 2.5vw, 100px);
  height: clamp(48px, 2.5vw, 100px);
`;

const ContentWrapper = styled.div`
  padding-inline: 1rem;
`;

const CardTitle = styled.h6`
  font: normal normal 600 clamp(14px, 1.0416666666666667vw, 20px) / 0.5729166666666667vw Inter;
  color: #191919;
  margin-bottom: 0.4166666666666667vw;
  letter-spacing: 0vw;
  line-height: 1.25;
`;

const CardDescription = styled.p<Props>`
  font: normal normal normal clamp(12px, 0.7291666666666667vw, 18px) / 1.0416666666666667vw Inter;
  color: #333333;
  margin-bottom: 1.4583333333333335vw;
  letter-spacing: 0vw;
  line-height: 1.25;
  white-space: ${({ isTablet }: Props) => (isTablet ? 'normal' : 'pre-line')};
`;

const OnboardBox = styled.div`
  padding: 0.4166666666666667vw 0.7291666666666667vw;
  border-radius: 0.3125vw;
  margin-bottom: 1.4583333333333335vw;
  background-color: #e5e5e5;
  text-align: center;
  margin-bottom: 2rem;
`;

const OnboardText = styled.p`
  font: normal normal normal clamp(10px, 0.7291666666666667vw, 16px) / 0.78125vw Inter;
  color: #333333;
  letter-spacing: 0vw;
  line-height: 1.25;
  margin: 0;

  span {
    font-weight: 600;
  }
`;

const RequirementsText = styled.p`
  font: normal normal normal clamp(12px, 0.7291666666666667vw, 18px) / 0.8854166666666667vw Inter;
  color: #333333;
  margin-bottom: 0.4166666666666667vw;
  letter-spacing: 0vw;
  line-height: 1.25;

  span {
    font-weight: 600;
  }

  ul {
    padding-left: 10px;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-bottom: 2rem;
  margin-top: auto;
`;

const GetStartedButton = styled.button`
  color: #ffffff;
  border-radius: 0.3125vw;
  padding: 15px 30px;
  background-color: #4a25aa;
  font: normal normal 500 clamp(16px, 0.8333333333333334vw, 22px) / 0.625vw Inter;
  letter-spacing: 0vw;
  line-height: 1.25;
  text-transform: capitalize;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: #3b1e87;
  }
`;

const NotCustomer = () => {
  const [isTablet]: [boolean] = useTablet();

  return (
    <Container>
      <Heading isTablet={isTablet}>
        How would you like to do business with Banner?
      </Heading>

      <CardContainer isTablet={isTablet}>
        {/* Credit Card Only Section */}
        <Card>
          <CardContent>
            <IconContainer isTablet={isTablet}>
              <IconWrapper isTablet={isTablet}>
                <IconImage
                  src="https://www.bannersolutions.com/icons/Onboarding_CreditCardOnly.svg"
                  alt="Credit Card Icon"
                />
              </IconWrapper>
            </IconContainer>
            <ContentWrapper>
              <CardTitle>Credit Card Only</CardTitle>
              <CardDescription isTablet={isTablet}>
                Pay using Credit Card
                {isTablet ? ' ' : '\n'}Request Credit Line anytime in future
              </CardDescription>
              <OnboardBox>
                <OnboardText>
                  Onboard within <span>24 business hours</span>
                </OnboardText>
              </OnboardBox>
              <RequirementsText>
                <span>Requirements:</span>
                <ul>
                  <li>Reseller certificate (optional)</li>
                </ul>
              </RequirementsText>
            </ContentWrapper>
          </CardContent>
          <ButtonContainer>
            <GetStartedButton>Get Started</GetStartedButton>
          </ButtonContainer>
        </Card>

        {/* Credit Line & Credit Card Section */}
        <Card>
          <CardContent>
            <IconContainer isTablet={isTablet}>
              <IconWrapper isTablet={isTablet}>
                <IconImage
                  src="https://www.bannersolutions.com/icons/Onboarding_CreditLine.svg"
                  alt="Credit Line Icon"
                />
              </IconWrapper>
            </IconContainer>
            <ContentWrapper>
              <CardTitle>Credit Line & Credit Card</CardTitle>
              <CardDescription isTablet={isTablet}>
                Pay using either Credit Line or{isTablet ? ' ' : '\n'}Credit Card
              </CardDescription>
              <OnboardBox>
                <OnboardText>
                  Onboard within <span>48 business hours</span>
                </OnboardText>
              </OnboardBox>
              <RequirementsText>
                <span>Requirements:</span>
                <ul>
                  <li>Bank Reference</li>
                  <li>References (2)</li>
                  <li>Reseller certificate (optional)</li>
                </ul>
              </RequirementsText>
            </ContentWrapper>
          </CardContent>
          <ButtonContainer>
            <GetStartedButton>Get Started</GetStartedButton>
          </ButtonContainer>
        </Card>
      </CardContainer>
    </Container>
  );
};

export default NotCustomer;